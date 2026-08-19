import { createBlankSheetRecord, createDefaultWorkbookData } from '@/constants/sheets.constants';
import { DEFAULT_PALETTES } from '@/modules/charts/constants/charts.constants';
import type { ChartSpec } from '@/modules/charts/types/charts.types';
import { parseXlsxFile } from '@/services/xlsx.service';
import type { SheetDocRecord } from '@/types/sheets.types';
import { createDocumentStore, type StoredDocument } from '@office/storage-adapter';
import { CellValueType, LocaleType, type IWorkbookData } from '@univerjs/presets';

export interface XlsxSourceRecord extends StoredDocument {
  id: string;
  blob: Blob;
  originalName: string;
}

export const documentStore = createDocumentStore<SheetDocRecord>('sheets-documents');
export const xlsxSourceStore = createDocumentStore<XlsxSourceRecord>('sheets-sources');

const buildSampleWorkbook = (id: string, name: string): IWorkbookData => {
  const sheetId = 'sheet-01';
  return {
    id,
    name,
    appVersion: '0.23.0',
    locale: LocaleType.EN_US,
    styles: {
      s1: { bl: 1, fs: 11, bg: { rgb: '#f3f4f6' } },
      s2: { bl: 1, fs: 12, bg: { rgb: '#e0e7ff' } },
    },
    sheetOrder: [sheetId],
    sheets: {
      [sheetId]: {
        id: sheetId,
        name: 'Trang tính 1',
        rowCount: 100,
        columnCount: 26,
        cellData: {
          0: {
            0: { v: 'BÁO CÁO THU CHI DỰ ÁN', s: 's2', t: CellValueType.STRING },
          },
          2: {
            0: { v: 'STT', s: 's1', t: CellValueType.STRING },
            1: { v: 'Hạng mục công việc', s: 's1', t: CellValueType.STRING },
            2: { v: 'Số lượng', s: 's1', t: CellValueType.STRING },
            3: { v: 'Đơn giá (VNĐ)', s: 's1', t: CellValueType.STRING },
            4: { v: 'Thành tiền', s: 's1', t: CellValueType.STRING },
          },
          3: {
            0: { v: 1, t: CellValueType.NUMBER },
            1: { v: 'Thiết kế giao diện UI/UX', t: CellValueType.STRING },
            2: { v: 1, t: CellValueType.NUMBER },
            3: { v: 15000000, t: CellValueType.NUMBER },
            4: { f: '=C4*D4', v: 15000000, t: CellValueType.NUMBER },
          },
          4: {
            0: { v: 2, t: CellValueType.NUMBER },
            1: { v: 'Lập trình Frontend React', t: CellValueType.STRING },
            2: { v: 2, t: CellValueType.NUMBER },
            3: { v: 20000000, t: CellValueType.NUMBER },
            4: { f: '=C5*D5', v: 40000000, t: CellValueType.NUMBER },
          },
          5: {
            0: { v: 3, t: CellValueType.NUMBER },
            1: { v: 'Tích hợp Univer Sheets & ExcelJS', t: CellValueType.STRING },
            2: { v: 1, t: CellValueType.NUMBER },
            3: { v: 18000000, t: CellValueType.NUMBER },
            4: { f: '=C6*D6', v: 18000000, t: CellValueType.NUMBER },
          },
          6: {
            1: { v: 'Tổng cộng', s: 's1', t: CellValueType.STRING },
            4: { f: '=SUM(E4:E6)', v: 73000000, s: 's1', t: CellValueType.NUMBER },
          },
        },
        mergeData: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 5 }],
        rowData: { 0: { h: 32 }, 2: { h: 28 } },
        columnData: { 0: { w: 60 }, 1: { w: 260 }, 2: { w: 100 }, 3: { w: 140 }, 4: { w: 160 } },
        hidden: 0,
        freeze: { xSplit: 0, ySplit: 0, startRow: -1, startColumn: -1 },
      },
    },
  };
};

const sampleChart: ChartSpec = {
  id: 'chart-sample-budget-1',
  title: 'Thành tiền theo Hạng mục công việc',
  type: 'column',
  sheetId: 'sheet-01',
  dataRange: 'B3:E6',
  hasHeaderRow: true,
  hasHeaderColumn: true,
  series: [],
  legend: {
    show: true,
    position: 'top',
  },
  position: {
    fromRow: 8,
    fromCol: 1,
    toRow: 24,
    toCol: 8,
    offsetX: 40,
    offsetY: 260,
    width: 520,
    height: 300,
  },
  palette: DEFAULT_PALETTES.inet,
  isSmooth: true,
  isStacked: false,
};

export const starterSheets: SheetDocRecord[] = [
  {
    id: 'sheet-sample-budget',
    title: 'Báo cáo thu chi dự án',
    kind: 'sheets',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
    starred: true,
    deletedAt: null,
    data: buildSampleWorkbook('sheet-sample-budget', 'Báo cáo thu chi dự án'),
    charts: [sampleChart],
  },
  {
    id: 'sheet-sample-blank',
    title: 'Bảng tính kế hoạch Q3',
    kind: 'sheets',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastOpenedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    starred: false,
    deletedAt: null,
    data: createDefaultWorkbookData('sheet-sample-blank', 'Bảng tính kế hoạch Q3'),
    charts: [],
  },
];

export const loadSheets = async (): Promise<SheetDocRecord[]> => {
  try {
    const stored = await documentStore.list();
    if (stored.length === 0) {
      await documentStore.putMany(starterSheets);
      return starterSheets;
    }
    return stored;
  } catch {
    return starterSheets;
  }
};

export const saveSheets = async (sheets: SheetDocRecord[]): Promise<void> => {
  await documentStore.putMany(sheets);
};

export const saveSheet = async (sheet: SheetDocRecord): Promise<void> => {
  await documentStore.put(sheet);
};

export const getSheet = async (id: string): Promise<SheetDocRecord | undefined> => {
  return documentStore.get(id);
};

export const deleteSheetRecord = async (id: string): Promise<void> => {
  await documentStore.delete(id);
  await xlsxSourceStore.delete(id);
};

export const saveXlsxSource = async (
  id: string,
  blob: Blob,
  originalName: string,
): Promise<void> => {
  await xlsxSourceStore.put({
    id,
    blob,
    originalName,
    title: originalName,
    updatedAt: new Date().toISOString(),
  });
};

export const importSheetFile = async (file: File): Promise<SheetDocRecord> => {
  const data = await parseXlsxFile(file);
  const now = new Date().toISOString();
  const id = `sheet-${crypto.randomUUID()}`;
  const title = file.name.replace(/\.[^/.]+$/, '') || 'Bảng tính đã nhập';

  const record: SheetDocRecord = {
    id,
    title,
    kind: 'sheets',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    starred: false,
    deletedAt: null,
    data: {
      ...data,
      id,
      name: title,
    },
    charts: (data.charts as ChartSpec[]) || [],
    originalFileName: file.name,
  };

  await saveSheet(record);
  await saveXlsxSource(id, file, file.name);
  return record;
};

export const createBlankSheet = (title?: string): SheetDocRecord => {
  return createBlankSheetRecord(title);
};

export const getStorageUsageBytes = (sheets: SheetDocRecord[]): number => {
  return JSON.stringify(sheets).length;
};
