import { parseXlsxBuffer } from '../parse-xlsx.utils';
import { univerToExceljs } from '../univerToExceljs.utils';
import { generateCorpus } from './corpus-generator.utils';
import { compareWorkbooks } from './fidelity.utils';

const THRESHOLD = 95;

const run = async (): Promise<void> => {
  const corpus = await generateCorpus();
  let failed = false;
  const summary: string[] = [];

  for (const file of corpus) {
    const original = await parseXlsxBuffer(file.buffer);
    const exported = await univerToExceljs(original);
    const roundtrip = await parseXlsxBuffer(exported);

    const report = compareWorkbooks(original, roundtrip);
    const parts = Object.entries(report.groups).map(
      ([group, g]) => `${group}=${g.total === 0 ? 'n/a' : `${report.pct(group).toFixed(1)}% (${g.match}/${g.total})`}`,
    );
    const line = `${file.name}: overall=${report.overall.toFixed(1)}% ${parts.join(' ')}`;
    console.log(line);
    summary.push(line);

    for (const [group, g] of Object.entries(report.groups)) {
      if (g.total > 0 && report.pct(group) < THRESHOLD) {
        failed = true;
        console.error(`  -> group "${group}" below ${THRESHOLD}%`);
      }
    }
    if (report.overall < THRESHOLD) {
      failed = true;
      console.error(`  -> overall below ${THRESHOLD}%`);
    }
  }

  if (failed) throw new Error(`FIDELITY FAIL (threshold ${THRESHOLD}%)`);
  console.log(`FIDELITY PASS — all groups >= ${THRESHOLD}% on Lớp A synthetic corpus`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
