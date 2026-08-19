import assert from 'node:assert/strict';
import { parseXlsxBuffer } from '../parse-xlsx.utils';
import type { XlsxChartSpec } from '../types';
import { univerToExceljs } from '../univerToExceljs.utils';

const sampleData = {
  id: 'test-wb',
  name: 'Test Chart Workbook',
  sheetOrder: ['s1'],
  sheets: {
    s1: {
      id: 's1',
      name: 'Sheet1',
      rowCount: 10,
      columnCount: 10,
      cellData: {
        0: {
          0: { v: 'Tháng' },
          1: { v: 'Doanh thu' },
          2: { v: 'Chi phí' },
        },
        1: {
          0: { v: 'T1' },
          1: { v: 100 },
          2: { v: 60 },
        },
        2: {
          0: { v: 'T2' },
          1: { v: 150 },
          2: { v: 80 },
        },
      },
    },
  },
};

const sampleCharts: XlsxChartSpec[] = [
  {
    id: 'c1',
    title: 'Biểu đồ Doanh thu T1-T2',
    type: 'column',
    sheetId: 's1',
    dataRange: 'A1:C3',
    hasHeaderRow: true,
    hasHeaderColumn: true,
    legend: { show: true, position: 'top' },
    position: {
      fromRow: 4,
      fromCol: 1,
      toRow: 14,
      toCol: 8,
      offsetX: 20,
      offsetY: 20,
      width: 500,
      height: 300,
    },
  },
];

const run = async () => {
  // 1. Export to xlsx buffer with charts
  const buffer = await univerToExceljs(sampleData as any, sampleCharts);
  assert.ok(buffer.byteLength > 0, 'Buffer must not be empty');

  // 2. Parse back from buffer
  const loaded = await parseXlsxBuffer(buffer);
  assert.equal(loaded.name, 'Test Chart Workbook');
  assert.ok(loaded.charts, 'Charts must be loaded back');
  const chart = loaded.charts?.[0];
  assert.ok(chart, 'First chart must exist');
  assert.equal(chart.id, 'c1');
  assert.equal(chart.title, 'Biểu đồ Doanh thu T1-T2');
  assert.equal(chart.type, 'column');
  assert.equal(chart.dataRange, 'A1:C3');

  console.log('CHART ROUND-TRIP TEST PASS');

};

void run();
