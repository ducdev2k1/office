import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Editor } from '@tiptap/core';
import {
  computeMetrics,
  computePageBreaks,
  EMPTY_BREAKS,
  MAX_PAGES,
  PAGE_GAP,
  resolveContentOffsets,
  type PageBreaks,
} from '@/modules/editor/utils/pagination.utils';
import { DEFAULT_PAGE_SETUP, getPaperSizePx, mmToPx, type DocRecord } from '@/types/docs.types';
import type { ViewMode } from '@/modules/editor/types/editor.types';

export interface PaginationState {
  viewMode: ViewMode;
  pageCount: number;
  isOverLimit: boolean;
  viewportStyle: CSSProperties;
  setViewMode: (mode: ViewMode) => void;
  schedulePagination: (immediate?: boolean) => PageBreaks | null;
}

export const usePagination = (
  editor: Editor | null,
  activeDoc: DocRecord | undefined,
): PaginationState => {
  const [viewMode, setViewMode] = useState<ViewMode>('paged');
  const [pageCount, setPageCount] = useState(1);
  const rafRef = useRef<number | null>(null);
  const lastBreaksRef = useRef<number[]>([]);
  const latestBreaksRef = useRef<PageBreaks | null>(null);
  const activeDocRef = useRef(activeDoc);

  useEffect(() => {
    if (import.meta.env.DEV) window.__latestBreaksRef = latestBreaksRef;
    return () => {
      if (import.meta.env.DEV) delete window.__latestBreaksRef;
    };
  }, []);

  useEffect(() => {
    activeDocRef.current = activeDoc;
  }, [activeDoc]);

  const runPagination = (): PageBreaks | null => {
    rafRef.current = null;
    if (!editor || editor.isDestroyed || !editor.view) return null;
    if (editor.view.composing) {
      schedulePagination();
      return null;
    }
    const setup = activeDocRef.current?.pageSetup ?? DEFAULT_PAGE_SETUP();
    const result = computePageBreaks(editor.view, setup);
    dispatchBreaks(result);

    const paperH = computeMetrics(setup).paperH;
    const domTopOf = (offset: number): number | null => {
      const node = editor.view.nodeDOM(offset);
      if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
      const el = node as HTMLElement;
      if (el.dataset.type === 'page-break') return null;
      return el.offsetTop;
    };
    const realOffsets = resolveContentOffsets(result.breaks, result.contentOffsets, domTopOf, paperH);
    if (realOffsets.some((value, i) => value !== (result.contentOffsets[i] ?? value))) {
      const corrected = { ...result, contentOffsets: realOffsets };
      dispatchBreaks(corrected);
      latestBreaksRef.current = corrected;
      setPageCount(corrected.contentOffsets.length);
      return corrected;
    }

    latestBreaksRef.current = result;
    setPageCount(result.contentOffsets.length);
    return result;
  };

  const dispatchBreaks = (result: PageBreaks): void => {
    if (!editor || !editor.view) return;
    const prev = lastBreaksRef.current;
    if (
      result.breaks.length !== prev.length ||
      result.breaks.some((breakPos, i) => breakPos !== prev[i])
    ) {
      lastBreaksRef.current = result.breaks;
      editor.view.dispatch(editor.view.state.tr.setMeta('paginationBreaks', result));
    }
  };

  const schedulePagination = (immediate = false): PageBreaks | null => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (immediate) {
      return runPagination();
    }
    rafRef.current = window.requestAnimationFrame(runPagination);
    return null;
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
      editor.view.dispatch(editor.view.state.tr.setMeta('paginationBreaks', EMPTY_BREAKS));
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
    const headerMargin = setup.headerMargin ?? 10;
    const footerMargin = setup.footerMargin ?? 10;
    return {
      '--paper-w': `${width}px`,
      '--paper-h': `${height}px`,
      '--margin-t': `${mmToPx(top)}px`,
      '--margin-r': `${mmToPx(right)}px`,
      '--margin-b': `${mmToPx(bottom)}px`,
      '--margin-l': `${mmToPx(left)}px`,
      '--header-margin': `${mmToPx(headerMargin)}px`,
      '--footer-margin': `${mmToPx(footerMargin)}px`,
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
