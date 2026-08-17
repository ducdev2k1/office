import { EditorContent } from '@tiptap/react';
import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SearchAndReplace } from '@/components/tiptap-ui/search-and-replace';
import { DocsSidebar } from '@/components/DocsSidebar';
import {
  EditorContextMenu,
  type ContextMenuPosition,
} from '@/components/EditorContextMenu';
import { Header } from '@/components/Header';
import { HelpModal } from '@/components/HelpModal';
import { PageSetupPanel } from '@/components/PageSetupPanel';
import { Toolbar } from '@/components/Toolbar';
import { useDocsEditor } from '@/editor/use-docs-editor';
import { usePagination } from '@/editor/use-pagination';
import { useEditorActions } from '@/hooks/use-editor-actions';
import { useDocs } from '@/hooks/use-docs';
import { useGlobalShortcuts } from '@/hooks/use-global-shortcuts';
import { usePrintSetup } from '@/hooks/use-print-setup';
import { useTheme } from '@/hooks/use-theme';
import { getOutline } from '@/lib/utils';
import { DEFAULT_PAGE_SETUP, getPaperSizePx, type PageSetup } from '@/types';
import { PAGE_GAP } from '@/editor/pagination';

const QUOTA_WARN_BYTES = 4.5 * 1024 * 1024;

