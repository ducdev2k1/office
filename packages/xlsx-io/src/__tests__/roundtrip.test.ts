import fs from 'fs';
import path from 'path';
import { parseXlsxBuffer } from '../parse-xlsx.utils';
import { univerToExceljs } from '../univerToExceljs.utils';
import type { IWorkbookData } from '@univerjs/core';

const SAMPLES = [
  '/home/ducnd/my_project/office/apps/sheets/public/sample-small.xlsx',
  '/home/ducnd/my_project/office/apps/sheets/public/sample-med.xlsx',
];

const loadBuffer = (file: string): ArrayBuffer => {
  const buf = fs.readFileSync(file);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
};

const countCells = (data: IWorkbookData) =>
  Object.values(data.sheets).reduce(
    (acc, s) => acc + Object.values(s.cellData ?? {}).reduce((a, row) => a + Object.keys(row).length, 0),
    0,
  );

const countMerge = (data: IWorkbookData) =>
  Object.values(data.sheets).reduce((a, s) => a + (s.mergeData?.length ?? 0), 0);

const run = async () => {
  for (const file of SAMPLES) {
    const original = await parseXlsxBuffer(loadBuffer(file));
    const exported = await univerToExceljs(original);
    const roundtrip = await parseXlsxBuffer(exported);

    const name = path.basename(file);
    const sheetsOk = Object.keys(original.sheets).length === Object.keys(roundtrip.sheets).length;
    const namesOk = Object.values(original.sheets).every((s, i) => {
      const other = Object.values(roundtrip.sheets)[i];
      return s.name === other?.name;
    });
    const cellsA = countCells(original);
    const cellsB = countCells(roundtrip);
    const cellRatio = cellsA === 0 ? 100 : (cellsB / cellsA) * 100;
    const mergeA = countMerge(original);
    const mergeB = countMerge(roundtrip);
    const mergeRatio = mergeA === 0 ? 100 : (mergeB / mergeA) * 100;
    const styleA = Object.keys(original.styles).length;
    const styleB = Object.keys(roundtrip.styles).length;
    const styleRatio = styleA === 0 ? 100 : (styleB / styleA) * 100;

    const cellA = Object.values(original.sheets)[0]?.cellData?.[0]?.[0];
    const cellB = Object.values(roundtrip.sheets)[0]?.cellData?.[0]?.[0];
    const a1A = JSON.stringify({ v: cellA?.v, t: cellA?.t, f: cellA?.f });
    const a1B = JSON.stringify({ v: cellB?.v, t: cellB?.t, f: cellB?.f });
    const a1Ok = a1A === a1B;

    const fidelity = (cellRatio + mergeRatio + styleRatio) / 3;
    console.log(
      `${name}: sheets=${sheetsOk && namesOk} cells=${cellsA}->${cellsB} (${cellRatio.toFixed(1)}%) ` +
        `merges=${mergeA}->${mergeB} (${mergeRatio.toFixed(1)}%) styles=${styleA}->${styleB} ` +
        `(${styleRatio.toFixed(1)}%) A1=${a1Ok} fidelity=${fidelity.toFixed(1)}%`,
    );

    if (!sheetsOk || !namesOk || cellRatio < 95 || mergeRatio < 95 || styleRatio < 95 || !a1Ok) {
      throw new Error(`${name}: round-trip fidelity too low`);
    }
  }
  console.log('ROUND-TRIP PASS (fidelity >= 95%)');
};

run().catch((e) => { console.error(e); process.exit(1); });