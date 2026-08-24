import type { ICellData, IWorkbookData, IStyleData } from '@univerjs/core';

export interface GroupFidelity {
  total: number;
  match: number;
}

export interface FidelityReport {
  groups: Record<string, GroupFidelity>;
  /** Weighted overall percentage: sum(match)/sum(total). */
  overall: number;
  pct: (group: string) => number;
}

const WIDTH_TOLERANCE_PX = 8; // px <-> Excel char width conversion is lossy
const HEIGHT_TOLERANCE_PX = 2;

const cellKey = (r: number, c: number): string => `${r}:${c}`;

const collectCells = (data: IWorkbookData): Map<string, Map<string, ICellData>> => {
  const out = new Map<string, Map<string, ICellData>>();
  for (const sheet of Object.values(data.sheets)) {
    const cells = new Map<string, ICellData>();
    for (const [r, row] of Object.entries(sheet.cellData ?? {})) {
      for (const [c, cell] of Object.entries(row as Record<string, ICellData>)) {
        if (cell.v !== undefined || cell.f !== undefined || cell.s !== undefined) {
          cells.set(cellKey(Number(r), Number(c)), cell);
        }
      }
    }
    const name = sheet.name ?? '';
    out.set(name, cells);
  }
  return out;
};

const normValue = (cell: ICellData | undefined): string => {
  if (!cell) return 'missing';
  return JSON.stringify([cell.v ?? null, cell.t ?? null]);
};

const normFormula = (cell: ICellData | undefined): string => {
  if (!cell?.f) return 'missing';
  const f = cell.f.startsWith('=') ? cell.f.slice(1) : cell.f;
  return JSON.stringify([f, cell.v ?? null]);
};

const styleContent = (cell: ICellData | undefined, styles: Record<string, unknown>): string => {
  const s = cell?.s;
  if (!s) return 'none';
  const style = typeof s === 'string' ? (styles[s] as IStyleData | undefined) : (s as IStyleData);
  return style ? JSON.stringify(style) : 'none';
};

const mergeRanges = (data: IWorkbookData): Set<string>[] =>
  Object.values(data.sheets).map((sheet) => {
    const set = new Set<string>();
    for (const m of sheet.mergeData ?? []) {
      set.add(`${m.startRow},${m.startColumn},${m.endRow},${m.endColumn}`);
    }
    return set;
  });

/**
 * Compare two workbook snapshots element-group by element-group.
 * Sheets are paired by ORDER (ids are regenerated on every import).
 */
export const compareWorkbooks = (
  original: IWorkbookData,
  roundtrip: IWorkbookData,
): FidelityReport => {
  const groups: Record<string, GroupFidelity> = {
    sheets: { total: 0, match: 0 },
    cells: { total: 0, match: 0 },
    formulas: { total: 0, match: 0 },
    styles: { total: 0, match: 0 },
    merges: { total: 0, match: 0 },
    sizes: { total: 0, match: 0 },
    freeze: { total: 0, match: 0 },
  };
  const bump = (group: string, ok: boolean): void => {
    const g = groups[group];
    if (!g) return;
    g.total += 1;
    if (ok) g.match += 1;
  };

  const aSheets = Object.values(original.sheets);
  const bSheets = Object.values(roundtrip.sheets);
  const aOrder = original.sheetOrder?.map((id) => original.sheets[id]?.name) ?? [];
  const bOrder = roundtrip.sheetOrder?.map((id) => roundtrip.sheets[id]?.name) ?? [];

  aSheets.forEach((aSheet, i) => {
    const bSheet = bSheets[i];
    bump('sheets', !!bSheet && bSheet.name === aSheet.name && !!(bSheet.hidden ?? 0) === !!(aSheet.hidden ?? 0));
    if (!bSheet) return;

    const bName = bSheet.name ?? '';
    const bCells = collectCells(roundtrip).get(bName) ?? new Map();
    const aCells =
      collectCells(original).get(aSheet.name ?? '') ?? new Map();

    for (const [key, aCell] of aCells) {
      const bCell = bCells.get(key);
      if (aCell.f) {
        bump('formulas', normFormula(bCell) === normFormula(aCell));
      } else {
        bump('cells', normValue(bCell) === normValue(aCell));
      }
      if (styleContent(aCell, original.styles ?? {}) !== 'none') {
        bump(
          'styles',
          styleContent(bCell, roundtrip.styles ?? {}) ===
            styleContent(aCell, original.styles ?? {}),
        );
      }
    }

    const aMerges = mergeRanges(original)[i] ?? new Set<string>();
    const bMerges = mergeRanges(roundtrip)[i] ?? new Set<string>();
    for (const range of aMerges) bump('merges', bMerges.has(range));

    const bRows = bSheet.rowData ?? {};
    for (const [r, rowA] of Object.entries(aSheet.rowData ?? {})) {
      const hA = rowA.h;
      if (hA === undefined) continue;
      const hB = bRows[Number(r)]?.h;
      bump('sizes', hB !== undefined && Math.abs(hB - hA) <= HEIGHT_TOLERANCE_PX);
    }
    const bCols = bSheet.columnData ?? {};
    for (const [c, colA] of Object.entries(aSheet.columnData ?? {})) {
      const wA = colA.w;
      if (wA === undefined) continue;
      const wB = bCols[Number(c)]?.w;
      bump('sizes', wB !== undefined && Math.abs(wB - wA) <= WIDTH_TOLERANCE_PX);
    }

    const fa = aSheet.freeze;
    const fb = bSheet.freeze;
    bump(
      'freeze',
      (fa?.xSplit ?? 0) === (fb?.xSplit ?? 0) &&
        (fa?.ySplit ?? 0) === (fb?.ySplit ?? 0),
    );
  });

  // Sheet ORDER as its own signal inside the sheets group
  bump('sheets', JSON.stringify(aOrder) === JSON.stringify(bOrder));

  const totalAll = Object.values(groups).reduce((acc, g) => acc + g.total, 0);
  const matchAll = Object.values(groups).reduce((acc, g) => acc + g.match, 0);

  return {
    groups,
    overall: totalAll === 0 ? 100 : (matchAll / totalAll) * 100,
    pct: (group: string): number => {
      const g = groups[group];
      if (!g || g.total === 0) return 100;
      return (g.match / g.total) * 100;
    },
  };
};
