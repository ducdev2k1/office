const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const perf = async (file) => {
  const t0 = Date.now();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(fs.readFileSync(file));
  const t1 = Date.now();
  const sheets = wb.worksheets.length;
  let cells = 0;
  wb.eachSheet((ws) => {
    ws.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, () => { cells++; });
    });
  });
  const t2 = Date.now();
  return {
    file: path.basename(file),
    sizeKB: Math.round(fs.statSync(file).size / 1024),
    sheets,
    cells,
    parseMs: t1 - t0,
    iterateMs: t2 - t1,
  };
};

const main = async () => {
  const dir = '/home/ducnd/my_project/office/apps/sheets/public';
  for (const f of ['sample-small.xlsx', 'sample-med.xlsx', 'sample-large.xlsx']) {
    const r = await perf(path.join(dir, f));
    console.log(`${r.file}: ${r.sizeKB}KB, sheets=${r.sheets}, cells=${r.cells}, parse=${r.parseMs}ms, iterate=${r.iterateMs}ms`);
  }
};
main().catch((e) => { console.error(e); process.exit(1); });