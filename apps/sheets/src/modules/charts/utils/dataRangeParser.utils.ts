import type { ChartSpec, ParsedDataMatrix } from '../types/charts.types';
import type { ICellData, IWorkbookData, IWorksheetData } from '@univerjs/presets';

export interface CellRangeCoord {
  sheetName?: string;
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
}

export const columnLetterToIndex = (col: string): number => {
  let index = 0;
  const upper = col.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
};

export const indexToColumnLetter = (index: number): string => {
  let col = '';
  let temp = index + 1;
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    col = String.fromCharCode(65 + mod) + col;
    temp = Math.floor((temp - mod) / 26);
  }
  return col;
};

export const parseRangeString = (rangeStr: string): CellRangeCoord | null => {
  if (!rangeStr || typeof rangeStr !== 'string') return null;

  const trimmed = rangeStr.trim();
  let sheetName: string | undefined;
  let cellPart = trimmed;

  if (trimmed.includes('!')) {
    const parts = trimmed.split('!');
    if (parts[0]) {
      sheetName = parts[0].replace(/^'|'$/g, '');
    }
    cellPart = parts[1] || '';
  }

  const match = cellPart.match(/^([A-Za-z]+)(\d+)(?::([A-Za-z]+)(\d+))?$/);
  if (!match || !match[1] || !match[2]) return null;

  const startCol = columnLetterToIndex(match[1]);
  const startRow = parseInt(match[2], 10) - 1;
  const endCol = match[3] ? columnLetterToIndex(match[3]) : startCol;
  const endRow = match[4] ? parseInt(match[4], 10) - 1 : startRow;

  return {
    sheetName,
    startCol: Math.min(startCol, endCol),
    startRow: Math.min(startRow, endRow),
    endCol: Math.max(startCol, endCol),
    endRow: Math.max(startRow, endRow),
  };
};

export const formatRangeString = (coord: CellRangeCoord): string => {
  const startLetter = indexToColumnLetter(coord.startCol);
  const endLetter = indexToColumnLetter(coord.endCol);
  const rangePart = `${startLetter}${coord.startRow + 1}:${endLetter}${coord.endRow + 1}`;
  return coord.sheetName ? `'${coord.sheetName}'!${rangePart}` : rangePart;
};

const getCellValue = (cell?: ICellData): string | number => {
  if (!cell) return '';
  if (cell.v !== undefined && cell.v !== null) {
    const num = Number(cell.v);
    if (!isNaN(num) && typeof cell.v !== 'boolean' && String(cell.v).trim() !== '') {
      return num;
    }
    return String(cell.v);
  }
  return '';
};

/**
 * Nhãn dự phòng khi dải ô không có tiêu đề hàng/cột.
 * Component truyền vào để util không phụ thuộc i18n runtime.
 */
export interface DataFallbackLabels {
  /** Mẫu tên chuỗi, ví dụ "Chuỗi {index}" */
  series: string;
  /** Mẫu tên danh mục, ví dụ "Mục {index}" */
  category: string;
}

const DEFAULT_FALLBACK_LABELS: DataFallbackLabels = {
  series: 'Chuỗi {index}',
  category: 'Mục {index}',
};

const fillIndex = (template: string, index: number): string =>
  template.replace('{index}', String(index));

export const extractDataFromWorkbook = (
  workbook: IWorkbookData | undefined | null,
  activeSheetId: string | undefined,
  spec: ChartSpec,
  labels: DataFallbackLabels = DEFAULT_FALLBACK_LABELS,
): ParsedDataMatrix => {
  if (!workbook || !workbook.sheets) {
    return { headers: [], categories: [], seriesData: [] };
  }

  const sheetId = spec.sheetId || activeSheetId || Object.keys(workbook.sheets)[0];
  if (!sheetId) {
    return { headers: [], categories: [], seriesData: [] };
  }

  const worksheet: Partial<IWorksheetData> | undefined = workbook.sheets[sheetId];
  if (!worksheet || !worksheet.cellData) {
    return { headers: [], categories: [], seriesData: [] };
  }

  const range = parseRangeString(spec.dataRange);
  if (!range) {
    return { headers: [], categories: [], seriesData: [] };
  }

  const { startCol, startRow, endCol, endRow } = range;
  const rawMatrix: (string | number)[][] = [];

  for (let r = startRow; r <= endRow; r++) {
    const rowValues: (string | number)[] = [];
    const rowData = worksheet.cellData[r] || {};
    for (let c = startCol; c <= endCol; c++) {
      const cell = rowData[c];
      rowValues.push(getCellValue(cell));
    }
    rawMatrix.push(rowValues);
  }

  if (rawMatrix.length === 0) {
    return { headers: [], categories: [], seriesData: [] };
  }

  const hasHeaderRow = spec.hasHeaderRow && rawMatrix.length > 1;
  const hasHeaderCol = spec.hasHeaderColumn && (rawMatrix[0]?.length ?? 0) > 1;

  let headers: string[] = [];
  let dataRows = rawMatrix;

  if (hasHeaderRow && rawMatrix[0]) {
    const headerRow = rawMatrix[0];
    const sliced = hasHeaderCol ? headerRow.slice(1) : headerRow;
    headers = sliced.map((h) => String(h || ''));
    dataRows = rawMatrix.slice(1);
  } else {
    const colCount = hasHeaderCol ? (rawMatrix[0]?.length ?? 1) - 1 : (rawMatrix[0]?.length ?? 1);
    headers = Array.from({ length: colCount }, (_, i) => fillIndex(labels.series, i + 1));
  }

  const categories: string[] = [];
  const seriesValues: number[][] = headers.map(() => []);

  dataRows.forEach((row, rowIdx) => {
    let cat = fillIndex(labels.category, rowIdx + 1);
    let valCols = row;

    if (hasHeaderCol) {
      cat = String(row[0] || fillIndex(labels.category, rowIdx + 1));
      valCols = row.slice(1);
    }
    categories.push(cat);

    headers.forEach((_, colIdx) => {
      const cellVal = valCols[colIdx];
      const num = typeof cellVal === 'number' ? cellVal : parseFloat(String(cellVal));
      if (!seriesValues[colIdx]) {
        seriesValues[colIdx] = [];
      }
      seriesValues[colIdx].push(isNaN(num) ? 0 : num);
    });
  });

  const seriesData = headers.map((name, i) => ({
    name: name || fillIndex(labels.series, i + 1),
    values: seriesValues[i] || [],
  }));

  return {
    headers,
    categories,
    seriesData,
  };
};
