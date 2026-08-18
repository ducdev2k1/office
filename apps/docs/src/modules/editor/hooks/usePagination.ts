import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Editor } from '@tiptap/core';
import { computePageBreaks, MAX_PAGES, PAGE_GAP } from '@/modules/editor/utils/pagination.utils';
import { DEFAULT_PAGE_SETUP, getPaperSizePx, mmToPx, type DocRecord } from '@/types/docs.types';
import type { ViewMode } from '@/modules/editor/types/editor.types';

export interface PaginationState {
  viewMode: ViewMode;
  pageCount: number;
  isOverLimit: boolean;
  viewportStyle: CSSProperties;
  setViewMode: (mode: ViewMode) => void;
  schedulePagination: (immediate?: boolean) => void;
}

export const usePagination = (
  editor: Editor | null,
  activeDoc: DocRecord | undefined,
): PaginationState => {
  const [viewMode, setViewMode] = useState<ViewMode>('paged');
  const [pageCount, setPageCount] = useState(1);
  const rafRef = useRef<number | null>(null);
  const lastBreaksRef = useRef<number[]>([]);
  const activeDocRef = useRef(activeDoc);

  useEffect(() => {
    activeDocRef.current = activeDoc;
  }, [activeDoc]);

  const runPagination = (): void => {
    rafRef.current = null;
    if (!editor || editor.isDestroyed || !editor.view) return;
    if (editor.view.composing) {
      schedulePagination();
      return;
    }
    const setup = activeDocRef.current?.pageSetup ?? DEFAULT_PAGE_SETUP();
    const result = computePageBreaks(editor.view, setup);
    const prev = lastBreaksRef.current;
    if (
      result.breaks.length !== prev.length ||
      result.breaks.some((breakPos, i) => breakPos !== prev[i])
    ) {
      lastBreaksRef.current = result.breaks;
      editor.view.dispatch(editor.view.state.tr.setMeta('paginationBreaks', result));
    }
    setPageCount(result.breaks.length + 1);
  };

  const schedulePagination = (immediate = false): void => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (immediate) {
      runPagination();
      return;
    }
    rafRef.current = window.requestAnimationFrame(runPagination);
  };

  useEffect(
    () => () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!editor) return;
    const onTransaction = () => {
      if (viewMode === 'paged') schedulePagination();
    };
    editor.on('transaction', onTransaction);
    return () => {
      editor.off('transaction', onTransaction);
    };
  }, [editor, viewMode]);

  useLayoutEffect(() => {
    lastBreaksRef.current = [];
    setPageCount(1);
    if (!editor) return;
    if (viewMode === 'paged') {
      schedulePagination(true);
    } else {
      editor.view.dispatch(
        editor.view.state.tr.setMeta('paginationBreaks', {
          breaks: [],
          spacers: [],
          forced: [],
        }),
      );
    }
  }, [activeDoc?.id, viewMode, editor]);

  useEffect(() => {
    if (viewMode !== 'paged') return;
    document.fonts?.ready.then(() => schedulePagination(true)).catch(() => undefined);
  }, [viewMode, editor]);

  const pageStyle = useMemo<CSSProperties>(() => {
    const setup = activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP();
    const { width, height } = getPaperSizePx(setup);
    const { top, right, bottom, left } = setup.margins;
    return {
      '--paper-w': `${width}px`,
      '--paper-h': `${height}px`,
      '--margin-t': `${mmToPx(top)}px`,
      '--margin-r': `${mmToPx(right)}px`,
      '--margin-b': `${mmToPx(bottom)}px`,
      '--margin-l': `${mmToPx(left)}px`,
    } as CSSProperties;
  }, [activeDoc?.pageSetup]);

  const viewportStyle = useMemo<CSSProperties>(() => {
    const setup = activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP();
    if (viewMode !== 'paged') return { ...pageStyle };
    const { height } = getPaperSizePx(setup);
    const stackHeight = pageCount * height + (pageCount - 1) * PAGE_GAP + 48;
    return {
      ...pageStyle,
      '--stack-h': `${stackHeight}px`,
      minHeight: `${stackHeight}px`,
    } as CSSProperties;
  }, [viewMode, pageCount, activeDoc?.pageSetup, pageStyle]);

  return {
    viewMode,
    pageCount,
    isOverLimit: pageCount >= MAX_PAGES,
    viewportStyle,
    setViewMode,
    schedulePagination,
  };
};
