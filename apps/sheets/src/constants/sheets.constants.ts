import type { SheetDocRecord } from '@/types/sheets.types';
import { LocaleType, type IWorkbookData } from '@univerjs/presets';

export const SHEETS_NS = 'sheets';

export const createDefaultWorkbookData = (
  id = `sheet-${crypto.randomUUID()}`,
  title = 'Bảng tính chưa có tiêu đề',
): IWorkbookData => {
  const sheetId = 'sheet-01';
  return {
    id,
    name: title,
    appVersion: '0.23.0',
    locale: LocaleType.EN_US,
    styles: {},
    sheetOrder: [sheetId],
    sheets: {
      [sheetId]: {
        id: sheetId,
        name: 'Sheet1',
        rowCount: 100,
        columnCount: 26,
        cellData: {},
        mergeData: [],
        rowData: {},
        columnData: {},
        hidden: 0,
        freeze: { xSplit: 0, ySplit: 0, startRow: -1, startColumn: -1 },
      },
    },
  };
};

export const createBlankSheetRecord = (title = 'Bảng tính chưa có tiêu đề'): SheetDocRecord => {
  const id = `sheet-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  return {
    id,
    title,
    kind: 'sheets',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    starred: false,
    deletedAt: null,
    data: createDefaultWorkbookData(id, title),
  };
};

