import { calculateRangePixelRect } from '../utils/selectionBounds.utils';
import type { SheetCellRange } from '../types/collab.types';
import type { IWorksheetData } from '@univerjs/presets';

const assert = (condition: boolean, msg: string): void => {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
};

const runTests = (): void => {
  console.log('--- Testing selectionBounds.utils.ts ---');

  // Test 1: Default dimensions calculation (A1 = row 0, col 0)
  const rangeA1: SheetCellRange = {
    startRow: 0,
    endRow: 0,
    startColumn: 0,
    endColumn: 0,
  };
  const rectA1 = calculateRangePixelRect(rangeA1);
  assert(rectA1.left === 46, `Expected left=46, got ${rectA1.left}`);
  assert(rectA1.top === 26, `Expected top=26, got ${rectA1.top}`);
  assert(rectA1.width === 80, `Expected width=80, got ${rectA1.width}`);
  assert(rectA1.height === 24, `Expected height=24, got ${rectA1.height}`);
  console.log('✓ Test 1 Passed: Single cell A1 default bounds');

  // Test 2: Range B2:C3 (rows 1-2, cols 1-2) with custom column/row sizes
  const rangeB2C3: SheetCellRange = {
    startRow: 1,
    endRow: 2,
    startColumn: 1,
    endColumn: 2,
  };
  const mockWorksheet: Partial<IWorksheetData> = {
    rowData: { 0: { h: 30 }, 1: { h: 25 }, 2: { h: 25 } },
    columnData: { 0: { w: 100 }, 1: { w: 150 }, 2: { w: 150 } },
  };
  const rectB2C3 = calculateRangePixelRect(rangeB2C3, mockWorksheet);
  // Left: 46 + col 0 (100) = 146
  assert(rectB2C3.left === 146, `Expected left=146, got ${rectB2C3.left}`);
  // Top: 26 + row 0 (30) = 56
  assert(rectB2C3.top === 56, `Expected top=56, got ${rectB2C3.top}`);
  // Width: col 1 (150) + col 2 (150) = 300
  assert(rectB2C3.width === 300, `Expected width=300, got ${rectB2C3.width}`);
  // Height: row 1 (25) + row 2 (25) = 50
  assert(rectB2C3.height === 50, `Expected height=50, got ${rectB2C3.height}`);
  console.log('✓ Test 2 Passed: Multi-cell range with custom dimensions');

  console.log('All selection bounds tests passed successfully! ✨');
};

runTests();
