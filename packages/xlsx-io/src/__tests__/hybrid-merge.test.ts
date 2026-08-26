import assert from 'node:assert';
import { unzipSync, zipSync, strFromU8 } from 'fflate';
import ExcelJS from 'exceljs';
import { exceljsToUniver } from '../exceljsToUniver.utils';
import { exportWorkbookHybrid } from '../hybrid-merge.utils';
import { univerToExceljs } from '../univerToExceljs.utils';

const CHART_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><c:chart><c:title><c:tx><c:rich><a:p><a:r><a:t>Doanh thu quy IV</a:t></a:r></a:p></c:rich></c:tx></c:title><c:plotArea><c:barChart><c:ser><c:tx><c:v>Serie A</c:v></c:tx></c:ser></c:barChart></c:plotArea></c:chart></c:chartSpace>`;

const DRAWING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><xdr:twoCellAnchor><xdr:graphicFrame><xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="Chart 1"/></xdr:nvGraphicFramePr></xdr:graphicFrame></xdr:twoCellAnchor></xdr:wsDr>`;

const bytesEqual = (a: Uint8Array | undefined, b: Uint8Array | undefined): boolean => {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((byte, i) => byte === b[i]);
};

const buildOriginalWithOpaqueParts = async (): Promise<Uint8Array> => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Du lieu');
  ws.getCell('A1').value = 'San pham';
  ws.getCell('B1').value = 123;
  const base = new Uint8Array((await workbook.xlsx.writeBuffer()) as ArrayBuffer);
  const files = unzipSync(base);

  files['xl/charts/chart1.xml'] = new TextEncoder().encode(CHART_XML);
  files['xl/drawings/drawing1.xml'] = new TextEncoder().encode(DRAWING_XML);
  files['xl/drawings/_rels/drawing1.xml.rels'] = new TextEncoder().encode(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/></Relationships>',
  );
  files['[Content_Types].xml'] = new TextEncoder().encode(
    strFromU8(files['[Content_Types].xml']).replace(
      '</Types>',
      '<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>',
    ),
  );

  const sheetXml = strFromU8(files['xl/worksheets/sheet1.xml']);
  assert.ok(sheetXml.includes('xmlns:r='), 'ExcelJS sheet xml phải khai báo namespace r');
  files['xl/worksheets/sheet1.xml'] = new TextEncoder().encode(
    sheetXml.replace('</worksheet>', '<drawing r:id="rIdDrw1"/></worksheet>'),
  );
  files['xl/worksheets/_rels/sheet1.xml.rels'] = new TextEncoder().encode(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdDrw1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>',
  );

  return zipSync(files);
};

const run = async () => {
  const source = await buildOriginalWithOpaqueParts();
  const srcFiles = unzipSync(source);

  const sourceWorkbook = new ExcelJS.Workbook();
  await sourceWorkbook.xlsx.load(source.buffer as ArrayBuffer);
  const snapshot = exceljsToUniver(sourceWorkbook);

  console.log('Test 1: Không có source → rebuild thuần, KHÔNG có part Lớp B');
  const plain = await exportWorkbookHybrid(snapshot);
  const plainFiles = unzipSync(new Uint8Array(plain));
  assert.ok(!plainFiles['xl/charts/chart1.xml'], 'rebuild thuần không được mang part chart');
  console.log('✓ Passed');

  console.log('Test 2: Hybrid — chart/drawing copy nguyên byte');
  const merged = await exportWorkbookHybrid(snapshot, undefined, { sourceBuffer: source });
  const out = unzipSync(new Uint8Array(merged));
  assert.ok(bytesEqual(out['xl/charts/chart1.xml'], srcFiles['xl/charts/chart1.xml']), 'chart1.xml phải giống từng byte');
  assert.ok(bytesEqual(out['xl/drawings/drawing1.xml'], srcFiles['xl/drawings/drawing1.xml']), 'drawing1.xml phải giống từng byte');
  assert.ok(bytesEqual(out['xl/drawings/_rels/drawing1.xml.rels'], srcFiles['xl/drawings/_rels/drawing1.xml.rels']));
  console.log('✓ Passed');

  console.log('Test 3: Sheet XML rebuilt phải có <drawing r:id> trỏ về rels mới');
  const outSheet = strFromU8(out['xl/worksheets/sheet1.xml']);
  assert.ok(/<drawing r:id="(rId\d+)"\/>/.test(outSheet), 'sheet phải tham chiếu drawing');
  const drawingId = /<drawing r:id="(rId\d+)"\/>/.exec(outSheet)?.[1];
  const outRels = strFromU8(out['xl/worksheets/_rels/sheet1.xml.rels']);
  assert.ok(outRels.includes(`Id="${drawingId}"`), 'rels phải chứa id vừa cấp');
  assert.ok(outRels.includes('../drawings/drawing1.xml'), 'rels phải trỏ đúng target gốc');
  console.log('✓ Passed');

  console.log('Test 4: Content types override + default đầy đủ trong file merge');
  const outCt = strFromU8(out['[Content_Types].xml']);
  assert.ok(outCt.includes('/xl/charts/chart1.xml'), 'CT thiếu override chart');
  assert.ok(outCt.includes('/xl/drawings/drawing1.xml'), 'CT thiếu override drawing');
  console.log('✓ Passed');

  console.log('Test 5: File merge mở lại bằng ExcelJS không lỗi, dữ liệu còn nguyên');
  const reopened = new ExcelJS.Workbook();
  await reopened.xlsx.load(merged as ArrayBuffer);
  const ws = reopened.getWorksheet('Du lieu');
  assert.ok(ws, 'mất worksheet sau merge');
  assert.strictEqual(ws?.getCell('A1').value, 'San pham');
  assert.strictEqual(ws?.getCell('B1').value, 123);
  console.log('✓ Passed');

  console.log('\nAll hybrid zip-merge tests passed successfully! ✨');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
