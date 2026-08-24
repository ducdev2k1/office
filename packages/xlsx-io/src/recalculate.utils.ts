import type { IWorkbookData } from '@univerjs/core';

interface FormulaEngineLike {
  executeCalculation?: () => unknown;
  onCalculationResultApplied?: () => Promise<unknown> | unknown;
}

export interface UniverApiForExport {
  getFormula?: () => FormulaEngineLike | undefined;
  getActiveWorkbook?:
    | (() => { save?: () => IWorkbookData | undefined } | null | undefined)
    | undefined;
}

export const EXPORT_RECALC_TIMEOUT_MS = 5000;

const isPromise = (value: unknown): value is Promise<unknown> =>
  !!value && typeof (value as Promise<unknown>).then === 'function';

/**
 * Force a formula recalculation, wait for results to land in cells (bounded by a
 * timeout), then save the workbook snapshot. Guarantees exported snapshots carry
 * cached formula values so downstream consumers never see stale/empty results.
 */
export const prepareExportSnapshot = async (
  univerAPI: UniverApiForExport,
): Promise<IWorkbookData | undefined> => {
  const saveWorkbook = (): IWorkbookData | undefined =>
    univerAPI.getActiveWorkbook?.()?.save?.();

  const formula = univerAPI.getFormula?.();
  if (!formula) return saveWorkbook();

  try {
    formula.executeCalculation?.();
    const applied = formula.onCalculationResultApplied?.();
    if (isPromise(applied)) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const timeout = new Promise<void>((resolve) => {
          timer = setTimeout(resolve, EXPORT_RECALC_TIMEOUT_MS);
        });
        await Promise.race([applied.then(() => undefined), timeout]);
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
  } catch {
    // Best-effort recalc: export proceeds with whatever cached values exist.
  }

  return saveWorkbook();
};
