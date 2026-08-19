const ExcelJS = require('exceljs');
const path = require('path');

const makeSample = async (file, { rows, cols, sheets }) => {
  const wb = new ExcelJS.Workbook();
  wb.title = 'Office Survey';
  for (let s = 0; s < sheets; s++) {
    const ws = wb.addWorksheet(s === 0 ? 'Bao cao' : `Sheet ${s + 1}`);
    ws.columns = Array.from({ length: cols }, (_, i) => ({
      header: `Col ${String.fromCharCode(65 + i)}`,
      width: i === 0 ? 28 : 12,
    }));
    const headerRow = ws.getRow(1);
    headerRow.height = 24;
    for (let c = 1; c <= cols; c++) {
      const cell = headerRow.getCell(c);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };
    }
    for (let r = 2; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const cell = ws.getCell(r, c);
        if (c === 1) {
          cell.value = `Hang ${r}`;
        } else if (c === 2) {
          cell.value = r * 1.5;
          cell.numFmt = '#,##0.00';
        } else if (c === 3 && r % 2 === 0) {
          cell.value = { formula: `B${r}*2` };
        } else {
          cell.value = `D${r}C${c}`;
        }
      }
    }
    ws.getCell(rows, 1).border = { top: { style: 'medium', color: { argb: 'FFFF0000' } } };
  }
  ws = wb.getWorksheet('Bao cao');
  if (ws) ws.mergeCells('A1:C1');
  await wb.xlsx.writeFile(file);
  console.log('written', file);
};

const main = async () => {
  const dir = '/home/ducnd/my_project/office/apps/sheets/public';
  await makeSample(path.join(dir, 'sample-small.xlsx'), { rows: 50, cols: 6, sheets: 2 });
  await makeSample(path.join(dir, 'sample-med.xlsx'), { rows: 1000, cols: 10, sheets: 3 });
  await makeSample(path.join(dir, 'sample-large.xlsx'), { rows: 10000, cols: 20, sheets: 2 });
};
main().catch((e) => { console.error(e); process.exit(1); });