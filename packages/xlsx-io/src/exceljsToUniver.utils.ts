import {
  BorderStyleTypes,
  CellValueType,
  HorizontalAlign,
  LocaleType,
  VerticalAlign,
  WrapStrategy,
  type CellValue,
  type ICellData,
  type IRange,
  type IStyleData,
  type IWorkbookData,
  type IWorksheetData,
} from '@univerjs/core';
import type ExcelJS from 'exceljs';
import { resolveExcelColor } from './exceljs-color.utils';
import { enrichSheetCells } from './exceljs-enrichment.utils';
import { colLetterToNumber } from './exceljs-range.utils';

const BORDER_STYLE_MAP: Record<string, BorderStyleTypes> = {
  thin: BorderStyleTypes.THIN,
  hair: BorderStyleTypes.HAIR,
  dotted: BorderStyleTypes.DOTTED,
  dashed: BorderStyleTypes.DASHED,
  dashDot: BorderStyleTypes.DASH_DOT,
  dashDotDot: BorderStyleTypes.DASH_DOT_DOT,
  double: BorderStyleTypes.DOUBLE,
  medium: BorderStyleTypes.MEDIUM,
  mediumDashed: BorderStyleTypes.MEDIUM_DASHED,
  mediumDashDot: BorderStyleTypes.MEDIUM_DASH_DOT,
  thick: BorderStyleTypes.THICK,
};

const H_ALIGN_MAP: Record<string, HorizontalAlign> = {
  left: HorizontalAlign.LEFT,
  center: HorizontalAlign.CENTER,
  right: HorizontalAlign.RIGHT,
  justify: HorizontalAlign.JUSTIFIED,
};

const V_ALIGN_MAP: Record<string, VerticalAlign> = {
  top: VerticalAlign.TOP,
  middle: VerticalAlign.MIDDLE,
  bottom: VerticalAlign.BOTTOM,
};

const genId = () => `s_${Math.random().toString(36).slice(2, 10)}`;

const convertCellValue = (
  value: ExcelJS.CellValue,
): { v?: CellValue; f?: string; t?: CellValueType } => {
  if (value === null || value === undefined) return {};
  if (typeof value === 'object') {
    if ('formula' in value || 'sharedFormula' in value) {
      const formulaStr =
        'formula' in value && typeof value.formula === 'string'
          ? value.formula.startsWith('=')
            ? value.formula
            : `=${value.formula}`
          : undefined;
      const res = 'result' in value && value.result !== undefined ? value.result : undefined;
      const v = typeof res === 'object' ? undefined : (res as CellValue | undefined);
      return {
        f: formulaStr,
        v: v !== undefined ? v : formulaStr ? undefined : undefined,
        t:
          typeof res === 'number'
            ? CellValueType.NUMBER
            : typeof res === 'boolean'
              ? CellValueType.BOOLEAN
              : CellValueType.STRING,
      };
    }
    if ('text' in value && value.text !== undefined) {
      return { v: value.text, t: CellValueType.STRING };
    }
    if ('richText' in value && Array.isArray(value.richText)) {
      return { v: value.richText.map((r) => r.text).join(''), t: CellValueType.STRING };
    }
    if ('error' in value && value.error !== undefined) {
      return { v: `#${value.error}`, t: CellValueType.STRING };
    }
    if (value instanceof Date) {
      return { v: value.toISOString().split('T')[0], t: CellValueType.STRING };
    }
    return {};
  }
  if (typeof value === 'number') return { v: value, t: CellValueType.NUMBER };
  if (typeof value === 'boolean') return { v: value, t: CellValueType.BOOLEAN };
  return { v: String(value), t: CellValueType.STRING };
};

