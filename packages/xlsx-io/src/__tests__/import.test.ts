import fs from 'fs';
import path from 'path';
import { parseXlsxBuffer } from '../parse-xlsx.utils';

const SAMPLES = [
  '/home/ducnd/my_project/office/apps/sheets/public/sample-small.xlsx',
  '/home/ducnd/my_project/office/apps/sheets/public/sample-med.xlsx',
  '/home/ducnd/my_project/office/apps/sheets/public/sample-large.xlsx',
];

const countCells = (data: import('@univerjs/core').IWorkbookData) =>
  Object.values(data.sheets).reduce(
    (acc, s) => acc + Object.values(s.cellData ?? {}).reduce((a, row) => a + Object.keys(row).length, 0),
    0,
  );

const run = async () => {
  for (const file of SAMPLES) {
    const buffer = fs.readFileSync(file).buffer.slice(
      fs.readFileSync(file).byteOffset,
      fs.readFileSync(file).byteOffset + fs.readFileSync(file).byteLength,
    );
    const data = await parseXlsxBuffer(buffer as ArrayBuffer);
    const name = path.basename(file);
    const sheetCount = Object.keys(data.sheets).length;
    const cellCount = countCells(data);
    const styleCount = Object.keys(data.styles).length;
    const mergeCount = Object.values(data.sheets).reduce((a, s) => a + (s.mergeData?.length ?? 0), 0);

    if (!data.id || !data.name) throw new Error(`${name}: envelope invalid`);
    if (data.sheetOrder.length !== sheetCount) throw new Error(`${name}: sheetOrder mismatch`);
    for (const sid of data.sheetOrder) {
      const s = data.sheets[sid];
      if (!s?.name || !s.cellData) throw new Error(`${name}: sheet ${sid} invalid`);
    }

    console.log(`${name}: sheets=${sheetCount} cells=${cellCount} styles=${styleCount} merges=${mergeCount} PASS`);
  }
};

run().catch((e) => { console.error(e); process.exit(1); });