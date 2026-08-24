import type { ChartSpec } from '@/modules/charts/types/charts.types';
import type { IWorkbookData, IWorksheetData } from '@univerjs/presets';
import { Y } from '@office/collab-core';

const ROOT_MAP = 'sheet_root';
const META_KEY = 'workbook_meta';
const SHEETS_MAP_KEY = 'sheets_map';
const CHARTS_KEY = 'charts';

export interface YDocSyncResult {
  workbook: IWorkbookData;
  charts: ChartSpec[];
}

export const initYDocFromWorkbook = (
  doc: Y.Doc,
  workbook: IWorkbookData,
  charts: ChartSpec[] = [],
): void => {
  const rootMap = doc.getMap(ROOT_MAP);
  if (rootMap.has(META_KEY) || rootMap.has(SHEETS_MAP_KEY)) {
    return; // Already initialized on server or another client
  }

  doc.transact(() => {
    const meta = {
      id: workbook.id,
      name: workbook.name,
      appVersion: workbook.appVersion,
      locale: workbook.locale,
      styles: workbook.styles ?? {},
      sheetOrder: workbook.sheetOrder ?? [],
    };
    rootMap.set(META_KEY, JSON.stringify(meta));

    const sheetsMap = new Y.Map<string>();
    if (workbook.sheets) {
      Object.entries(workbook.sheets).forEach(([sheetId, sheetData]) => {
        if (sheetData) {
          sheetsMap.set(sheetId, JSON.stringify(sheetData));
        }
      });
    }
    rootMap.set(SHEETS_MAP_KEY, sheetsMap);
    rootMap.set(CHARTS_KEY, JSON.stringify(charts));
  });
};

export const exportWorkbookFromYDoc = (
  doc: Y.Doc,
  fallback?: IWorkbookData,
): YDocSyncResult | null => {
  const rootMap = doc.getMap(ROOT_MAP);
  const rawMeta = rootMap.get(META_KEY) as string | undefined;
  const sheetsMap = rootMap.get(SHEETS_MAP_KEY) as Y.Map<string> | undefined;

  if (!rawMeta || !sheetsMap) {
    if (fallback) {
      return { workbook: fallback, charts: [] };
    }
    return null;
  }

  try {
    const meta = JSON.parse(rawMeta);
    const sheets: Record<string, Partial<IWorksheetData>> = {};

    sheetsMap.forEach((rawSheet: string, sheetId: string) => {
      try {
        sheets[sheetId] = JSON.parse(rawSheet);
      } catch (err) {
        console.warn(`[sheetYjsSync] Failed to parse worksheet "${sheetId}":`, err);
      }
    });

    let charts: ChartSpec[] = [];
    const rawCharts = rootMap.get(CHARTS_KEY) as string | undefined;
    if (rawCharts) {
      try {
        charts = JSON.parse(rawCharts);
      } catch {
        charts = [];
      }
    }

    const workbook: IWorkbookData = {
      id: meta.id || fallback?.id || 'sheet-workbook',
      name: meta.name || fallback?.name || 'Workbook',
      appVersion: meta.appVersion || '0.23.0',
      locale: meta.locale || fallback?.locale,
      styles: meta.styles || fallback?.styles || {},
      sheetOrder: meta.sheetOrder || Object.keys(sheets),
      sheets,
    };

    return { workbook, charts };
  } catch (err) {
    console.error('[sheetYjsSync] Error exporting workbook from YDoc:', err);
    return fallback ? { workbook: fallback, charts: [] } : null;
  }
};

export const syncLocalWorkbookToYDoc = (doc: Y.Doc, workbook: IWorkbookData): void => {
  const rootMap = doc.getMap(ROOT_MAP);
  doc.transact(() => {
    const meta = {
      id: workbook.id,
      name: workbook.name,
      appVersion: workbook.appVersion,
      locale: workbook.locale,
      styles: workbook.styles ?? {},
      sheetOrder: workbook.sheetOrder ?? [],
    };
    rootMap.set(META_KEY, JSON.stringify(meta));

    let sheetsMap = rootMap.get(SHEETS_MAP_KEY) as Y.Map<string> | undefined;
    if (!sheetsMap) {
      sheetsMap = new Y.Map<string>();
      rootMap.set(SHEETS_MAP_KEY, sheetsMap);
    }

    if (workbook.sheets) {
      Object.entries(workbook.sheets).forEach(([sheetId, sheetData]) => {
        if (sheetData) {
          const serialized = JSON.stringify(sheetData);
          if (sheetsMap?.get(sheetId) !== serialized) {
            sheetsMap?.set(sheetId, serialized);
          }
        }
      });

      // Cleanup removed sheets
      const currentKeys = new Set(Object.keys(workbook.sheets));
      sheetsMap.forEach((_: string, sheetId: string) => {
        if (!currentKeys.has(sheetId)) {
          sheetsMap?.delete(sheetId);
        }
      });
    }
  });
};

export const syncLocalChartsToYDoc = (doc: Y.Doc, charts: ChartSpec[]): void => {
  const rootMap = doc.getMap(ROOT_MAP);
  const serialized = JSON.stringify(charts);
  if (rootMap.get(CHARTS_KEY) !== serialized) {
    doc.transact(() => {
      rootMap.set(CHARTS_KEY, serialized);
    });
  }
};