const buildStyle = (cell: ExcelJS.Cell): IStyleData | undefined => {
  const style: IStyleData = {};
  let hasStyle = false;

  const font = cell.font;
  if (font) {
    if (font.bold) {
      style.bl = 1;
      hasStyle = true;
    }
    if (font.italic) {
      style.it = 1;
      hasStyle = true;
    }
    if (font.size) {
      style.fs = font.size;
      hasStyle = true;
    }
    if (font.name) {
      style.ff = font.name;
      hasStyle = true;
    }
    if (font.underline) {
      style.ul = { s: 1 };
      hasStyle = true;
    }
    if (font.strike) {
      style.st = { s: 1 };
      hasStyle = true;
    }
    const fontColor = resolveExcelColor(font.color);
    if (fontColor) {
      style.cl = { rgb: fontColor };
      hasStyle = true;
    }
  }

  const fill = cell.fill;
  if (fill && fill.type === 'pattern') {
    const fg = (fill as ExcelJS.FillPattern).fgColor;
    const bg = (fill as ExcelJS.FillPattern).bgColor;
    const resolvedColor = resolveExcelColor(fg) || resolveExcelColor(bg);
    if (resolvedColor) {
      style.bg = { rgb: resolvedColor };
      hasStyle = true;
    }
  }

  const border = cell.border;
  if (border) {
    const bd: NonNullable<IStyleData['bd']> = {};
    const edges = [
      ['top', 't'],
      ['bottom', 'b'],
      ['left', 'l'],
      ['right', 'r'],
    ] as const;
    for (const [srcKey, dstKey] of edges) {
      const b = border[srcKey];
      if (b?.style) {
        const s = BORDER_STYLE_MAP[b.style] ?? BorderStyleTypes.THIN;
        const color = resolveExcelColor(b.color) || '#000000';
        bd[dstKey] = { s, cl: { rgb: color } };
        hasStyle = true;
      }
    }
    if (Object.keys(bd).length > 0) {
      style.bd = bd;
      hasStyle = true;
    }
  }

  if (cell.alignment) {
    if (cell.alignment.horizontal) {
      const h = H_ALIGN_MAP[cell.alignment.horizontal];
      if (h) {
        style.ht = h;
        hasStyle = true;
      }
    }
    if (cell.alignment.vertical) {
      const v = V_ALIGN_MAP[cell.alignment.vertical];
      if (v) {
        style.vt = v;
        hasStyle = true;
      }
    }
    if (cell.alignment.wrapText) {
      style.tb = WrapStrategy.WRAP;
      hasStyle = true;
    }
  }

  if (cell.numFmt && cell.numFmt !== 'General') {
    style.n = { pattern: cell.numFmt };
    hasStyle = true;
  }

  return hasStyle ? style : undefined;
};

