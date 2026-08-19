import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { parseXlsxBuffer } from '../parse-xlsx.utils';
import { univerToExceljs } from '../univerToExceljs.utils';

const SAMPLE = '/home/ducnd/my_project/office/apps/sheets/public/sample-med.xlsx';

const loadBuffer = (file: string): ArrayBuffer => {
  const buf = fs.readFileSync(file);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
};

const run = async () => {
  const data = await parseXlsxBuffer(loadBuffer(SAMPLE));
  const out = await univerToExceljs(data);
  if (out.byteLength === 0) throw new Error('exported buffer empty');

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(out);
  const name = path.basename(SAMPLE);
  const ws = wb.getWorksheet('Bao cao');
  if (!ws) throw new Error('sheet "Bao cao" missing');

  const a1 = ws.getCell(1, 1);
  const b2 = ws.getCell(2, 2);
  const c4 = ws.getCell(4, 3);
  const a2 = ws.getCell(2, 1);

  console.log(`${name}: sheets=${wb.worksheets.length}`);
  console.log('  A1 (merged header):', JSON.stringify(a1.value), 'bold=', a1.font?.bold, 'fill=', a1.fill?.type);
  console.log('  B2 (number, numFmt):', JSON.stringify(b2.value), 'fmt=', b2.numFmt);
  console.log('  C4 (formula):', JSON.stringify(c4.value));
  console.log('  A2 (string):', JSON.stringify(a2.value));

  if (wb.worksheets.length !== 3) throw new Error('sheet count mismatch');
  if (a1.font?.bold !== true) throw new Error('header bold missing');
  if (a1.fill?.type !== 'pattern') throw new Error('header fill missing');
  if (typeof c4.value !== 'object' || c4.value === null || !('formula' in c4.value)) {
    throw new Error('formula missing at C4');
  }

  console.log('EXPORT TEST PASS');
};

run().catch((e) => { console.error(e); process.exit(1); });