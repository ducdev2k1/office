import { useEffect, useRef, useState } from 'react';
import type { SheetCellRange } from '@/modules/collab/types/collab.types';
import type { FUniver } from '@univerjs/presets';

export interface SelectionAggregate {
  numericCount: number;
  totalCells: number;
  sum: number;
  avg: number | null;
}

const EMPTY_AGGREGATE: SelectionAggregate = { numericCount: 0, totalCells: 0, sum: 0, avg: null };
const MAX_SCANNED_CELLS = 200_000;

interface RawAggregate {
  numericCount: number;
  totalCells: number;
  sum: number;
}

const readAggregate = (univerAPI: FUniver | null, range: SheetCellRange): RawAggregate => {
  if (!univerAPI || range.endRow <= range.startRow || range.endColumn <= range.startColumn) {
    return { numericCount: 0, totalCells: 0, sum: 0 };
  }

  const rowCount = range.endRow - range.startRow;
  const colCount = range.endColumn - range.startColumn;
  if (rowCount * colCount > MAX_SCANNED_CELLS) {
    return { numericCount: 0, totalCells: rowCount * colCount, sum: 0 };
  }

  const sheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
  if (!sheet) return { numericCount: 0, totalCells: 0, sum: 0 };

  try {
    const values =
      sheet.getRange(range.startRow, range.startColumn, range.endRow - 1, range.endColumn - 1)
        ?.getValues() ?? [];
    let numericCount = 0;
    let sum = 0;
    for (const row of values) {
      for (const value of row ?? []) {
        if (typeof value === 'number') {
          numericCount += 1;
          sum += value;
        }
      }
    }
    return { numericCount, totalCells: rowCount * colCount, sum };
  } catch {
    return { numericCount: 0, totalCells: 0, sum: 0 };
  }
};

export const useSelectionAggregate = (
  univerAPI: FUniver | null,
  range: SheetCellRange | null,
): SelectionAggregate => {
  const [aggregate, setAggregate] = useState<SelectionAggregate>(EMPTY_AGGREGATE);
  const rangeRef = useRef<SheetCellRange | null>(range);

  useEffect(() => {
    rangeRef.current = range;
    setAggregate(EMPTY_AGGREGATE);
    if (!univerAPI || !range) return;

    let cancelled = false;

    const recompute = () => {
      const current = rangeRef.current;
      if (cancelled || !current) return;
      const raw = readAggregate(univerAPI, current);
      setAggregate({
        numericCount: raw.numericCount,
        totalCells: raw.totalCells,
        sum: raw.sum,
        avg: raw.numericCount > 0 ? raw.sum / raw.numericCount : null,
      });
    };

    recompute();

    let timer: number | null = null;
    const disposable = univerAPI.onCommandExecuted?.(() => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(recompute, 300);
    });

    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
      disposable?.dispose?.();
    };
  }, [univerAPI, range]);

  return aggregate;
};