export const exceljsToUniver = (workbook: ExcelJS.Workbook): IWorkbookData => {
  const styleMap: Record<string, IStyleData> = {};
  const getStyleId = (style: IStyleData | undefined): string | undefined => {
    if (!style) return undefined;
    const key = JSON.stringify(style);
    for (const [id, s] of Object.entries(styleMap)) {
      if (JSON.stringify(s) === key) return id;
    }
    const id = genId();
    styleMap[id] = style;
    return id;
  };

  const sheets: Record<string, Partial<IWorksheetData>> = {};
  const sheetOrder: string[] = [];

  workbook.eachSheet((ws) => {
    const sheetId = genId();
    sheetOrder.push(sheetId);

    const cellData: Record<number, Record<number, ICellData>> = {};
    const colMaxLens: Record<number, number> = {};
    const rowLineCounts: Record<number, number> = {};

    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const r = rowNumber - 1; // 0-indexed for Univer
      let maxLinesInRow = 1;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const c = colNumber - 1; // 0-indexed for Univer
        const { v, f, t } = convertCellValue(cell.value);
        if (v === undefined && f === undefined) return;
        const cellOut: ICellData = {};
        if (f !== undefined) cellOut.f = f;
        if (v !== undefined) cellOut.v = v;
        if (t !== undefined) cellOut.t = t;
        const style = buildStyle(cell);
        const styleId = getStyleId(style);
        if (styleId) cellOut.s = styleId;
        if (!cellData[r]) cellData[r] = {};
        cellData[r][c] = cellOut;

        // Content length and lines tracking
        const strVal = v !== undefined ? String(v) : f ? String(f) : '';
        const lines = strVal.split('\n').length;
        if (lines > maxLinesInRow) maxLinesInRow = lines;
        const len = Math.max(...strVal.split('\n').map((line) => line.length));
        colMaxLens[c] = Math.max(colMaxLens[c] || 0, len);
      });

      if (maxLinesInRow > 1) {
        rowLineCounts[r] = maxLinesInRow;
      }
    });

    enrichSheetCells(ws, cellData, styleMap, getStyleId);

    const mergeData: IRange[] = (ws.model.merges ?? [])
      .map((m) => {
        const match = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(m);
        if (!match) return null;
        const startCol = colLetterToNumber(match[1] as string) - 1;
        const startRow = Number(match[2]) - 1;
        const endCol = colLetterToNumber(match[3] as string) - 1;
        const endRow = Number(match[4]) - 1;
        return {
          startRow,
          startColumn: startCol,
          endRow,
          endColumn: endCol,
        };
      })
      .filter((m): m is IRange => m !== null);

    const rowData: Record<number, { h?: number }> = {};
    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const r = rowNumber - 1;
      const explicitH = row.height;
      const multilineH = rowLineCounts[r] ? rowLineCounts[r] * 20 + 8 : undefined;
      const finalH = explicitH ? Math.max(explicitH, multilineH || explicitH) : multilineH;
      if (finalH) {
        rowData[r] = { h: finalH };
      }
    });

    const columnData: Record<number, { w?: number }> = {};
    const maxCol = Math.max(ws.columnCount || 0, 26);
    for (let c = 1; c <= maxCol; c++) {
      const cIndex = c - 1;
      try {
        const col = ws.getColumn(c);
        if (col?.width && col.width > 0) {
          // Exact Excel width to pixel mapping: (width * 8) + 5
          columnData[cIndex] = { w: Math.max(45, Math.round(col.width * 8) + 5) };
        } else {
          // Auto-calculate width based on max content length
          const maxLen = colMaxLens[cIndex] || 0;
          if (maxLen === 0) {
            columnData[cIndex] = { w: 88 };
          } else if (maxLen <= 3) {
            columnData[cIndex] = { w: 45 };
          } else {
            columnData[cIndex] = { w: Math.min(450, Math.max(80, Math.round(maxLen * 8.5) + 24)) };
          }
        }
      } catch {
        columnData[cIndex] = { w: 88 };
      }
    }

    const frozenView = (ws.views ?? []).find((v) => v.state === 'frozen') as
      | { xSplit?: number; ySplit?: number }
      | undefined;
    const xSplit = Math.max(0, Math.floor(frozenView?.xSplit ?? 0));
    const ySplit = Math.max(0, Math.floor(frozenView?.ySplit ?? 0));

    sheets[sheetId] = {
      id: sheetId,
      name: ws.name,
      rowCount: Math.max((ws.rowCount || 0) + 30, 100),
      columnCount: Math.max((ws.columnCount || 0) + 10, 26),
      cellData,
      mergeData,
      rowData: rowData as IWorksheetData['rowData'],
      columnData: columnData as IWorksheetData['columnData'],
      hidden: 0,
      freeze: {
        xSplit,
        ySplit,
        startRow: ySplit > 0 ? ySplit : -1,
        startColumn: xSplit > 0 ? xSplit : -1,
      },
    };
  });

  return {
    id: genId(),
    name: workbook.title || 'Sheet',
    appVersion: '0.1.0',
    locale: LocaleType.EN_US,
    styles: styleMap,
    sheetOrder,
    sheets,
  };
};
