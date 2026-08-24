import { Y } from '@office/collab-core';
import {
  initYDocFromWorkbook,
  exportWorkbookFromYDoc,
  syncLocalWorkbookToYDoc,
  syncLocalChartsToYDoc,
} from '../utils/sheetYjsSync.utils';
import { LocaleType, type IWorkbookData } from '@univerjs/presets';
import type { ChartSpec } from '@/modules/charts/types/charts.types';

const assert = (condition: boolean, msg: string): void => {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
};

const runTests = (): void => {
  console.log('--- Testing sheetYjsSync.utils.ts ---');

  const mockWorkbook: IWorkbookData = {
    id: 'sheet-test-01',
    name: 'Bảng tính thử nghiệm',
    appVersion: '0.23.0',
    locale: LocaleType.EN_US,
    styles: {},
    sheetOrder: ['sheet-1'],
    sheets: {
      'sheet-1': {
        id: 'sheet-1',
        name: 'Sheet 1',
        rowCount: 10,
        columnCount: 10,
        cellData: {
          0: {
            0: { v: 'Xin chào', t: 1 },
            1: { v: 12345, t: 2 },
          },
        },
      },
    },
  };

  const mockCharts: ChartSpec[] = [
    {
      id: 'chart-1',
      title: 'Biểu đồ doanh thu',
      type: 'column',
      sheetId: 'sheet-1',
      dataRange: 'A1:B5',
      hasHeaderRow: true,
      hasHeaderColumn: false,
      series: [],
      legend: { show: true, position: 'top' },
      position: {
        fromRow: 0,
        fromCol: 0,
        toRow: 10,
        toCol: 5,
        offsetX: 50,
        offsetY: 50,
        width: 400,
        height: 250,
      },
      palette: ['#3b82f6', '#10b981'],
    },
  ];

  // Test 1: Init YDoc and Export
  const doc = new Y.Doc();
  initYDocFromWorkbook(doc, mockWorkbook, mockCharts);

  const exported = exportWorkbookFromYDoc(doc);
  assert(exported !== null, 'Exported result should not be null');
  assert(exported?.workbook.id === 'sheet-test-01', 'Workbook ID should match');
  assert(exported?.workbook.name === 'Bảng tính thử nghiệm', 'Workbook name should match');
  assert(exported?.workbook.sheets['sheet-1']?.name === 'Sheet 1', 'Sheet name should match');
  assert(
    exported?.workbook.sheets['sheet-1']?.cellData?.[0]?.[0]?.v === 'Xin chào',
    'Cell A1 value should match',
  );
  assert(exported?.charts.length === 1, 'Charts length should be 1');
  assert(exported?.charts[0]?.title === 'Biểu đồ doanh thu', 'Chart title should match');
  console.log('✓ Test 1 Passed: Init YDoc and export round-trip');

  // Test 2: Local sync updates
  const updatedWorkbook: IWorkbookData = {
    ...mockWorkbook,
    name: 'Bảng tính đã đổi tên',
    sheets: {
      ...mockWorkbook.sheets,
      'sheet-1': {
        ...mockWorkbook.sheets['sheet-1']!,
        cellData: {
          0: {
            0: { v: 'Xin chào thế giới', t: 1 },
          },
        },
      },
    },
  };

  syncLocalWorkbookToYDoc(doc, updatedWorkbook);
  const exportedAfterSync = exportWorkbookFromYDoc(doc);
  assert(
    exportedAfterSync?.workbook.name === 'Bảng tính đã đổi tên',
    'Workbook name should update',
  );
  assert(
    exportedAfterSync?.workbook.sheets['sheet-1']?.cellData?.[0]?.[0]?.v === 'Xin chào thế giới',
    'Cell A1 value should update',
  );
  console.log('✓ Test 2 Passed: Sync local updates to YDoc');

  // Test 3: Sync Charts
  const updatedCharts: ChartSpec[] = [
    ...mockCharts,
    {
      id: 'chart-2',
      title: 'Biểu đồ thứ hai',
      type: 'pie',
      sheetId: 'sheet-1',
      dataRange: 'C1:D5',
      hasHeaderRow: true,
      hasHeaderColumn: false,
      series: [],
      legend: { show: false, position: 'bottom' },
      position: {
        fromRow: 2,
        fromCol: 2,
        toRow: 12,
        toCol: 7,
        offsetX: 100,
        offsetY: 100,
        width: 300,
        height: 200,
      },
      palette: ['#f59e0b'],
    },
  ];

  syncLocalChartsToYDoc(doc, updatedCharts);
  const exportedAfterChartsSync = exportWorkbookFromYDoc(doc);
  assert(exportedAfterChartsSync?.charts.length === 2, 'Charts length should be 2');
  assert(
    exportedAfterChartsSync?.charts[1]?.title === 'Biểu đồ thứ hai',
    'Second chart title should match',
  );
  console.log('✓ Test 3 Passed: Sync local charts to YDoc');

  console.log('All sheet Yjs sync tests passed successfully! ✨');
};

runTests();
