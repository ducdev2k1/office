import type { ChartSpec } from '@/modules/charts/types/charts.types';
import {
  createBlankSheet,
  deleteSheetRecord,
  getStorageUsageBytes,
  importSheetFile,
  loadSheets,
  saveSheets,
} from '@/services/sheets.service';
import type { SheetDocRecord } from '@/types/sheets.types';
import type { FileRecord } from '@office/file-home';
import type { IWorkbookData } from '@univerjs/presets';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface SheetsState {
  sheets: SheetDocRecord[];
  files: FileRecord[];
  loading: boolean;
  activeId: string;
  activeSheet: SheetDocRecord | undefined;
  saveState: 'loading' | 'saving' | 'saved';
  storageBytes: number;
  setActiveId: (id: string) => void;
  updateData: (data: IWorkbookData) => void;
  updateCharts: (charts: ChartSpec[]) => void;
  updateTitle: (title: string) => void;
  addSheet: (title?: string) => string;
  importFile: (file: File) => Promise<string>;
  star: (id: string) => void;
  rename: (id: string, title: string) => void;
  duplicate: (id: string) => void;
  trash: (id: string) => void;
  restore: (id: string) => void;
  deleteForever: (id: string) => void;
  markOpened: (id: string) => void;
}

const now = (): string => new Date().toISOString();

export const useSheets = (): SheetsState => {
  const [sheets, setSheets] = useState<SheetDocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(() => 'sheet-sample-budget');
  const [saveState, setSaveState] = useState<'loading' | 'saving' | 'saved'>('loading');

  const activeSheet =
    sheets.find((s) => s.id === activeId && !s.deletedAt) ??
    sheets.find((s) => !s.deletedAt);
  const activeSheetRef = useRef(activeSheet);

  useEffect(() => {
    void loadSheets().then((loaded) => {
      setSheets(loaded);
      const first = loaded.find((s) => !s.deletedAt);
      const urlId = window.location.pathname.match(/^\/edit\/([^/]+)/)?.[1];
      const hasUrlSheet = urlId !== undefined && loaded.some((s) => s.id === urlId && !s.deletedAt);
      setActiveId(hasUrlSheet ? urlId : first?.id ?? loaded[0]?.id ?? '');
      setLoading(false);
      setSaveState('saved');
    });
  }, []);

  useEffect(() => {
    activeSheetRef.current = activeSheet;
  }, [activeSheet]);

  useEffect(() => {
    if (sheets.length === 0) return;
    const timeout = window.setTimeout(() => void saveSheets(sheets), 400);
    return () => window.clearTimeout(timeout);
  }, [sheets]);

  const updateSheet = useCallback((id: string, updater: (sheet: SheetDocRecord) => SheetDocRecord): void => {
    setSheets((current) => current.map((s) => (s.id === id ? updater(s) : s)));
  }, []);

  const updateData = useCallback((data: IWorkbookData): void => {
    const currentSheet = activeSheetRef.current;
    if (!currentSheet) return;
    setSaveState('saving');
    updateSheet(currentSheet.id, (s) => ({
      ...s,
      data,
      updatedAt: now(),
    }));
    window.setTimeout(() => setSaveState('saved'), 300);
  }, [updateSheet]);

  const updateCharts = useCallback((charts: ChartSpec[]): void => {
    const currentSheet = activeSheetRef.current;
    if (!currentSheet) return;
    setSaveState('saving');
    updateSheet(currentSheet.id, (s) => ({
      ...s,
      charts,
      updatedAt: now(),
    }));
    window.setTimeout(() => setSaveState('saved'), 300);
  }, [updateSheet]);

  const updateTitle = useCallback((title: string): void => {
    const currentSheet = activeSheetRef.current;
    if (!currentSheet) return;
    updateSheet(currentSheet.id, (s) => ({
      ...s,
      title: title.trim() || 'Bảng tính chưa có tiêu đề',
      data: s.data ? { ...s.data, name: title.trim() || 'Bảng tính chưa có tiêu đề' } : undefined,
      updatedAt: now(),
    }));
  }, [updateSheet]);

  const addSheet = useCallback((title?: string): string => {
    const nextSheet = createBlankSheet(title);
    setSheets((current) => [nextSheet, ...current]);
    setActiveId(nextSheet.id);
    return nextSheet.id;
  }, []);

  const importFile = useCallback(async (file: File): Promise<string> => {
    const nextSheet = await importSheetFile(file);
    setSheets((current) => [nextSheet, ...current]);
    setActiveId(nextSheet.id);
    return nextSheet.id;
  }, []);

  const star = useCallback((id: string): void => {
    updateSheet(id, (s) => ({ ...s, starred: !s.starred }));
  }, [updateSheet]);

  const rename = useCallback((id: string, title: string): void => {
    updateSheet(id, (s) => ({
      ...s,
      title: title.trim() || 'Bảng tính chưa có tiêu đề',
      data: s.data ? { ...s.data, name: title.trim() || 'Bảng tính chưa có tiêu đề' } : undefined,
      updatedAt: now(),
    }));
  }, [updateSheet]);

  const duplicate = useCallback((id: string): void => {
    setSheets((current) => {
      const source = current.find((s) => s.id === id);
      if (!source) return current;
      const copyId = `sheet-${crypto.randomUUID()}`;
      const copyTitle = `Bản sao của ${source.title}`;
      const copyData = source.data ? { ...source.data, id: copyId, name: copyTitle } : undefined;
      const copy: SheetDocRecord = {
        ...source,
        id: copyId,
        title: copyTitle,
        createdAt: now(),
        updatedAt: now(),
        lastOpenedAt: now(),
        starred: false,
        deletedAt: null,
        data: copyData,
        charts: source.charts ? JSON.parse(JSON.stringify(source.charts)) : undefined,
      };
      return [copy, ...current];
    });
  }, []);

  const trash = useCallback((id: string): void => {
    updateSheet(id, (s) => ({ ...s, deletedAt: now() }));
  }, [updateSheet]);

  const restore = useCallback((id: string): void => {
    updateSheet(id, (s) => ({ ...s, deletedAt: null, updatedAt: now() }));
  }, [updateSheet]);

  const deleteForever = useCallback((id: string): void => {
    setSheets((current) => current.filter((s) => s.id !== id));
    void deleteSheetRecord(id);
  }, []);

  const markOpened = useCallback((id: string): void => {
    updateSheet(id, (s) => ({ ...s, lastOpenedAt: now() }));
  }, [updateSheet]);

  const files = useMemo<FileRecord[]>(() => sheets, [sheets]);
  const storageBytes = useMemo(() => getStorageUsageBytes(sheets), [sheets]);

  return {
    sheets,
    files,
    loading,
    activeId,
    activeSheet,
    saveState,
    storageBytes,
    setActiveId,
    updateData,
    updateCharts,
    updateTitle,
    addSheet,
    importFile,
    star,
    rename,
    duplicate,
    trash,
    restore,
    deleteForever,
    markOpened,
  };
};
