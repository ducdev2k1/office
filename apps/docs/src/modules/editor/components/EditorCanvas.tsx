import { useEffect, useState, useRef, type MouseEvent } from 'react';
import type { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';
import { useTranslation } from '@office/i18n';
import { Icon, cn } from '@office/ui-kit';
import { PageScrollIndicator } from '@/modules/editor/components/PageScrollIndicator';
import { HeaderFooterInlineEditor } from '@/modules/editor/components/HeaderFooterInlineEditor';
import { PageStack, type InlineEditRequest } from '@/modules/editor/components/PageStack';
import { DocVerticalRuler } from '@/components/ruler';
import type { PaginationState } from '@/modules/editor/hooks/usePagination';
import type { ContextMenuPosition } from '@/modules/editor/types/editor.types';
import {
  DEFAULT_HEADER_FOOTER_SLOT,
  DEFAULT_PAGE_SETUP,
  type DocRecord,
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

interface InlineEditState extends InlineEditRequest {
  rect: { top: number; left: number; width: number; height: number };
  initial: string;
}

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
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollIndicator, setScrollIndicator] = useState({
    currentPage: 1,
    topPx: 0,
    visible: false,
  });
  const [hfEdit, setHfEdit] = useState<InlineEditState | null>(null);
  const scrollTimerRef = useRef<number | null>(null);

  const { viewMode, pageCount, isOverLimit, viewportStyle, schedulePagination } = paginationState;

  useEffect(() => {
    setHfEdit(null);
  }, [activeDoc?.id, viewMode]);

  const handleScroll = () => {
    const wrap = paperWrapRef.current;
    if (!wrap || viewMode !== 'paged') return;

    const currentScrollTop = wrap.scrollTop;
    setScrollTop(currentScrollTop);

    const clientHeight = wrap.clientHeight;
    const scrollHeight = wrap.scrollHeight;

    const pageHeightWithGap = (scrollHeight - 104) / Math.max(1, pageCount);
    const currentPage = Math.min(
      pageCount,
      Math.max(1, Math.floor((currentScrollTop + clientHeight / 2) / pageHeightWithGap) + 1),
    );

    const indicatorTop = Math.max(
      30,
      Math.min(clientHeight - 30, (currentScrollTop / (scrollHeight - clientHeight)) * clientHeight),
    );

    setScrollIndicator({
      currentPage,
      topPx: indicatorTop,
      visible: true,
    });

    if (scrollTimerRef.current !== null) {
      window.clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = window.setTimeout(() => {
      setScrollIndicator((prev) => ({ ...prev, visible: false }));
    }, 1200);
  };

  const handleContextMenuEvent = (event: MouseEvent) => {
    event.preventDefault();
    onContextMenu({ x: event.clientX, y: event.clientY });
  };

  const handleEditBand = (request: InlineEditRequest) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const vpRect = viewport.getBoundingClientRect();
    const setup = activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP();
    const bandData = request.band === 'header' ? setup.header : setup.footer;
    setHfEdit({
      ...request,
      rect: {
        top: request.rect.top - vpRect.top,
        left: request.rect.left - vpRect.left,
        width: request.rect.width,
        height: request.rect.height,
      },
      initial: bandData?.[request.slot] ?? '',
    });
  };

  const handleHfCommit = (value: string) => {
    const current = hfEdit;
    if (!current) return;
    const setup = activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP();
    const bandData = setup[current.band] ?? DEFAULT_HEADER_FOOTER_SLOT();
    const updated: PageSetup = {
      ...setup,
      [current.band]: { ...bandData, [current.slot]: value },
    };
    onPageSetupChange?.(updated);
    schedulePagination(true);
    setHfEdit(null);
  };

  return (
    <div className="editor-canvas flex flex-1 min-h-0 min-w-0 relative overflow-hidden">
      {!sidebarOpen && (
        <button
          type="button"
          className="sidebar-open-floating-btn absolute top-3.5 left-7 z-25 grid place-items-center size-9 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-hover shadow-sm hover:shadow transition-all cursor-pointer"
          title={t('sidebar.title')}
          aria-label={t('sidebar.title')}
          onClick={onOpenSidebar}
        >
          <Icon name="panel-left-open" size={16} />
        </button>
      )}

      {/* Left-aligned Vertical Ruler (Sát mép màn hình bên trái) */}
      {viewMode === 'paged' && onPageSetupChange && (
        <DocVerticalRuler
          activeDoc={activeDoc}
          onPageSetupChange={onPageSetupChange}
          onPaginationUpdate={schedulePagination}
          scrollTop={scrollTop}
        />
      )}

      <PageScrollIndicator
        currentPage={scrollIndicator.currentPage}
        totalPages={pageCount}
        topPx={scrollIndicator.topPx}
        visible={scrollIndicator.visible}
      />

      <div className="paper-wrap flex-1 min-w-0 overflow-y-auto" ref={paperWrapRef} onScroll={handleScroll}>
        {isOverLimit && (
          <div className="mb-2.5 py-2 px-3.5 text-center text-xs bg-amber-500/10 border-b border-amber-500/30 text-amber-700 dark:text-amber-400 rounded">
            {t('pagination.maxPagesWarning')}
          </div>
        )}
        <div
          className={cn('page-viewport relative', viewMode === 'paged' && 'is-paged')}
          style={viewportStyle}
          onContextMenu={handleContextMenuEvent}
          ref={viewportRef}
        >
          {viewMode === 'paged' && (
            <PageStack
              pageCount={pageCount}
              setup={activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP()}
              docTitle={activeDoc?.title ?? ''}
              onEditBand={handleEditBand}
            />
          )}
          <EditorContent editor={editor} />
          {hfEdit && (
            <HeaderFooterInlineEditor
              key={`${hfEdit.band}-${hfEdit.pageIndex}-${hfEdit.slot}`}
              band={hfEdit.band}
              rect={hfEdit.rect}
              initialValue={hfEdit.initial}
              onCommit={handleHfCommit}
              onCancel={() => setHfEdit(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
