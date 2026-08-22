import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Editor } from '@tiptap/core';
import {
  analyzePagination,
  MAX_PAGES,
  PAGE_GAP,
  type PageBreaks,
} from '@/modules/editor/utils/pagination.utils';
import {
  DEFAULT_PAGE_SETUP,
  getPaperSizePx,
  mmToPx,
  type DocRecord,
  type PageSetup,
} from '@/types/docs.types';
import type { ViewMode } from '@/modules/editor/types/editor.types';
import { computePaginationMetrics } from '@/modules/editor/extensions/pagination.extension';

/** Debounce repagination khi gõ liên tục — chỉ chạy sau khi ngừng thay đổi doc. */
const REPAGINATION_DEBOUNCE_MS = 300;

export interface PaginationState {
  viewMode: ViewMode;
  pageCount: number;
  isOverLimit: boolean;
  zoom: number;
  viewportStyle: CSSProperties;
  setViewMode: (mode: ViewMode) => void;
  setZoom: (zoom: number) => void;
  schedulePagination: (immediate?: boolean, overrideSetup?: PageSetup) => PageBreaks | null;
}

export const usePagination = (
  editor: Editor | null,
  activeDoc: DocRecord | undefined,
): PaginationState => {
  const [viewMode, setViewMode] = useState<ViewMode>('paged');
  const [pageCount, setPageCount] = useState(1);
  const [zoom, setZoom] = useState(1);
  const rafRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);
  const latestBreaksRef = useRef<PageBreaks | null>(null);
  const activeDocRef = useRef(activeDoc);
  activeDocRef.current = activeDoc;

  const runPagination = (overrideSetup?: PageSetup): PageBreaks | null => {
    rafRef.current = null;
    debounceRef.current = null;
    if (!editor || editor.isDestroyed || !editor.view) return null;
    if (editor.view.composing) {
      schedulePagination();
      return null;
    }

    const setup = overrideSetup ?? activeDocRef.current?.pageSetup ?? DEFAULT_PAGE_SETUP();
    const docTitle = activeDocRef.current?.title ?? '';
    const metrics = computePaginationMetrics(setup, PAGE_GAP);

    // Single pass: đo block 1 lần, dùng chung cho cả page breaks lẫn pageCount.
    const { breaks: result, measuredCount } = analyzePagination(editor.view, setup);

    editor.commands.setPaginationData({
      setup,
      metrics,
      docTitle,
      pageCount: measuredCount,
      isPaged: viewMode === 'paged',
    });

    latestBreaksRef.current = result;
    setPageCount(measuredCount);
    return result;
  };

  const clearScheduled = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  const schedulePagination = (immediate = false, overrideSetup?: PageSetup): PageBreaks | null => {
    clearScheduled();
    if (immediate) {
      return runPagination(overrideSetup);
    }
    debounceRef.current = window.setTimeout(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        runPagination(overrideSetup);
      });
    }, REPAGINATION_DEBOUNCE_MS);
    return latestBreaksRef.current;
  };

  useEffect(
    () => () => {
      clearScheduled();
    },
    [],
  );

  useEffect(() => {
    if (!editor) return;
    const onTransaction = ({ transaction }: { transaction: { docChanged: boolean } }) => {
      if (!transaction.docChanged) return;
      if (viewMode === 'paged') schedulePagination();
    };
    editor.on('transaction', onTransaction);
    return () => {
      editor.off('transaction', onTransaction);
    };
  }, [editor, viewMode]);

  useLayoutEffect(() => {
    if (!editor) return;
    if (viewMode === 'paged') {
      schedulePagination(true);
    } else {
      editor.commands.setPagedMode(false);
    }
  }, [activeDoc?.id, activeDoc?.pageSetup, activeDoc?.title, viewMode, editor]);

  useEffect(() => {
    if (viewMode !== 'paged') return;
    document.fonts?.ready.then(() => schedulePagination(true)).catch(() => undefined);
  }, [viewMode, editor]);

  // Mobile (<768px): tự scale trang A4 vừa chiều ngang màn hình.
  useEffect(() => {
    if (viewMode !== 'paged') return;
    let wasMobile = window.innerWidth < 768;
    const applyFitZoom = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      if (wasMobile === isMobile) return;
      wasMobile = isMobile;
      if (!isMobile) {
        setZoom(1);
        return;
      }
      const setup = activeDocRef.current?.pageSetup ?? DEFAULT_PAGE_SETUP();
      const { width: paperW } = getPaperSizePx(setup);
      setZoom(Math.max(0.35, Math.min(1, (width - 16) / paperW)));
    };
    if (wasMobile) {
      const setup = activeDocRef.current?.pageSetup ?? DEFAULT_PAGE_SETUP();
      const { width: paperW } = getPaperSizePx(setup);
      setZoom(Math.max(0.35, Math.min(1, (window.innerWidth - 16) / paperW)));
    }
    window.addEventListener('resize', applyFitZoom);
    return () => window.removeEventListener('resize', applyFitZoom);
  }, [viewMode]);

  const pageStyle = useMemo<CSSProperties>(() => {
    const setup = activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP();
    const { width, height } = getPaperSizePx(setup);
    const { top, right, bottom, left } = setup.margins;
    const headerMargin = setup.headerMargin ?? 12.5;
    const footerMargin = setup.footerMargin ?? 12.5;
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
    const { width, height } = getPaperSizePx(setup);
    const stackHeight = pageCount * height + (pageCount - 1) * PAGE_GAP + 48;
    return {
      ...pageStyle,
      '--stack-h': `${stackHeight}px`,
      minHeight: `${stackHeight * zoom}px`,
      '--zoom-scale': String(zoom),
      transform: `scale(${zoom})`,
      transformOrigin: 'top center',
      width: `${width * zoom}px`,
      maxWidth: `${width * zoom}px`,
      marginLeft: 'auto',
      marginRight: 'auto',
    } as CSSProperties;
  }, [viewMode, pageCount, activeDoc?.pageSetup, pageStyle, zoom]);

  return {
    viewMode,
    pageCount,
    isOverLimit: pageCount >= MAX_PAGES,
    zoom,
    viewportStyle,
    setViewMode,
    setZoom,
    schedulePagination,
  };
};
