import ExcelJS from 'exceljs';
import { unzipSync, strFromU8 } from 'fflate';
import type { IWorkbookData, ICellData, IWorksheetData } from '@univerjs/core';
import { CellValueType, LocaleType } from '@univerjs/core';
import { univerToExceljs } from '../univerToExceljs.utils';

const buildWorkbookData = (cellData: Record<number, Record<number, ICellData>>): IWorkbookData => {
  const sheetId = 'sheet-1';
  const sheet: Partial<IWorksheetData> = {
    id: sheetId,
    name: 'Sheet1',
    rowCount: 20,
    columnCount: 10,
    cellData,
    freeze: { xSplit: 0, ySplit: 0, startRow: -1, startColumn: -1 },
  };
  return {
    id: 'wb-1',
    name: 'FormulaTest',
    appVersion: '0.1.0',
    locale: LocaleType.EN_US,
    sheetOrder: [sheetId],
    styles: {},
    sheets: { [sheetId]: sheet as IWorksheetData },
  };
};

const readSheetXml = async (data: IWorkbookData): Promise<string> => {
  const buffer = await univerToExceljs(data);
  const files = unzipSync(new Uint8Array(buffer));
  return strFromU8(files['xl/worksheets/sheet1.xml']!);
};

const loadExported = async (data: IWorkbookData): Promise<ExcelJS.Workbook> => {
  const buffer = await univerToExceljs(data);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  return wb;
};

const assert = (cond: boolean, msg: string): void => {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
};

const run = async () => {
  // Case 1: formula WITHOUT cached result -> <f> present, no bogus cached <v>
  {
    const data = buildWorkbookData({
      0: {
        0: { f: '=SUM(B1:B3)' },
        1: { v: 1, t: CellValueType.NUMBER },
      },
      1: { 1: { v: 2, t: CellValueType.NUMBER } },
      2: { 1: { v: 3, t: CellValueType.NUMBER } },
    });
    const xml = await readSheetXml(data);
    assert(xml.includes('<f>SUM(B1:B3)</f>'), `A1 keeps formula XML (got: ${xml.match(/<c r="A1".*?<\/c>/)?.[0]})`);
    const a1Match = /<c r="A1"[^>]*>.*?<\/c>/.exec(xml)?.[0] ?? '';
    assert(!/<v>/.test(a1Match), `A1 has no cached <v> so Excel recalculates on open (got: ${a1Match})`);

    const wb = await loadExported(data);
    const ws1 = wb.getWorksheet(1);
    assert(!!ws1, 'worksheet exists');
    const a1 = (ws1?.getCell('A1').value ?? null) as { formula?: string; result?: unknown };
    assert(a1 && typeof a1 === 'object' && String(a1.formula).includes('SUM'), 'reloaded A1 formula');
    console.log('PASS: formula without result -> <f> kept, no bogus <v>');
  }

  // Case 2: formula WITH cached result -> result preserved as <v>
  {
    const data = buildWorkbookData({
      0: {
        0: { f: '=SUM(B1:B3)', v: 6, t: CellValueType.NUMBER },
        1: { v: 1, t: CellValueType.NUMBER },
      },
      1: { 1: { v: 2, t: CellValueType.NUMBER } },
      2: { 1: { v: 3, t: CellValueType.NUMBER } },
    });
    const wb = await loadExported(data);
    const ws2 = wb.getWorksheet(1);
    assert(!!ws2, 'worksheet exists (case 2)');
    const a1 = (ws2?.getCell('A1').value ?? null) as
      | { formula?: string; result?: number }
      | null;
    assert(
      !!a1 && typeof a1 === 'object' && a1.result === 6,
      `cached result kept (got ${JSON.stringify(a1)})`,
    );
    console.log('PASS: formula with result=6 preserved');
  }

  console.log('EXPORT-FORMULA PASS');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
