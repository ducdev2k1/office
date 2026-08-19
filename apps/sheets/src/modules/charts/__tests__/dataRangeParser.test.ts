import assert from 'node:assert/strict';
import {
  columnLetterToIndex,
  extractDataFromWorkbook,
  formatRangeString,
  indexToColumnLetter,
  parseRangeString,
} from '../utils/dataRangeParser.utils';
import type { ChartSpec } from '../types/charts.types';

const run = () => {
  // Test columnLetterToIndex & indexToColumnLetter
  assert.equal(columnLetterToIndex('A'), 0);
  assert.equal(columnLetterToIndex('B'), 1);
  assert.equal(columnLetterToIndex('Z'), 25);
  assert.equal(columnLetterToIndex('AA'), 26);
  assert.equal(columnLetterToIndex('AB'), 27);

  assert.equal(indexToColumnLetter(0), 'A');
  assert.equal(indexToColumnLetter(1), 'B');
  assert.equal(indexToColumnLetter(25), 'Z');
  assert.equal(indexToColumnLetter(26), 'AA');
  assert.equal(indexToColumnLetter(27), 'AB');

  // Test parseRangeString
  const range1 = parseRangeString('A1:C5');
  assert.ok(range1);
  assert.equal(range1.startCol, 0);
  assert.equal(range1.startRow, 0);
  assert.equal(range1.endCol, 2);
  assert.equal(range1.endRow, 4);

  const rangeWithSheet = parseRangeString("'Doanh Thu'!B2:D10");
  assert.ok(rangeWithSheet);
  assert.equal(rangeWithSheet.sheetName, 'Doanh Thu');
  assert.equal(rangeWithSheet.startCol, 1);
  assert.equal(rangeWithSheet.startRow, 1);
  assert.equal(rangeWithSheet.endCol, 3);
  assert.equal(rangeWithSheet.endRow, 9);

  // Test formatRangeString
  assert.equal(formatRangeString(range1), 'A1:C5');
  assert.equal(formatRangeString(rangeWithSheet), "'Doanh Thu'!B2:D10");

  // Test extractDataFromWorkbook
  const mockWorkbook = {
    id: 'mock-wb',
    sheetOrder: ['s1'],
    sheets: {
      s1: {
        id: 's1',
        name: 'Trang 1',
        cellData: {
          0: { 0: { v: 'Tháng' }, 1: { v: 'Doanh thu' }, 2: { v: 'Lợi nhuận' } },
          1: { 0: { v: 'T1' }, 1: { v: 100 }, 2: { v: 40 } },
          2: { 0: { v: 'T2' }, 1: { v: 150 }, 2: { v: 70 } },
          3: { 0: { v: 'T3' }, 1: { v: 200 }, 2: { v: 95 } },
        },
      },
    },
  };

  const spec: ChartSpec = {
    id: 'c1',
    title: 'Test',
    type: 'column',
    sheetId: 's1',
    dataRange: 'A1:C4',
    hasHeaderRow: true,
    hasHeaderColumn: true,
    series: [],
    legend: { show: true, position: 'top' },
    position: {
      fromRow: 0,
      fromCol: 0,
      toRow: 10,
      toCol: 10,
      offsetX: 0,
      offsetY: 0,
      width: 500,
      height: 300,
    },
  };

  const extracted = extractDataFromWorkbook(mockWorkbook as any, 's1', spec);
  assert.deepEqual(extracted.headers, ['Doanh thu', 'Lợi nhuận']);
  assert.deepEqual(extracted.categories, ['T1', 'T2', 'T3']);
  assert.equal(extracted.seriesData.length, 2);
  const s0 = extracted.seriesData[0];
  const s1 = extracted.seriesData[1];
  assert.ok(s0);
  assert.ok(s1);
  assert.equal(s0.name, 'Doanh thu');
  assert.deepEqual(s0.values, [100, 150, 200]);
  assert.equal(s1.name, 'Lợi nhuận');
  assert.deepEqual(s1.values, [40, 70, 95]);

  console.log('DATA RANGE PARSER TESTS PASS');
};

run();