export const EditorPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    docs,
    activeDoc,
    saveState,
    storageBytes,
    setActiveId,
    updateContent,
    updateTitle,
    addDoc,
    deleteDoc,
    setActiveDocPageSetup,
    markOpened,
  } = useDocs();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('docs-sidebar-open');
    return saved !== null ? saved === 'true' : true;
  });
  const [findOpen, setFindOpen] = useState(false);
  const [pageSetupOpen, setPageSetupOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPageIndicator, setShowPageIndicator] = useState(false);
  const [indicatorTop, setIndicatorTop] = useState(24);
  const fontPickerRef = useRef<HTMLSelectElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const paperWrapRef = useRef<HTMLElement>(null);
  const indicatorTimerRef = useRef<number | null>(null);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('docs-sidebar-open', String(next));
      return next;
    });
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    localStorage.setItem('docs-sidebar-open', 'false');
  };

  const handleSelectDoc = (docId: string) => {
    setActiveId(docId);
    if (window.innerWidth < 768) {
      handleCloseSidebar();
    }
  };

  const editor = useDocsEditor(activeDoc?.content ?? '', updateContent);
  const { viewMode, pageCount, isOverLimit, viewportStyle, setViewMode, schedulePagination } =
    usePagination(editor, activeDoc);
  const {
    setLink,
    exportHtml,
    exportText,
    handleImageUpload,
    handleInsertTable,
    handleInsertPageBreak,
  } = useEditorActions(editor, activeDoc);

  useEffect(() => {
    if (id) {
      setActiveId(id);
      markOpened(id);
    }
  }, [id, setActiveId]);
  useEffect(() => {
    if (editor && activeDoc && editor.getHTML() !== activeDoc.content)
      editor.commands.setContent(activeDoc.content, { emitUpdate: false });
  }, [activeDoc, editor]);
  useEffect(() => {
    if (!editor) return;
    editor.storage.keyboardShortcuts.onFocusFontPicker = () => fontPickerRef.current?.focus();
    editor.storage.keyboardShortcuts.onFocusColorPicker = () => colorPickerRef.current?.click();
  }, [editor]);
  useGlobalShortcuts(
    () => setFindOpen((value) => !value),
    () => {
      setFindOpen(false);
      setPageSetupOpen(false);
      setHelpOpen(false);
    },
  );
  usePrintSetup(activeDoc);

  const wordCount = useMemo(() => {
    const text = editor?.state.doc.textContent.trim() ?? '';
    return text ? text.split(/\s+/).length : 0;
  }, [editor?.state.doc.textContent]);
  const outline = useMemo(() => getOutline(activeDoc?.content ?? ''), [activeDoc?.content]);

  const handlePaperScroll = () => {
    const container = paperWrapRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return;

    const setup = activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP();
    const { height: paperH } = getPaperSizePx(setup);
    const totalPageH = paperH + PAGE_GAP;
    const currPage = Math.min(
      pageCount,
      Math.max(1, Math.floor((scrollTop + clientHeight * 0.3) / totalPageH) + 1),
    );
    setCurrentPage(currPage);

    const scrollRatio = Math.max(0, Math.min(1, scrollTop / maxScroll));
    const topPx = 28 + scrollRatio * (clientHeight - 56);
    setIndicatorTop(topPx);
    setShowPageIndicator(true);

    if (indicatorTimerRef.current !== null) {
      window.clearTimeout(indicatorTimerRef.current);
    }
    indicatorTimerRef.current = window.setTimeout(() => {
      setShowPageIndicator(false);
      indicatorTimerRef.current = null;
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (indicatorTimerRef.current !== null) {
        window.clearTimeout(indicatorTimerRef.current);
      }
    };
  }, []);

  const handleApplyPageSetup = (setup: PageSetup): void => {
    setActiveDocPageSetup(setup);
    setPageSetupOpen(false);
    schedulePagination(true);
  };

  return (
    <div className="docs-shell">
      <main className="doc-workspace">
        <Header
          title={activeDoc?.title ?? ''}
          onTitleChange={updateTitle}
          theme={theme}
          onToggleTheme={toggleTheme}
          menuActions={{
            editor,
            viewMode,
            canDelete: docs.length > 1,
            wordCount,
            charCount: editor?.state.doc.textContent.length ?? 0,
            onNewDoc: addDoc,
            onToggleSidebar: handleToggleSidebar,
            onToggleFind: () => setFindOpen((value) => !value),
            onPageSetup: () => setPageSetupOpen((value) => !value),
            onViewModeChange: setViewMode,
            onPrint: () => window.print(),
            onExportHtml: exportHtml,
            onExportText: exportText,
            onDelete: deleteDoc,
            onInsertImage: handleImageUpload,
            onInsertTable: handleInsertTable,
            onInsertPageBreak: handleInsertPageBreak,
            onHelp: () => setHelpOpen(true),
          }}
        />
        <Toolbar
          editor={editor}
          findOpen={findOpen}
          viewMode={viewMode}
          fontPickerRef={fontPickerRef}
          colorPickerRef={colorPickerRef}
          canDelete={docs.length > 1}
          onSetLink={setLink}
          onExportHtml={exportHtml}
          onExportText={exportText}
          onPrint={() => window.print()}
          onDelete={deleteDoc}
          onToggleFind={() => setFindOpen((value) => !value)}
          onInsertImage={handleImageUpload}
          onInsertTable={handleInsertTable}
          onInsertPageBreak={handleInsertPageBreak}
          onPageSetup={() => setPageSetupOpen((value) => !value)}
          onViewModeChange={setViewMode}
        />
        <div className="ruler" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
        <div className="editor-stage">
          <DocsSidebar
            docs={docs}
            activeId={activeDoc?.id ?? ''}
            query={query}
            outline={outline}
            sidebarOpen={sidebarOpen}
            onQueryChange={setQuery}
            onSelect={handleSelectDoc}
            onAdd={addDoc}
            onClose={handleCloseSidebar}
          />
          {!sidebarOpen && (
            <button
              type="button"
              className="sidebar-open-floating-btn"
              title={t('docs.header.toggleSidebar')}
              aria-label={t('docs.header.toggleSidebar')}
              onClick={handleToggleSidebar}
            >
              <Icon name="menu" />
            </button>
          )}
          <section
            ref={paperWrapRef}
            onScroll={handlePaperScroll}
            className="paper-wrap"
            aria-label={t('docs.header.titleAriaLabel')}
            onContextMenu={(event) => {
              event.preventDefault();
              setContextMenu({ x: event.clientX, y: event.clientY });
            }}
          >
            {isOverLimit && (
              <div className="page-limit-banner">
                {t('docs.warnings.pageLimitExceeded')}
              </div>
            )}
            <div
              className={`page-viewport ${viewMode === 'paged' ? 'is-paged' : ''}`}
              style={viewportStyle}
            >
              {viewMode === 'paged' && (
                <div className="page-stack">
                  {Array.from({ length: pageCount }, (_, index) => (
                    <div className="page" key={index} />
                  ))}
                </div>
              )}
              <EditorContent editor={editor} />
            </div>
          </section>
          {pageCount > 1 && (
            <div
              className={`page-scroll-indicator ${showPageIndicator ? 'visible' : ''}`}
              style={{ top: `${indicatorTop}px` }}
              aria-hidden="true"
            >
              {t('common.status.pageOf', { current: currentPage, total: pageCount })}
            </div>
          )}
        </div>
        <footer className="statusbar">
          <span>{t('common.status.wordsCount', { count: wordCount })}</span>
          <span>{t('common.status.charsCount', { count: editor?.state.doc.textContent.length ?? 0 })}</span>
          {viewMode === 'paged' && <span>{t('common.status.pagesCount', { count: pageCount })}</span>}
          <span className={storageBytes > QUOTA_WARN_BYTES ? 'quota-warn' : ''}>
            {t('common.status.quotaWarning', { used: (storageBytes / (1024 * 1024)).toFixed(1), total: '5' })}
          </span>
          <span>
            <Icon name="check" aria-hidden="true" /> {saveState}
          </span>
        </footer>
        {editor && (
          <SearchAndReplace
            editor={editor}
            open={findOpen}
            onOpen={() => setFindOpen(true)}
            onClose={() => setFindOpen(false)}
          />
        )}
        {activeDoc?.pageSetup && (
          <PageSetupPanel
            open={pageSetupOpen}
            setup={activeDoc.pageSetup}
            onApply={handleApplyPageSetup}
            onClose={() => setPageSetupOpen(false)}
          />
        )}
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        <EditorContextMenu
          editor={editor}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onInsertImage={handleImageUpload}
          onInsertTable={handleInsertTable}
          onInsertPageBreak={handleInsertPageBreak}
          onToggleFind={() => setFindOpen((value) => !value)}
        />
      </main>
    </div>
  );
};

export default EditorPage;