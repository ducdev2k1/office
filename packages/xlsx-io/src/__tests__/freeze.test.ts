import ExcelJS from 'exceljs';
import type { IWorkbookData, IWorksheetData } from '@univerjs/core';
import { exceljsToUniver } from '../exceljsToUniver.utils';
import { univerToExceljs } from '../univerToExceljs.utils';

const assert = (cond: boolean, msg: string): void => {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
};

const run = async () => {
  // Case 1: IMPORT — ExcelJS frozen view -> Univer freeze config
  {
    const src = new ExcelJS.Workbook();
    const ws = src.addWorksheet('Frozen');
    ws.views = [{ state: 'frozen', xSplit: 2, ySplit: 1 }];
    ws.getCell('A1').value = 'head';

    const data = exceljsToUniver(src);
    const sheet = Object.values(data.sheets)[0] as IWorksheetData;
    assert(
      sheet.freeze?.xSplit === 2 && sheet.freeze.ySplit === 1,
      `freeze splits imported (got ${JSON.stringify(sheet.freeze)})`,
    );
    assert(
      sheet.freeze.startRow === 1 && sheet.freeze.startColumn === 2,
      `freeze scroll start = first unfrozen cell (got ${JSON.stringify(sheet.freeze)})`,
    );
    console.log('PASS: import maps frozen view to Univer freeze');
  }

  // Case 2: EXPORT — Univer freeze config -> ExcelJS frozen view
  {
    const data: IWorkbookData = {
      id: 'wb-fz',
      name: 'FreezeTest',
      appVersion: '0.1.0',
      locale: 'enUS' as IWorkbookData['locale'],
      sheetOrder: ['s1'],
      styles: {},
      sheets: {
        s1: {
          id: 's1',
          name: 'Frozen',
          rowCount: 20,
          columnCount: 10,
          cellData: { 0: { 0: { v: 'head', t: 'string' as never } } },
          freeze: { xSplit: 2, ySplit: 1, startRow: 1, startColumn: 2 },
        } as unknown as IWorksheetData,
      },
    };

    const buffer = await univerToExceljs(data);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const view = (wb.getWorksheet(1)?.views?.[0] ?? {}) as {
      state?: string;
      xSplit?: number;
      ySplit?: number;
    };
    assert(view.state === 'frozen', `view frozen (got ${JSON.stringify(view)})`);
    assert(view.xSplit === 2, `xSplit=2 exported (got ${JSON.stringify(view)})`);
    assert(view.ySplit === 1, `ySplit=1 exported (got ${JSON.stringify(view)})`);
    console.log('PASS: export writes frozen pane view');
  }

  // Case 3: no freeze -> plain view, no frozen state leaking
  {
    const src = new ExcelJS.Workbook();
    src.addWorksheet('Plain');
    const data = exceljsToUniver(src);
    const sheet = Object.values(data.sheets)[0] as IWorksheetData;
    assert(
      !sheet.freeze || (sheet.freeze.xSplit === 0 && sheet.freeze.ySplit === 0),
      `no freeze on plain sheet (got ${JSON.stringify(sheet.freeze)})`,
    );
    console.log('PASS: plain sheet has no freeze');
  }

  console.log('FREEZE PASS');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
