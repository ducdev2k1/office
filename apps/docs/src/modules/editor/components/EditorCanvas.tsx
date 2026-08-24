import { useCallback, useEffect, useRef, type MouseEvent } from 'react';
import type { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';
import { useTranslation } from '@office/i18n';
import { Icon, Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
import { PageStack } from '@/modules/editor/components/PageStack';
import { DocVerticalRuler } from '@/components/ruler';
import type { PaginationState } from '@/modules/editor/hooks/usePagination';
import type { ContextMenuPosition } from '@/modules/editor/types/editor.types';
import {
  DEFAULT_PAGE_SETUP,
  type DocRecord,
  type HeaderFooterSlot,
  type PageSetup,
} from '@/types/docs.types';

interface EditorCanvasProps {
  editor: Editor | null;
  paginationState: PaginationState;
  onContextMenu: (pos: ContextMenuPosition) => void;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  activeDoc?: DocRecord;
  onPageSetupChange?: (setup: PageSetup) => void;
}

// Hằng số module-level để memo(PageStack) so sánh tham chiếu ổn định khi doc
// chưa có pageSetup riêng (object mới mỗi render sẽ vô hiệu hoá memo).
const FALLBACK_PAGE_SETUP = DEFAULT_PAGE_SETUP();

export const EditorCanvas = ({
  editor,
  paginationState,
  onContextMenu,
  sidebarOpen,
  onOpenSidebar,
  activeDoc,
  onPageSetupChange,
}: EditorCanvasProps) => {
  const { t } = useTranslation('docs');
  const paperWrapRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const { viewMode, pageCount, isOverLimit, viewportStyle, schedulePagination } = paginationState;

  /**
   * Cuộn được xử lý hoàn toàn bằng DOM trực tiếp (indicator + ruler) — không setState
   * trong frame để tránh re-render PageStack/ruler hàng trăm band mỗi khung hình.
   */
  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const wrap = paperWrapRef.current;
      const indicator = indicatorRef.current;
      if (!wrap || viewMode !== 'paged') return;

      const safePageCount = Math.max(1, pageCount ?? 1);
      const currentScrollTop = wrap.scrollTop;
      const clientHeight = wrap.clientHeight;
      const scrollHeight = wrap.scrollHeight;

      window.dispatchEvent(
        new CustomEvent('doc-vruler-scroll', { detail: { scrollTop: currentScrollTop } }),
      );

      if (!indicator) return;

      const pageHeightWithGap = (scrollHeight - 104) / safePageCount;
      const currentPage = Math.min(
        safePageCount,
        Math.max(1, Math.floor((currentScrollTop + clientHeight / 2) / pageHeightWithGap) + 1),
      );
      const indicatorTop = Math.max(
        30,
        Math.min(
          clientHeight - 30,
          (currentScrollTop / Math.max(1, scrollHeight - clientHeight)) * clientHeight,
        ),
      );

      indicator.style.top = `${indicatorTop}px`;
      indicator.textContent = `${currentPage} / ${safePageCount}`;
      indicator.style.opacity = '1';

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => {
        hideTimerRef.current = null;
        if (indicatorRef.current) indicatorRef.current.style.opacity = '0';
      }, 1200);
    });
  }, [viewMode, pageCount]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    },
    [],
  );

  const handleContextMenuEvent = (event: MouseEvent) => {
    if (event.shiftKey) return;
    event.preventDefault();
    onContextMenu({ x: event.clientX, y: event.clientY });
  };

  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    const td = target?.closest('td');
    const headerOrFooter = target?.closest(
      '.tiptap-page-header, .tiptap-page-footer, .page-header, .page-footer',
    ) as HTMLElement | null;

    if (td && headerOrFooter) {
      const isHeader =
        headerOrFooter.classList.contains('page-header') ||
        headerOrFooter.classList.contains('tiptap-page-header');
      const band: 'header' | 'footer' = isHeader ? 'header' : 'footer';
      const cellIndex = (td as HTMLTableCellElement).cellIndex;
      const slots: Array<keyof HeaderFooterSlot> = ['left', 'center', 'right'];
      const slot = slots[cellIndex] ?? 'center';

      window.dispatchEvent(
        new CustomEvent('doc-open-hf-panel', {
          detail: { band, pageIndex: 0, slot },
        }),
      );
    }
  };

  return (
    <div className="editor-canvas flex flex-1 min-h-0 min-w-0 relative overflow-hidden">
      {!sidebarOpen && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="sidebar-open-floating-btn absolute top-3.5 left-7 z-25 grid place-items-center size-9 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-hover shadow-sm hover:shadow transition-all cursor-pointer"
                aria-label={t('sidebar.title')}
                onClick={onOpenSidebar}
              >
                <Icon name="panel-left-open" size={16} />
              </button>
            }
          />
          <TooltipContent side="right">{t('sidebar.title')}</TooltipContent>
        </Tooltip>
      )}

      {/* Left-aligned Vertical Ruler */}
      {viewMode === 'paged' && onPageSetupChange && (
        <DocVerticalRuler
          activeDoc={activeDoc}
          onPageSetupChange={onPageSetupChange}
          onPaginationUpdate={schedulePagination}
        />
      )}

      <div
        ref={indicatorRef}
        className="page-scroll-indicator absolute right-4.5 z-30 px-2.5 py-1 rounded-full bg-black/85 text-white text-xs font-medium pointer-events-none -translate-y-1/2 shadow"
        style={{ top: '30px', opacity: '0', transition: 'opacity 150ms ease-out' }}
        aria-hidden="true"
      />

      <div
        className="paper-wrap flex-1 min-w-0 overflow-y-auto"
        ref={paperWrapRef}
        onScroll={handleScroll}
      >
        {isOverLimit && (
          <div className="mb-2.5 py-2 px-3.5 text-center text-xs bg-amber-500/10 border-b border-amber-500/30 text-amber-700 dark:text-amber-400 rounded">
            {t('pagination.maxPagesWarning')}
          </div>
        )}
        <div
          className={cn('page-viewport relative', viewMode === 'paged' && 'is-paged')}
          style={viewportStyle}
          onContextMenu={handleContextMenuEvent}
          onDoubleClick={handleDoubleClick}
          ref={viewportRef}
        >
          {viewMode === 'paged' && (
            <PageStack
              pageCount={pageCount ?? 1}
              setup={activeDoc?.pageSetup ?? FALLBACK_PAGE_SETUP}
              docTitle={activeDoc?.title ?? ''}
            />
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
