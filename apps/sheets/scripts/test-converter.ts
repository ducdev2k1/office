import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { exceljsToUniver } from '../src/utils/exceljsToUniver.utils';

const run = async (file: string) => {
  const t0 = Date.now();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(fs.readFileSync(file));
  const t1 = Date.now();
  const data = exceljsToUniver(wb);
  const t2 = Date.now();
  const sheets = Object.keys(data.sheets).length;
  const cellCount = Object.values(data.sheets).reduce(
    (acc, s) =>
      acc + Object.values(s.cellData ?? {}).reduce((a, row) => a + Object.keys(row).length, 0),
    0,
  );
  const styleCount = Object.keys(data.styles).length;
  const mergeCount = Object.values(data.sheets).reduce(
    (acc, s) => acc + (s.mergeData?.length ?? 0),
    0,
  );
  const name = path.basename(file);
  const kb = Math.round(fs.statSync(file).size / 1024);
  console.log(
    `${name}: ${kb}KB | sheets=${sheets} cells=${cellCount} styles=${styleCount} merges=${mergeCount} | ` +
      `load=${t1 - t0}ms convert=${t2 - t1}ms total=${t2 - t0}ms`,
  );
  if (!data.id || !data.name || data.sheetOrder.length !== sheets) {
    throw new Error(`invalid workbook envelope for ${name}`);
  }
  for (const sid of data.sheetOrder) {
    const s = data.sheets[sid];
    if (!s || !s.name || !s.cellData) throw new Error(`invalid sheet in ${name}`);
  }
  return data;
};

const main = async () => {
  const dir = '/home/ducnd/my_project/office/apps/sheets/public';
  const data = await run(path.join(dir, 'sample-small.xlsx'));
  await run(path.join(dir, 'sample-med.xlsx'));
  await run(path.join(dir, 'sample-large.xlsx'));
  const firstSheet = data.sheets[data.sheetOrder[0]];
  const header = firstSheet?.cellData?.[1]?.[1];
  console.log('header A1:', JSON.stringify(header));
  const styled = firstSheet?.cellData?.[1]?.[3];
  console.log('header C1 style ref:', styled?.s);
  const formula = firstSheet?.cellData?.[4]?.[3];
  console.log('cell C4 (formula row 4):', JSON.stringify(formula));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
