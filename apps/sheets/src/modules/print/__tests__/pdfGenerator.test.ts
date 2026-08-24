import { exportWorksheetToPdf } from '../utils/pdfGenerator.utils';
import { DEFAULT_PRINT_SETTINGS } from '../constants/print.constants';
import { LocaleType, type IWorkbookData } from '@univerjs/presets';

const assert = (condition: boolean, msg: string): void => {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
};

const runTests = async (): Promise<void> => {
  console.log('--- Testing pdfGenerator.utils.ts ---');

  const mockWorkbook: IWorkbookData = {
    id: 'sheet-print-test',
    name: 'Báo cáo doanh số Q3',
    appVersion: '0.23.0',
    locale: LocaleType.EN_US,
    styles: {},
    sheetOrder: ['sheet-1'],
    sheets: {
      'sheet-1': {
        id: 'sheet-1',
        name: 'Doanh Số',
        rowCount: 20,
        columnCount: 10,
        cellData: {
          0: {
            0: { v: 'Mã GD', t: 1 },
            1: { v: 'Khách hàng', t: 1 },
            2: { v: 'Doanh số', t: 1 },
          },
          1: {
            0: { v: 'GD-001', t: 1 },
            1: { v: 'Công ty ABC', t: 1 },
            2: { v: 50000000, t: 2 },
          },
          2: {
            0: { v: 'GD-002', t: 1 },
            1: { v: 'Tập đoàn XYZ', t: 1 },
            2: { v: 85000000, t: 2 },
          },
        },
      },
    },
  };

  // Test 1: Generate PDF blob for Portrait A4
  const blob = await exportWorksheetToPdf(mockWorkbook, 'sheet-1', DEFAULT_PRINT_SETTINGS);
  assert(blob !== null, 'Generated PDF blob should not be null');
  assert(blob.size > 0, `PDF blob size should be > 0, got ${blob.size} bytes`);
  assert(blob.type === 'application/pdf', `Blob type should be application/pdf, got ${blob.type}`);
  console.log(`✓ Test 1 Passed: PDF generated successfully (${blob.size} bytes)`);

  // Test 2: Generate PDF blob for Landscape Letter with selection range
  const landscapeSettings = {
    ...DEFAULT_PRINT_SETTINGS,
    paperSize: 'letter' as const,
    orientation: 'landscape' as const,
    range: 'selection' as const,
    selectedRange: 'A1:C3',
    showHeaders: false,
  };
  const blobLandscape = await exportWorksheetToPdf(mockWorkbook, 'sheet-1', landscapeSettings);
  assert(blobLandscape.size > 0, `Landscape PDF size should be > 0, got ${blobLandscape.size} bytes`);
  console.log(`✓ Test 2 Passed: Landscape Letter PDF generated successfully (${blobLandscape.size} bytes)`);

  console.log('All PDF generator tests passed successfully! ✨');
};

void runTests();
