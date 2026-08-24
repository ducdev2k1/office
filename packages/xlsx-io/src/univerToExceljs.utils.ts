import {
  BorderStyleTypes,
  CellValueType,
  HorizontalAlign,
  VerticalAlign,
  WrapStrategy,
  type IWorkbookData,
  type ICellData,
  type IStyleData,
} from '@univerjs/core';
import ExcelJS from 'exceljs';
import type { XlsxChartSpec } from './types';

const REVERSE_BORDER_STYLE_MAP: Record<number, string> = {
  [BorderStyleTypes.THIN]: 'thin',
  [BorderStyleTypes.HAIR]: 'hair',
  [BorderStyleTypes.DOTTED]: 'dotted',
  [BorderStyleTypes.DASHED]: 'dashed',
  [BorderStyleTypes.DASH_DOT]: 'dashDot',
  [BorderStyleTypes.DASH_DOT_DOT]: 'dashDotDot',
  [BorderStyleTypes.DOUBLE]: 'double',
  [BorderStyleTypes.MEDIUM]: 'medium',
  [BorderStyleTypes.MEDIUM_DASHED]: 'mediumDashed',
  [BorderStyleTypes.MEDIUM_DASH_DOT]: 'mediumDashDot',
  [BorderStyleTypes.SLANT_DASH_DOT]: 'slantDashDot',
  [BorderStyleTypes.THICK]: 'thick',
};

const REVERSE_H_ALIGN_MAP: Record<number, string> = {
  [HorizontalAlign.LEFT]: 'left',
  [HorizontalAlign.CENTER]: 'center',
  [HorizontalAlign.RIGHT]: 'right',
  [HorizontalAlign.JUSTIFIED]: 'justify',
};

const REVERSE_V_ALIGN_MAP: Record<number, string> = {
  [VerticalAlign.TOP]: 'top',
  [VerticalAlign.MIDDLE]: 'middle',
  [VerticalAlign.BOTTOM]: 'bottom',
};

