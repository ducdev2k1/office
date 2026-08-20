import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@office/i18n';
import { useDocs } from '@/hooks/useDocs';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useTheme } from '@/hooks/useTheme';
import {
  EditorCanvas,
  EditorContextMenu,
  HelpModal,
  PageHeaderFooterPanel,
  Ruler,
  Statusbar,
  useCollabEditor,
  useEditorActions,
  usePagination,
  usePrintDocument,
  type ContextMenuPosition,
} from '@/modules/editor';
import { Header } from '@/modules/header';
import { SearchAndReplace } from '@/modules/search-replace';
import { DocsSidebar } from '@/modules/sidebar';
import { Toolbar } from '@/modules/toolbar';
import type { PageSetup } from '@/types/docs.types';
import { getOutline } from '@/utils/outline.utils';

export const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('docs');
  const navigate = useNavigate();
  const {
    docs,
    activeDoc,
    storageBytes,
    saveState,
    setActiveId,
    updateContent,
    updateTitle,
    addDoc,
    importFile,
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
  const [docSettingsOpen, setDocSettingsOpen] = useState(false);
  const [docSettingsTab, setDocSettingsTab] = useState<'document' | 'headerFooter'>('headerFooter');
  const [activeBand, setActiveBand] = useState<'header' | 'footer'>('header');
  const [helpOpen, setHelpOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);

  const fontPickerRef = useRef<HTMLButtonElement>(null);
  const colorPickerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleOpenHf = (event: Event) => {
      const customEvent = event as CustomEvent<{ band?: 'header' | 'footer' }>;
      if (customEvent.detail?.band) {
        setActiveBand(customEvent.detail.band);
      }
      setDocSettingsTab('headerFooter');
      setDocSettingsOpen(true);
    };

    window.addEventListener('doc-open-hf-panel', handleOpenHf);
    return () => {
      window.removeEventListener('doc-open-hf-panel', handleOpenHf);
    };
  }, []);

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
    navigate(`/edit/${docId}`);
    if (window.innerWidth < 768) {
      handleCloseSidebar();
    }
  };

  const handleDeleteDoc = () => {
    const current = activeDoc;
    if (!current) return;
    const remaining = docs.filter((doc) => !doc.deletedAt && doc.id !== current.id);
    if (remaining.length === 0) return;
    deleteDoc();
    navigate(`/edit/${remaining[0]!.id}`);
  };

  const { editor, collabStatus, collaborators, currentUser, updateProfile } = useCollabEditor(
    activeDoc,
    updateContent,
  );

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
    if (!editor || editor.isDestroyed) return;
    editor.storage.keyboardShortcuts.onFocusFontPicker = () => fontPickerRef.current?.click();
    editor.storage.keyboardShortcuts.onFocusColorPicker = () => colorPickerRef.current?.click();
    editor.storage.keyboardShortcuts.onSetLink = setLink;
  }, [editor, setLink]);

  useGlobalShortcuts(
    () => setFindOpen((value) => !value),
    () => {
      setFindOpen(false);
      setDocSettingsOpen(false);
      setHelpOpen(false);
    },
  );

  const { printDocument } = usePrintDocument(editor, activeDoc, paginationState);

  const wordCount = useMemo(() => {
    const text = editor?.state?.doc?.textContent?.trim() ?? '';
    return text ? text.split(/\s+/).length : 0;
  }, [editor?.state?.doc?.textContent]);

  const charCount = editor?.state?.doc?.textContent?.length ?? 0;
  const outline = useMemo(() => getOutline(activeDoc?.content ?? ''), [activeDoc?.content]);

  const activeDocCount = useMemo(() => docs.filter((doc) => !doc.deletedAt).length, [docs]);
  const canDelete = activeDocCount > 1;

  const handleApplyPageSetup = (setup: PageSetup): void => {
    setActiveDocPageSetup(setup);
    setDocSettingsOpen(false);
    schedulePagination(true);
  };

  const handleOpenFromDevice = (file: File): void => {
    void importFile(file)
      .then((docId) => navigate(`/edit/${docId}`))
      .catch(() => window.alert(t('menu.file.openFromDeviceError')));
  };

  return (
    <div className="app-shell-root h-screen min-h-screen overflow-hidden">
      <main className="doc-workspace flex flex-col h-screen min-h-screen bg-workspace overflow-hidden">
        <Header
          title={activeDoc?.title ?? ''}
          onTitleChange={updateTitle}
          onMenuToggle={handleToggleSidebar}
          theme={theme}
          onToggleTheme={toggleTheme}
          starred={Boolean(activeDoc?.starred)}
          onToggleStar={() => activeDoc && star(activeDoc.id)}
          collabStatus={collabStatus}
          collaborators={collaborators}
          currentUser={currentUser}
          onUpdateCurrentUserProfile={updateProfile}
          menuActions={{
            editor,
            viewMode,
            canDelete,
            wordCount,
            charCount,
            onNewDoc: addDoc,
            onOpenFromDevice: handleOpenFromDevice,
            onToggleSidebar: handleToggleSidebar,
            onToggleFind: () => setFindOpen((value) => !value),
            onPageSetup: () => {
              setDocSettingsTab('document');
              setDocSettingsOpen(true);
            },
            onViewModeChange: setViewMode,
            onPrint: () => void printDocument(),
            onExportHtml: exportHtml,
            onExportText: exportText,
            onDelete: handleDeleteDoc,
            onInsertImage: handleImageUpload,
            onInsertTable: handleInsertTable,
            onInsertPageBreak: handleInsertPageBreak,
            onHeaderFooter: () => {
              setDocSettingsTab('headerFooter');
              setDocSettingsOpen(true);
            },
            onHelp: () => setHelpOpen(true),
          }}
        />

        <Toolbar
          editor={editor}
          findOpen={findOpen}
          viewMode={viewMode}
          fontPickerRef={fontPickerRef}
          colorPickerRef={colorPickerRef}
          canDelete={canDelete}
          onSetLink={setLink}
          onExportHtml={exportHtml}
          onExportText={exportText}
          onPrint={() => void printDocument()}
          onDelete={handleDeleteDoc}
          onToggleFind={() => setFindOpen((value) => !value)}
          onInsertImage={handleImageUpload}
          onInsertTable={handleInsertTable}
          onInsertPageBreak={handleInsertPageBreak}
          onPageSetup={() => {
            setDocSettingsTab('document');
            setDocSettingsOpen((value) => !value);
          }}
          onViewModeChange={setViewMode}
        />

        <Ruler
          editor={editor}
          activeDoc={activeDoc}
          onPageSetupChange={setActiveDocPageSetup}
          onPaginationUpdate={schedulePagination}
        />

        <div className="editor-stage flex flex-1 min-h-0 relative overflow-y-hidden overflow-x-clip">
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
          saveState={saveState}
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

        {docSettingsOpen && activeDoc?.pageSetup && (
          <PageHeaderFooterPanel
            open={docSettingsOpen}
            setup={activeDoc.pageSetup}
            docTitle={activeDoc.title}
            defaultTab={docSettingsTab}
            activeBand={activeBand}
            onActiveBandChange={setActiveBand}
            onPageSetupChange={(setup) => {
              setActiveDocPageSetup(setup);
              schedulePagination(true, setup);
            }}
            onClose={() => setDocSettingsOpen(false)}
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
