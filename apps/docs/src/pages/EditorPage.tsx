import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@office/i18n';
import type { PageSetup } from '@/types/docs.types';
import { useDocs } from '@/hooks/useDocs';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { getOutline } from '@/utils/outline.utils';
import { Header } from '@/modules/header';
import { Toolbar } from '@/modules/toolbar';
import { DocsSidebar } from '@/modules/sidebar';
import {
  EditorCanvas,
  EditorContextMenu,
  HelpModal,
  PageSetupPanel,
  Ruler,
  Statusbar,
  useDocsEditor,
  useEditorActions,
  usePagination,
  usePrintSetup,
  type ContextMenuPosition,
} from '@/modules/editor';
import { SearchAndReplace } from '@/modules/search-replace';

export const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    docs,
    activeDoc,
    storageBytes,
    setActiveId,
    updateContent,
    updateTitle,
    addDoc,
    deleteDoc,
    setActiveDocPageSetup,
    markOpened,
    rename,
    duplicate,
    star,
    trash,
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

  const fontPickerRef = useRef<HTMLSelectElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);

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
  const paginationState = usePagination(editor, activeDoc);
  const { viewMode, setViewMode, schedulePagination } = paginationState;

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
  }, [id, setActiveId, markOpened]);

  useEffect(() => {
    if (editor && activeDoc && editor.getHTML() !== activeDoc.content) {
      editor.commands.setContent(activeDoc.content, { emitUpdate: false });
    }
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

  const charCount = editor?.state.doc.textContent.length ?? 0;
  const outline = useMemo(() => getOutline(activeDoc?.content ?? ''), [activeDoc?.content]);

  const handleApplyPageSetup = (setup: PageSetup): void => {
    setActiveDocPageSetup(setup);
    setPageSetupOpen(false);
    schedulePagination(true);
  };

  return (
    <div className="l-shell">
      <main className="l-work">
        <Header
          title={activeDoc?.title ?? ''}
          onTitleChange={updateTitle}
          onMenuToggle={handleToggleSidebar}
          theme={theme}
          onToggleTheme={toggleTheme}
          menuActions={{
            editor,
            viewMode,
            canDelete: docs.length > 1,
            wordCount,
            charCount,
            onNewDoc: addDoc,
            onToggleSidebar: handleToggleSidebar,
            onToggleFind: () => setFindOpen((value) => !value),
            onPageSetup: () => setPageSetupOpen(true),
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

        <Ruler
          editor={editor}
          activeDoc={activeDoc}
          onPageSetupChange={setActiveDocPageSetup}
          onPaginationUpdate={schedulePagination}
        />

        <div className="l-stage">
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
            onRename={rename}
            onDuplicate={duplicate}
            onStar={star}
            onTrash={trash}
          />

          <EditorCanvas
            editor={editor}
            paginationState={paginationState}
            onContextMenu={setContextMenu}
            sidebarOpen={sidebarOpen}
            onOpenSidebar={handleToggleSidebar}
            activeDoc={activeDoc}
            onPageSetupChange={setActiveDocPageSetup}
          />
        </div>

        <Statusbar
          wordCount={wordCount}
          charCount={charCount}
          pageCount={paginationState.pageCount}
          viewMode={viewMode}
          storageUsage={storageBytes}
          lastSavedAt={activeDoc ? new Date(activeDoc.updatedAt) : null}
        />

        {editor && (
          <SearchAndReplace
            editor={editor}
            open={findOpen}
            onOpen={() => setFindOpen(true)}
            onClose={() => setFindOpen(false)}
          />
        )}

        {pageSetupOpen && activeDoc?.pageSetup && (
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