const applyStyle = (cell: ExcelJS.Cell, style: IStyleData | undefined): void => {
  if (!style) return;
  const font: Partial<ExcelJS.Font> = {};
  const hasFont =
    style.bl !== undefined ||
    style.it !== undefined ||
    style.fs !== undefined ||
    style.ff !== undefined ||
    style.ul !== undefined ||
    style.st !== undefined ||
    style.cl?.rgb !== undefined;

  if (hasFont) {
    if (style.bl) font.bold = true;
    if (style.it) font.italic = true;
    if (style.fs) font.size = style.fs;
    if (style.ff) font.name = style.ff;
    if (style.ul) font.underline = style.ul.s ? 'single' : false;
    if (style.st) font.strike = Boolean(style.st.s);
    if (style.cl?.rgb) font.color = { argb: `FF${style.cl.rgb.replace('#', '')}` };
    cell.font = font as ExcelJS.Font;
  }

  if (style.bg?.rgb) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${style.bg.rgb.replace('#', '')}` },
    };
  }

  if (style.bd) {
    const border: Partial<Record<'top' | 'bottom' | 'left' | 'right', Partial<ExcelJS.Border>>> =
      {};
    const edges = [
      ['t', 'top'],
      ['b', 'bottom'],
      ['l', 'left'],
      ['r', 'right'],
    ] as const;
    for (const [srcKey, dstKey] of edges) {
      const b = style.bd[srcKey];
      if (b) {
        border[dstKey] = {
          style: (REVERSE_BORDER_STYLE_MAP[b.s] ?? 'thin') as ExcelJS.Border['style'],
          color: { argb: `FF${b.cl?.rgb?.replace('#', '') ?? '000000'}` },
        };
      }
    }
    if (Object.keys(border).length > 0) cell.border = border as ExcelJS.Borders;
  }

  if (style.ht || style.vt || style.tb) {
    const alignment: Partial<ExcelJS.Alignment> = {};
    if (style.ht)
      alignment.horizontal = REVERSE_H_ALIGN_MAP[style.ht] as ExcelJS.Alignment['horizontal'];
    if (style.vt)
      alignment.vertical = REVERSE_V_ALIGN_MAP[style.vt] as ExcelJS.Alignment['vertical'];
    if (style.tb === WrapStrategy.WRAP) alignment.wrapText = true;
    cell.alignment = alignment as ExcelJS.Alignment;
  }

  if (style.n?.pattern) cell.numFmt = style.n.pattern;
};

const setCellValue = (cell: ExcelJS.Cell, data: ICellData | undefined): boolean => {
  if (!data) return false;
  const { v, f, t } = data;
  if (f) {
    const formulaText = f.startsWith('=') ? f.slice(1) : f;
    const hasResult = v !== undefined && v !== null;
    cell.value = (
      hasResult ? { formula: formulaText, result: v } : { formula: formulaText }
    ) as ExcelJS.CellValue;
    return !hasResult;
  }
  if (t === CellValueType.BOOLEAN) {
    cell.value = typeof v === 'boolean' ? v : Boolean(v);
    return false;
  }
  if (t === CellValueType.NUMBER) {
    cell.value = typeof v === 'number' ? v : Number(v);
    return false;
  }
  if (v === undefined || v === null) {
    cell.value = '';
    return false;
  }
  cell.value = v as ExcelJS.CellValue;
  return false;
};

const toColumnLetter = (col1Based: number): string => {
  let n = col1Based;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
};

export const univerToExceljs = async (
  data: IWorkbookData,
  charts?: XlsxChartSpec[],
): Promise<ArrayBuffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.title = data.name ?? 'Sheet';
  workbook.created = new Date();

  if (charts && charts.length > 0) {
    workbook.description = JSON.stringify({ officeCharts: charts });
  }

  for (const sheetId of data.sheetOrder ?? Object.keys(data.sheets ?? {})) {
    const sheet = data.sheets?.[sheetId];
    if (!sheet?.name) continue;
    const ws = workbook.addWorksheet(sheet.name);
    if (sheet.hidden) ws.state = 'hidden';
    if (sheet.tabColor) ws.properties.tabColor = { argb: sheet.tabColor };

    const freeze = sheet.freeze;
    if (freeze && ((freeze.xSplit ?? 0) > 0 || (freeze.ySplit ?? 0) > 0)) {
      const xSplit = Math.max(0, Math.floor(freeze.xSplit ?? 0));
      const ySplit = Math.max(0, Math.floor(freeze.ySplit ?? 0));
      ws.views = [
        {
          state: 'frozen',
          xSplit,
          ySplit,
          topLeftCell: `${toColumnLetter(xSplit + 1)}${ySplit + 1}`,
        },
      ];
    }

    let missingFormulaResults = 0;
    for (const [rowKey, rowCells] of Object.entries(sheet.cellData ?? {})) {
      const rowNum = Number(rowKey) + 1; // 0-based Univer to 1-based ExcelJS
      const cells = rowCells as Record<string, ICellData> | undefined;
      for (const [colKey, cellData] of Object.entries(cells ?? {})) {
        const colNum = Number(colKey) + 1; // 0-based Univer to 1-based ExcelJS
        const cell = ws.getCell(rowNum, colNum);
        if (setCellValue(cell, cellData)) missingFormulaResults += 1;
        if (cellData?.s) {
          const style = typeof cellData.s === 'string' ? data.styles?.[cellData.s] : cellData.s;
          if (style) applyStyle(cell, style);
        }
      }
    }

    if (missingFormulaResults > 0) {
      // ExcelJS never serializes calcPr (fullCalcOnLoad) to the file; instead it
      // omits <v> for these cells, which makes Excel/LibreOffice recalculate on open.
      console.warn(
        `[xlsx-io] ${missingFormulaResults} formula cell(s) exported without cached result in sheet "${sheet.name}" — consumers recalculate them on open.`,
      );
    }

    for (const merge of sheet.mergeData ?? []) {
      ws.mergeCells(
        merge.startRow + 1,
        merge.startColumn + 1,
        merge.endRow + 1,
        merge.endColumn + 1,
      );
    }

    for (const [rowKey, rowData] of Object.entries(sheet.rowData ?? {})) {
      if (rowData.h) ws.getRow(Number(rowKey) + 1).height = rowData.h;
    }

    for (const [colKey, colData] of Object.entries(sheet.columnData ?? {})) {
      if (colData.w) {
        ws.getColumn(Number(colKey) + 1).width = Math.max(8, Math.round((colData.w - 5) / 8));
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
};
