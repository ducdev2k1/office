import type { SheetCellRange } from '@/modules/collab/types/collab.types';
import type { IWorksheetData } from '@univerjs/presets';

export interface SelectionPixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const DEFAULT_ROW_HEIGHT = 24;
const DEFAULT_COL_WIDTH = 80;
const ROW_HEADER_WIDTH = 46; // Univer row index header width
const COL_HEADER_HEIGHT = 26; // Univer column index header height

export const calculateRangePixelRect = (
  range: SheetCellRange,
  worksheet?: Partial<IWorksheetData>,
): SelectionPixelRect => {
  const rowData = worksheet?.rowData || {};
  const columnData = worksheet?.columnData || {};
  const defaultRowHeight = worksheet?.defaultRowHeight || DEFAULT_ROW_HEIGHT;
  const defaultColWidth = worksheet?.defaultColumnWidth || DEFAULT_COL_WIDTH;

  // Calculate Left (sum of cols 0 to startColumn - 1)
  let left = ROW_HEADER_WIDTH;
  for (let c = 0; c < range.startColumn; c++) {
    left += columnData[c]?.w ?? defaultColWidth;
  }

  // Calculate Width (sum of cols startColumn to endColumn)
  let width = 0;
  for (let c = range.startColumn; c <= range.endColumn; c++) {
    width += columnData[c]?.w ?? defaultColWidth;
  }

  // Calculate Top (sum of rows 0 to startRow - 1)
  let top = COL_HEADER_HEIGHT;
  for (let r = 0; r < range.startRow; r++) {
    top += rowData[r]?.h ?? defaultRowHeight;
  }

  // Calculate Height (sum of rows startRow to endRow)
  let height = 0;
  for (let r = range.startRow; r <= range.endRow; r++) {
    height += rowData[r]?.h ?? defaultRowHeight;
  }

  return { left, top, width, height };
};
