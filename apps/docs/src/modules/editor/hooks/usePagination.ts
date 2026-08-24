import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Editor } from '@tiptap/core';
import type { Transaction } from '@tiptap/pm/state';
import {
  analyzePagination,
  bumpBlockCache,
  collectTrDirtyRanges,
  EMPTY_BREAKS,
  MAX_PAGES,
  PAGE_GAP,
  type DirtyRange,
  type PageBreaks,
} from '@/modules/editor/utils/pagination.utils';
import { MAX_DIRTY_RANGES } from '@/modules/editor/utils/pagination-dirty.utils';
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
const IDLE_TIMEOUT_MS = 500;

const scheduleIdle = (callback: () => void): number => {
  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
  }
  return window.setTimeout(callback, 50) as unknown as number;
};

const cancelIdle = (handle: number): void => {
  if (typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(handle);
  } else {
    window.clearTimeout(handle);
  }
};

export interface PaginationState {
  viewMode: ViewMode;
  /** null = đang chờ phân trang nền (chưa đo xong lần đầu). */
  pageCount: number | null;
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
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const rafRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);
  const idleRef = useRef<number | null>(null);
  const latestBreaksRef = useRef<PageBreaks | null>(null);
  const activeDocRef = useRef(activeDoc);
  activeDocRef.current = activeDoc;
  const pendingDirtyRef = useRef<DirtyRange[]>([]);
  const lastSetupKeyRef = useRef<string | null>(null);
  const prevDocIdRef = useRef<string | undefined>(undefined);

  const clearScheduled = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (idleRef.current !== null) {
      cancelIdle(idleRef.current);
      idleRef.current = null;
    }
  };

  const runPagination = (overrideSetup?: PageSetup): PageBreaks | null => {
    rafRef.current = null;
    debounceRef.current = null;
    idleRef.current = null;
    if (!editor || editor.isDestroyed || !editor.view) return null;
    if (editor.view.composing) {
      schedulePagination();
      return null;
    }

    const setup = overrideSetup ?? activeDocRef.current?.pageSetup ?? DEFAULT_PAGE_SETUP();
    const docTitle = activeDocRef.current?.title ?? '';
    const metrics = computePaginationMetrics(setup, PAGE_GAP);

    // Đổi khổ giấy/margins làm rewrap toàn bộ nội dung — phải đo lại từ đầu.
    const setupKey = JSON.stringify(setup);
    if (lastSetupKeyRef.current !== null && lastSetupKeyRef.current !== setupKey) {
      bumpBlockCache();
    }
    lastSetupKeyRef.current = setupKey;

    // Single pass: block đã cache và không nằm trong vùng dirty được tái dùng.
    const { breaks: result, measuredCount } = analyzePagination(
      editor.view,
      setup,
      pendingDirtyRef.current,
    );
    pendingDirtyRef.current = [];

    editor.commands.setPaginationData({
      setup,
      metrics,
      docTitle,
      pageCount: measuredCount,
      isPaged: viewMode === 'paged',
      breaks: viewMode === 'paged' ? result : EMPTY_BREAKS,
    });

    latestBreaksRef.current = result;
    setPageCount(measuredCount);
    return result;
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

  const scheduleIdlePagination = () => {
    clearScheduled();
    idleRef.current = scheduleIdle(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        runPagination();
      });
    });
  };

  useEffect(
    () => () => {
      clearScheduled();
    },
    [],
  );

  useEffect(() => {
    if (!editor) return;
    const onTransaction = ({ transaction }: { transaction: Transaction }) => {
      if (!transaction.docChanged) return;
      const mapped = pendingDirtyRef.current.map((range) => ({
        from: transaction.mapping.map(range.from, -1),
        to: transaction.mapping.map(range.to, 1),
      }));
      const merged = [...mapped, ...collectTrDirtyRanges(transaction)];
      // Tràn ngân sách range: giữ an toàn bằng cách đo lại toàn bộ thay vì cắt cụt.
      if (merged.length > MAX_DIRTY_RANGES) {
        bumpBlockCache();
        pendingDirtyRef.current = [];
      } else {
        pendingDirtyRef.current = merged;
      }
      if (viewMode === 'paged') schedulePagination();
    };
    editor.on('transaction', onTransaction);
    return () => {
      editor.off('transaction', onTransaction);
    };
  }, [editor, viewMode]);

  useLayoutEffect(() => {
    if (!editor) return;
    if (prevDocIdRef.current !== undefined && prevDocIdRef.current !== activeDoc?.id) {
      setPageCount(null);
      latestBreaksRef.current = null;
      pendingDirtyRef.current = [];
    }
    prevDocIdRef.current = activeDoc?.id;
    if (viewMode === 'paged') {
      bumpBlockCache();
      scheduleIdlePagination();
    } else {
      bumpBlockCache();
      editor.commands.setPagedMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc?.id, activeDoc?.pageSetup, viewMode, editor]);

  // Title đổi không ảnh hưởng chiều cao block — chỉ cần cập nhật token header/footer.
  useEffect(() => {
    if (!editor || viewMode !== 'paged') return;
    schedulePagination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc?.title]);

  useEffect(() => {
    if (viewMode !== 'paged') return;
    let cancelled = false;
    document.fonts?.ready
      .then(() => {
        if (cancelled) return;
        bumpBlockCache();
        scheduleIdlePagination();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
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
    const pages = pageCount ?? 1;
    const stackHeight = pages * height + (pages - 1) * PAGE_GAP + 48;
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
    isOverLimit: pageCount != null && pageCount >= MAX_PAGES,
    zoom,
    viewportStyle,
    setViewMode,
    setZoom,
    schedulePagination,
  };
};
