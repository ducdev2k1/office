import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseXlsxBuffer } from '../src/parse-xlsx.utils';
import { univerToExceljs } from '../src/univerToExceljs.utils';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SAMPLES_DIR = path.resolve(HERE, '../../../apps/sheets/public');

interface SampleSpec {
  file: string;
  /** parse + convert only — recorded 2026-08-19 (docs/report-sheets-mvp.md). */
  importBaselineMs: number;
  /** snapshot -> xlsx via ExcelJS — recorded 2026-08-24 on this repo's pipeline. */
  exportBaselineMs: number;
}

const SAMPLES: SampleSpec[] = [
  { file: 'sample-small.xlsx', importBaselineMs: 44, exportBaselineMs: 30 },
  { file: 'sample-med.xlsx', importBaselineMs: 169, exportBaselineMs: 120 },
  { file: 'sample-large.xlsx', importBaselineMs: 1363, exportBaselineMs: 2400 },
];

const THRESHOLD_MULTIPLIER = 2;
const RUNS = 3;

const loadBuffer = (file: string): ArrayBuffer => {
  const buf = fs.readFileSync(file);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
};

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
};

const run = async (): Promise<void> => {
  let failed = false;
  console.log(`Perf check — threshold = ${THRESHOLD_MULTIPLIER}x baseline, median of ${RUNS} runs\n`);

  for (const spec of SAMPLES) {
    const filePath = path.join(SAMPLES_DIR, spec.file);
    if (!fs.existsSync(filePath)) {
      console.error(`${spec.file}: MISSING (${filePath})`);
      failed = true;
      continue;
    }
    const buffer = loadBuffer(filePath);

    // Warmup
    const warm = await parseXlsxBuffer(buffer);
    await univerToExceljs(warm);

    const timingsImport: number[] = [];
    const timingsExport: number[] = [];
    for (let i = 0; i < RUNS; i += 1) {
      let t0 = performance.now();
      const data = await parseXlsxBuffer(buffer);
      timingsImport.push(performance.now() - t0);
      t0 = performance.now();
      await univerToExceljs(data);
      timingsExport.push(performance.now() - t0);
    }

    const importMs = median(timingsImport);
    const exportMs = median(timingsExport);
    const importLimit = spec.importBaselineMs * THRESHOLD_MULTIPLIER;
    const exportLimit = spec.exportBaselineMs * THRESHOLD_MULTIPLIER;
    const statusImport = importMs <= importLimit ? 'PASS' : 'FAIL';
    const statusExport = exportMs <= exportLimit ? 'PASS' : 'FAIL';
    if (importMs > importLimit || exportMs > exportLimit) failed = true;
    console.log(
      `${spec.file}: import ${importMs.toFixed(0)}ms/${importLimit}ms [${statusImport}] · ` +
        `export ${exportMs.toFixed(0)}ms/${exportLimit}ms [${statusExport}]`,
    );
  }

  if (failed) throw new Error('PERF FAIL — regression beyond allowed multiplier');
  console.log('\nPERF PASS');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
