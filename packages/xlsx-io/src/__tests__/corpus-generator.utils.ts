import ExcelJS from 'exceljs';

export interface CorpusFile {
  name: string;
  buffer: ArrayBuffer;
}

const finalize = async (wb: ExcelJS.Workbook, name: string): Promise<CorpusFile> => {
  const buf = await wb.xlsx.writeBuffer();
  // ExcelJS ships its own `Buffer` typings; at runtime in Node this is a real Uint8Array view.
  const raw = buf as unknown as Uint8Array;
  const ab = new ArrayBuffer(raw.byteLength);
  new Uint8Array(ab).set(raw);
  return { name, buffer: ab };
};

const buildValuesSheet = (): ExcelJS.Workbook => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Values');
  ws.getCell('A1').value = 42;
  ws.getCell('A2').value = -3.14;
  ws.getCell('A3').value = 'Tiếng Việt 🇻🇳 text';
  ws.getCell('A4').value = true;
  ws.getCell('A5').value = false;
  ws.getCell('A6').value = '#REF!';
  ws.getCell('A7').value = '2026-08-24';
  ws.getCell('A8').value = '';
  ws.getCell('B1').value = { richText: [{ font: { bold: true }, text: 'Rich' }, { text: 'Text' }] };
  return wb;
};

const buildFormulasSheet = (): ExcelJS.Workbook => {  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Calc');
  const data = wb.addWorksheet('Data');
  data.getCell('B1').value = 21;
  data.getCell('B2').value = 7;

  ws.getCell('B1').value = 1;
  ws.getCell('B2').value = 2;
  ws.getCell('B3').value = 3;
  ws.getCell('A1').value = { formula: 'SUM(B1:B3)', result: 6 };
  ws.getCell('A2').value = { formula: 'IF(B1>0,"dương","âm")', result: 'dương' };
  ws.getCell('A3').value = { formula: 'ROUND(A1/4,2)', result: 1.5 };
  ws.getCell('A4').value = { formula: 'CONCATENATE("x",B3)', result: 'x3' };
  ws.getCell('A5').value = { formula: 'Data!B1*2', result: 42 };
  ws.getCell('A6').value = { formula: 'VLOOKUP(7,Data!B1:B2,1,FALSE)', result: 7 };
  ws.getCell('A7').value = { formula: 'COUNT(B1:B3)', result: 3 };
  ws.getCell('A8').value = { formula: 'TODAY()' };
  return wb;
};

const buildStylesSheet = (): ExcelJS.Workbook => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Styles');
  const set = (ref: string, value: ExcelJS.CellValue, font?: Partial<ExcelJS.Font>): void => {
    const cell = ws.getCell(ref);
    cell.value = value;
    if (font) cell.font = font as ExcelJS.Font;
  };

  set('A1', 'bold', { bold: true });
  set('A2', 'italic', { italic: true });
  set('A3', 'size-name', { size: 14, name: 'Courier New' });
  set('A4', 'underline-strike', { underline: true, strike: true });
  set('A5', 'red', { color: { argb: 'FFFF0000' } });

  const filled = ws.getCell('B1');
  filled.value = 'fill';
  filled.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  const bordered = ws.getCell('C1');
  bordered.value = 'border';
  bordered.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'double', color: { argb: 'FF333333' } },
    left: { style: 'dotted' },
    right: { style: 'medium' },
  };

  const aligned = ws.getCell('D1');
  aligned.value = 'align wrap';
  aligned.alignment = { horizontal: 'center', vertical: 'top', wrapText: true };

  ws.getCell('E1').value = 1234.567;
  ws.getCell('E1').numFmt = '#,##0.00';
  ws.getCell('E2').value = 0.85;
  ws.getCell('E2').numFmt = '0%';
  return wb;
};

const buildMergesSizesSheet = (): ExcelJS.Workbook => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Layout');
  ws.mergeCells('A1:C1');
  ws.getCell('A1').value = 'merged header';
  ws.mergeCells('A3:A5');
  ws.getCell('A3').value = 'vertical';
  ws.mergeCells('B3:C4');
  ws.getCell('B3').value = 'block';
  ws.getRow(2).height = 32;
  ws.getColumn('B').width = 22;
  ws.getColumn('D').width = 40;
  return wb;
};

const buildMultiSheetsWorkbook = (): ExcelJS.Workbook => {
  const wb = new ExcelJS.Workbook();
  wb.addWorksheet('Alpha').getCell('A1').value = 'first';
  const beta = wb.addWorksheet('Beta');
  beta.getCell('A1').value = 'hidden sheet';
  beta.state = 'hidden';
  wb.addWorksheet('Gamma').getCell('A1').value = 'last';
  return wb;
};

const buildFreezeWorkbook = (): ExcelJS.Workbook => {
  const wb = new ExcelJS.Workbook();
  wb.addWorksheet('FreezeRows').views = [{ state: 'frozen', ySplit: 2 }];
  wb.addWorksheet('FreezeCols').views = [{ state: 'frozen', xSplit: 1 }];
  wb.addWorksheet('FreezeBoth').views = [
    { state: 'frozen', xSplit: 2, ySplit: 2, topLeftCell: 'C3' },
  ];
  for (const ws of [wb.getWorksheet(1), wb.getWorksheet(2), wb.getWorksheet(3)]) {
    if (!ws) continue;
    ws.getCell('A1').value = 'anchor';
  }
  return wb;
};

/** Synthetic corpus covering every element of Lớp A (.xlsx) — see CONTEXT.md. */
export const generateCorpus = async (): Promise<CorpusFile[]> => [
  await finalize(buildValuesSheet(), 'class-a-values.xlsx'),
  await finalize(buildFormulasSheet(), 'class-a-formulas.xlsx'),
  await finalize(buildStylesSheet(), 'class-a-styles.xlsx'),
  await finalize(buildMergesSizesSheet(), 'class-a-merges-sizes.xlsx'),
  await finalize(buildMultiSheetsWorkbook(), 'class-a-multi-sheets.xlsx'),
  await finalize(buildFreezeWorkbook(), 'class-a-freeze.xlsx'),
];
