import { useState, useRef, type MouseEvent } from 'react';
import type { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';
import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import { PageScrollIndicator } from '@/modules/editor/components/PageScrollIndicator';
import { DocVerticalRuler } from '@/components/ruler';
import type { PaginationState } from '@/modules/editor/hooks/usePagination';
import type { ContextMenuPosition } from '@/modules/editor/types/editor.types';
import type { DocRecord, PageSetup } from '@/types/docs.types';

interface EditorCanvasProps {
  editor: Editor | null;
  paginationState: PaginationState;
  onContextMenu: (pos: ContextMenuPosition) => void;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  activeDoc?: DocRecord;
  onPageSetupChange?: (setup: PageSetup) => void;
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
  const [scrollIndicator, setScrollIndicator] = useState({
    currentPage: 1,
    topPx: 0,
    visible: false,
  });
  const scrollTimerRef = useRef<number | null>(null);

  const { viewMode, pageCount, isOverLimit, viewportStyle, schedulePagination } = paginationState;

  const handleScroll = () => {
    const wrap = paperWrapRef.current;
    if (!wrap || viewMode !== 'paged') return;

    const scrollTop = wrap.scrollTop;
    const clientHeight = wrap.clientHeight;
    const scrollHeight = wrap.scrollHeight;

    const pageHeightWithGap = (scrollHeight - 104) / Math.max(1, pageCount);
    const currentPage = Math.min(
      pageCount,
      Math.max(1, Math.floor((scrollTop + clientHeight / 2) / pageHeightWithGap) + 1),
    );

    const indicatorTop = Math.max(
      30,
      Math.min(clientHeight - 30, (scrollTop / (scrollHeight - clientHeight)) * clientHeight),
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

  return (
    <>
      {!sidebarOpen && (
        <button
          type="button"
          className="c-side_float-btn"
          title={t('sidebar.title')}
          aria-label={t('sidebar.title')}
          onClick={onOpenSidebar}
        >
          <Icon name="panel-left-open" size={16} />
        </button>
      )}

      <PageScrollIndicator
        currentPage={scrollIndicator.currentPage}
        totalPages={pageCount}
        topPx={scrollIndicator.topPx}
        visible={scrollIndicator.visible}
      />

      <div className="l-paper" ref={paperWrapRef} onScroll={handleScroll}>
        {isOverLimit && (
          <div className="c-page_banner">{t('pagination.maxPagesWarning')}</div>
        )}
        <div
          className={`c-page_view ${viewMode === 'paged' ? 'is-paged' : ''} relative`}
          style={viewportStyle}
          onContextMenu={handleContextMenuEvent}
        >
          {viewMode === 'paged' && (
            <>
              {onPageSetupChange && (
                <DocVerticalRuler
                  activeDoc={activeDoc}
                  onPageSetupChange={onPageSetupChange}
                  onPaginationUpdate={schedulePagination}
                />
              )}
              <div className="c-page_stack" aria-hidden="true">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <div key={i} className="c-page_item" />
                ))}
              </div>
            </>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
};
