import { createDefaultWorkbookData } from '@/constants/sheets.constants';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US';
import { createUniver, LocaleType, mergeLocales, type FUniver, type IWorkbookData } from '@univerjs/presets';
import { useEffect, useRef } from 'react';

import '@univerjs/preset-sheets-core/lib/index.css';

export interface UseUniverOptions {
  initialData?: IWorkbookData;
  onDataChange?: (data: IWorkbookData) => void;
  onReady?: (api: FUniver) => void;
}

export const useUniver = ({ initialData, onDataChange, onReady }: UseUniverOptions = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<FUniver | null>(null);
  const onDataChangeRef = useRef(onDataChange);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onDataChangeRef.current = onDataChange;
    onReadyRef.current = onReady;
  }, [onDataChange, onReady]);

  useEffect(() => {
    if (!containerRef.current || instanceRef.current) return;

    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS),
      },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
          toolbar: false,
          header: true,
        }),
      ],
    });

    instanceRef.current = univerAPI;
    const data =
      initialData && Object.keys(initialData.sheets ?? {}).length > 0
        ? initialData
        : createDefaultWorkbookData();
    univerAPI.createWorkbook(data);
    onReadyRef.current?.(univerAPI);

    let debounceTimer: number | null = null;
    const disposable = univerAPI.onCommandExecuted?.(() => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        const saved = univerAPI.getActiveWorkbook()?.save();
        if (saved && onDataChangeRef.current) {
          onDataChangeRef.current(saved);
        }
      }, 500);
    });

    return () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      disposable?.dispose?.();
      instanceRef.current = null;
      univerAPI.dispose();
    };
  }, []);

  return {
    containerRef,
    univerAPI: instanceRef.current,
    getWorkbookData: () => instanceRef.current?.getActiveWorkbook()?.save(),
  };
};