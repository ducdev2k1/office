import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@office/i18n';
import { useDocs } from '@/hooks/useDocs';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useTheme } from '@/hooks/useTheme';
import {
  EditorCanvas,
  EditorContextMenu,
  Ruler,
  Statusbar,
  useCollabEditor,
  useEditorActions,
  useEditorModals,
  usePagination,
  usePrintDocument,
  type ContextMenuPosition,
} from '@/modules/editor';
import { EditorDialogsHost } from '@/modules/editor/components/EditorDialogsHost';
import { FollowBanner, useFollowCollaborator } from '@/modules/collab';
import { AccessModeBanner } from '@/modules/collab/components/AccessModeBanner';
import { MentionPopover } from '@/modules/collab/components/MentionPopover';
import { MentionSuggest } from '@/modules/collab/components/MentionSuggest';
import { useAccessMode } from '@/modules/collab/hooks/useAccessMode';
import { useVersionHistory } from '@/modules/collab/hooks/useVersionHistory';
import { Header } from '@/modules/header';
import { DocsSidebar } from '@/modules/sidebar';
import { BubbleToolbar } from '@/modules/toolbar/components/BubbleToolbar';
import { LinkPopoverHost } from '@/modules/toolbar/components/LinkPopoverHost';
import { Toolbar } from '@/modules/toolbar';
import { ZoomControl } from '@/modules/toolbar/components/ZoomControl';
import type { PageSetup } from '@/types/docs.types';
import { getOutline } from '@/utils/outline.utils';

