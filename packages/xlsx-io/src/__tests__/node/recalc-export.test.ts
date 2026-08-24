import ExcelJS from 'exceljs';
import {
  CellValueType,
  LocaleType,
  Univer,
  UniverInstanceType,
  type IWorkbookData,
  type ICellData,
  type IWorksheetData,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';

import '@univerjs/core/facade';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-formula/facade';

import { univerToExceljs } from '../../univerToExceljs.utils';
import { prepareExportSnapshot } from '../../recalculate.utils';

const buildImportedLikeWorkbook = (): IWorkbookData => {
  const mkSheet = (id: string, name: string, cellData: Record<number, Record<number, ICellData>>) =>
    ({
      id,
      name,
      rowCount: 20,
      columnCount: 10,
      cellData,
      freeze: { xSplit: 0, ySplit: 0, startRow: -1, startColumn: -1 },
    }) as Partial<IWorksheetData> as IWorksheetData;

  return {
    id: 'wb-recalc',
    name: 'RecalcTest',
    appVersion: '0.1.0',
    locale: LocaleType.EN_US,
    sheetOrder: ['s1', 's2'],
    styles: {},
    sheets: {
      s1: mkSheet('s1', 'Sheet1', {
        0: { 0: { f: '=SUM(B1:B3)' }, 1: { v: 1, t: CellValueType.NUMBER } },
        1: { 1: { v: 2, t: CellValueType.NUMBER } },
        2: { 1: { v: 3, t: CellValueType.NUMBER } },
        4: { 0: { f: '=Sheet2!B1*2' } },
      }),
      s2: mkSheet('s2', 'Sheet2', {
        0: { 1: { v: 21, t: CellValueType.NUMBER } },
      }),
    },
  };
};

const assert = (cond: boolean, msg: string): void => {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
};

const run = async (): Promise<void> => {
  const univer = new Univer({
    locale: LocaleType.EN_US,
  });
  univer.registerPlugin(UniverDocsPlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin);
  univer.registerPlugin(UniverSheetsPlugin);
  univer.registerPlugin(UniverSheetsFormulaPlugin);
  univer.registerPlugin(UniverSheetsNumfmtPlugin);
  univer.createUnit(UniverInstanceType.UNIVER_SHEET, {});
  const univerAPI: FUniver = FUniver.newAPI(univer);
  univerAPI.createWorkbook(buildImportedLikeWorkbook());

  const snapshot = await prepareExportSnapshot(univerAPI);
  assert(!!snapshot, 'snapshot returned');
  if (!snapshot) throw new Error('no snapshot');

  // Every formula cell in the saved snapshot must carry a computed value
  for (const sheet of Object.values(snapshot.sheets)) {
    for (const row of Object.values(sheet.cellData ?? {})) {
      for (const cell of Object.values(row as Record<string, ICellData>)) {
        if (cell.f) {
          assert(
            cell.v !== undefined && cell.v !== null,
            `formula "${cell.f}" has cached value after recalc`,
          );
        }
      }
    }
  }

  // Exported file must contain cached results readable by ExcelJS
  const buffer = await univerToExceljs(snapshot);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws1 = wb.getWorksheet(1);
  assert(!!ws1, 'worksheet exists');
  const a1 = (ws1?.getCell('A1').value ?? {}) as { result?: number };
  const a5 = (ws1?.getCell('A5').value ?? {}) as { result?: number };
  assert(a1?.result === 6, `SUM(B1:B3)=6 exported (got ${JSON.stringify(a1)})`);
  assert(a5?.result === 42, `cross-sheet Sheet2!B1*2=42 exported (got ${JSON.stringify(a5)})`);

  console.log('RECALC-EXPORT PASS (headless engine + export keep cached values)');
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
