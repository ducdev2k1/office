import { EditorContent } from '@tiptap/react';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SearchAndReplace } from './components/tiptap-ui/search-and-replace';
import { DocsSidebar } from './components/DocsSidebar';
import {
  EditorContextMenu,
  type ContextMenuPosition,
} from './components/EditorContextMenu';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { PageSetupPanel } from './components/PageSetupPanel';
import { Toolbar } from './components/Toolbar';
import { useDocsEditor } from './editor/use-docs-editor';
import { usePagination } from './editor/use-pagination';
import { useEditorActions } from './hooks/use-editor-actions';
import { useDocs } from './hooks/use-docs';
import { useGlobalShortcuts } from './hooks/use-global-shortcuts';
import { usePrintSetup } from './hooks/use-print-setup';
import { getOutline } from './lib/utils';
import type { PageSetup } from './types';

const QUOTA_WARN_BYTES = 4.5 * 1024 * 1024;

const App = () => {
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
  } = useDocs();
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [pageSetupOpen, setPageSetupOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const fontPickerRef = useRef<HTMLSelectElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);

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
          onMenuToggle={() => setSidebarOpen((value) => !value)}
          menuActions={{
            editor,
            viewMode,
            canDelete: docs.length > 1,
            wordCount,
            charCount: editor?.state.doc.textContent.length ?? 0,
            onNewDoc: addDoc,
            onToggleSidebar: () => setSidebarOpen((value) => !value),
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
            onSelect={(id) => {
              setActiveId(id);
              setSidebarOpen(false);
            }}
            onAdd={addDoc}
            onClose={() => setSidebarOpen(false)}
          />
          <section
            className="paper-wrap"
            aria-label="Noi dung tai lieu"
            onContextMenu={(event) => {
              event.preventDefault();
              setContextMenu({ x: event.clientX, y: event.clientY });
            }}
          >
            {isOverLimit && (
              <div className="page-limit-banner">
                Tai lieu qua dai cho page view MVP (toi da 50 trang).
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
        </div>
        <footer className="statusbar">
          <span>{wordCount} tu</span>
          <span>{editor?.state.doc.textContent.length ?? 0} ky tu</span>
          {viewMode === 'paged' && <span>{pageCount} trang</span>}
          <span className={storageBytes > QUOTA_WARN_BYTES ? 'quota-warn' : ''}>
            ~{(storageBytes / (1024 * 1024)).toFixed(1)} MB / 5 MB
          </span>
          <span>
            <Check aria-hidden="true" /> {saveState}
          </span>
        </footer>
        {editor && (
          <SearchAndReplace
            editor={editor}
            open={findOpen}
            onOpen={() => setFindOpen(true)}
            onClose={() => setFindOpen(false)}
            style={{
              position: 'fixed',
              top: '128px',
              right: '16px',
              zIndex: 40,
            }}
          />
        )}
        {pageSetupOpen && activeDoc?.pageSetup && (
          <PageSetupPanel
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

export default App;