export const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('docs');
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');

  const {
    docs,
    activeDoc,
    saveState,
    storageBytes,
    setActiveId,
    updateContent,
    updateTitle,
    addDoc,
    importFile,
    deleteDoc,
    setActiveDocPageSetup,
    moveToFolder,
    star,
    markOpened,
  } = useDocs();

  const accessMode = useAccessMode();
  const isReadOnly = accessMode === 'view';

  const modals = useEditorModals();
  const {
    sidebarOpen,
    findOpen,
    contextMenu,
    setContextMenu,
    setVersionHistoryOpen,
    setShareOpen,
    setWatermarkOpen,
    setMoveToFolderOpen,
    handleToggleSidebar,
    handleCloseSidebar,
    openPageSetup,
    openHeaderFooter,
    toggleFind,
    closeAllModals,
  } = modals;

  const fontPickerRef = useRef<HTMLButtonElement>(null);
  const colorPickerRef = useRef<HTMLButtonElement>(null);

  const handleSelectDoc = (docId: string) => {
    setActiveId(docId);
    navigate(`/edit/${docId}`);
    if (window.innerWidth < 768) handleCloseSidebar();
  };

  const handleDeleteDoc = () => {
    const current = activeDoc;
    if (!current) return;
    const remaining = docs.filter((doc) => !doc.deletedAt && doc.id !== current.id);
    if (remaining.length === 0) return;
    deleteDoc();
    navigate(`/edit/${remaining[0]!.id}`);
  };

  const { editor, collabStatus, collaborators, currentUser, updateProfile, collabRoom } =
    useCollabEditor(activeDoc, updateContent, isReadOnly);

  const { followedUser, followedClientId, stopFollow, toggleFollow } = useFollowCollaborator({
    editor,
    provider: collabRoom.provider,
    collaborators,
  });

  const paginationState = usePagination(editor, activeDoc);
  const { viewMode, setViewMode, schedulePagination, zoom, setZoom } = paginationState;

  const versionHistory = useVersionHistory(activeDoc, collabRoom.doc);

  const {
    setLink,
    exportDocx,
    exportMarkdown,
    exportHtml,
    exportText,
    handleImageUpload,
    handleInsertTable,
    handleInsertPageBreak,
    handleInsertSectionBreak,
    handleInsertBookmark,
  } = useEditorActions(editor, activeDoc);

  useEffect(() => {
    if (id) {
      setActiveId(id);
      markOpened(id);
    }
  }, [id, setActiveId, markOpened]);

  useEffect(() => {
    schedulePagination(true);
  }, [activeDoc?.pageSetup, schedulePagination]);

  const outline = useMemo(() => getOutline(editor?.getHTML() ?? ''), [editor]);
  const activeCount = docs.filter((doc) => !doc.deletedAt).length;
  const canDelete = activeCount > 1;

  const wordCount = editor?.storage.characterCount?.words?.() ?? 0;
  const charCount = editor?.storage.characterCount?.characters?.() ?? 0;

  const { printDocument } = usePrintDocument(editor, activeDoc, paginationState);

  useGlobalShortcuts(toggleFind, closeAllModals);

  const handleOpenFromDevice = (file: File): void => {
    void importFile(file)
      .then((docId) => navigate(`/edit/${docId}`))
      .catch(() => window.alert(t('menu.file.openFromDeviceError')));
  };

  const handlePageSetupChange = (setup: PageSetup) => {
    setActiveDocPageSetup(setup);
    schedulePagination(true, setup);
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
          onMoveToFolder={() => setMoveToFolderOpen(true)}
          collabStatus={collabStatus}
          collaborators={collaborators}
          currentUser={currentUser}
          onUpdateCurrentUserProfile={updateProfile}
          followedClientId={followedClientId}
          onToggleFollow={toggleFollow}
          isReadOnly={isReadOnly}
          menuActions={{
            editor,
            viewMode,
            canDelete,
            wordCount,
            charCount,
            isReadOnly,
            onNewDoc: addDoc,
            onOpenFromDevice: handleOpenFromDevice,
            onToggleSidebar: handleToggleSidebar,
            onToggleFind: toggleFind,
            onPageSetup: openPageSetup,
            onViewModeChange: setViewMode,
            onPrint: () => void printDocument(),
            onExportDocx: () => void exportDocx(),
            onExportMarkdown: exportMarkdown,
            onExportPdf: () => void printDocument(),
            onExportHtml: exportHtml,
            onExportText: exportText,
            onDelete: handleDeleteDoc,
            onInsertImage: handleImageUpload,
            onInsertTable: handleInsertTable,
            onInsertPageBreak: handleInsertPageBreak,
            onInsertSectionBreak: handleInsertSectionBreak,
            onInsertBookmark: handleInsertBookmark,
            onWatermark: () => setWatermarkOpen(true),
            onHeaderFooter: openHeaderFooter,
            onHelp: () => modals.setHelpOpen(true),
            onVersionHistory: () => setVersionHistoryOpen(true),
            onShare: () => setShareOpen(true),
          }}
        />

        <Toolbar
          editor={editor}
          findOpen={findOpen}
          viewMode={viewMode}
          fontPickerRef={fontPickerRef}
          colorPickerRef={colorPickerRef}
          canDelete={canDelete}
          isReadOnly={isReadOnly}
          onSetLink={setLink}
          onExportHtml={exportHtml}
          onExportText={exportText}
          onPrint={() => void printDocument()}
          onDelete={handleDeleteDoc}
          onToggleFind={toggleFind}
          onInsertImage={handleImageUpload}
          onInsertTable={handleInsertTable}
          onInsertPageBreak={handleInsertPageBreak}
          onPageSetup={openPageSetup}
          onViewModeChange={setViewMode}
        />

        <Ruler
          editor={editor}
          activeDoc={activeDoc}
          onPageSetupChange={setActiveDocPageSetup}
          onPaginationUpdate={schedulePagination}
        />

        <div className="editor-stage flex flex-1 min-h-0 relative overflow-y-hidden overflow-x-clip">
          <AccessModeBanner mode={accessMode} />
          <FollowBanner followedUser={followedUser} onStopFollow={stopFollow} />

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

          <EditorCanvas
            editor={editor}
            paginationState={paginationState}
            onContextMenu={setContextMenu}
            sidebarOpen={sidebarOpen}
            onOpenSidebar={handleToggleSidebar}
            activeDoc={activeDoc}
            onPageSetupChange={handlePageSetupChange}
          />

          {editor && <BubbleToolbar editor={editor} onSetLink={setLink} />}
          {editor && <LinkPopoverHost editor={editor} />}
          {editor && <MentionPopover editor={editor} />}
          {editor && (
            <MentionSuggest
              editor={editor}
              users={() =>
                collaborators.filter((c) => c.name).map((c) => ({ id: c.id, name: c.name }))
              }
              getMentionedIds={() => {
                if (!editor) return [];
                const ids: string[] = [];
                editor.state.doc.descendants((node) => {
                  if (node.type.name === 'mention') {
                    const mentionId = node.attrs.id as string | undefined;
                    if (mentionId) ids.push(mentionId);
                  }
                });
                return ids;
              }}
            />
          )}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-0.5 rounded-lg border border-border bg-card/90 px-1.5 py-1 shadow-lg backdrop-blur">
            <ZoomControl zoom={zoom} onZoomChange={setZoom} />
          </div>
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

        <EditorDialogsHost
          editor={editor}
          activeDoc={activeDoc}
          docs={docs}
          modals={modals}
          versionHistory={versionHistory}
          onPageSetupChange={handlePageSetupChange}
          onMoveToFolder={moveToFolder}
        />

        <EditorContextMenu
          editor={editor}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onInsertImage={handleImageUpload}
          onInsertTable={handleInsertTable}
          onInsertPageBreak={handleInsertPageBreak}
          onToggleFind={toggleFind}
          isReadOnly={isReadOnly}
        />
      </main>
    </div>
  );
};

export default EditorPage;
