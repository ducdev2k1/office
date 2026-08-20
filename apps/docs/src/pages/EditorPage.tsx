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
  useEditorModals,
  usePagination,
  usePrintDocument,
  type ContextMenuPosition,
} from '@/modules/editor';
import { FollowBanner, useFollowCollaborator } from '@/modules/collab';
import { AccessModeBanner } from '@/modules/collab/components/AccessModeBanner';
import { MentionPopover } from '@/modules/collab/components/MentionPopover';
import { MentionSuggest } from '@/modules/collab/components/MentionSuggest';
import { ShareDialog } from '@/modules/collab/components/ShareDialog';
import { VersionHistoryDialog } from '@/modules/collab/components/VersionHistoryDialog';
import { useAccessMode } from '@/modules/collab/hooks/useAccessMode';
import { useVersionHistory } from '@/modules/collab/hooks/useVersionHistory';
import { Header } from '@/modules/header';
import { SearchAndReplace } from '@/modules/search-replace';
import { DocsSidebar } from '@/modules/sidebar';
import { BubbleToolbar } from '@/modules/toolbar/components/BubbleToolbar';
import { LinkPopoverHost } from '@/modules/toolbar/components/LinkPopoverHost';
import { Toolbar } from '@/modules/toolbar';
import { ZoomControl } from '@/modules/toolbar/components/ZoomControl';
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
  const accessMode = useAccessMode();
  const isReadOnly = accessMode === 'view';

  const modals = useEditorModals();
  const {
    sidebarOpen,
    findOpen,
    docSettingsOpen,
    docSettingsTab,
    activeBand,
    helpOpen,
    contextMenu,
    versionHistoryOpen,
    shareOpen,
    setFindOpen,
    setDocSettingsOpen,
    setActiveBand,
    setHelpOpen,
    setContextMenu,
    setVersionHistoryOpen,
    setShareOpen,
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
    if (editor.storage.toc) {
      editor.storage.toc.onJump = (pos: number) => {
        editor.commands.setTextSelection(pos);
        editor.commands.scrollIntoView();
        editor.commands.focus();
      };
    }
  }, [editor, setLink]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!isReadOnly);
  }, [editor, isReadOnly]);

  useGlobalShortcuts(toggleFind, closeAllModals);

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
            onExportHtml: exportHtml,
            onExportText: exportText,
            onDelete: handleDeleteDoc,
            onInsertImage: handleImageUpload,
            onInsertTable: handleInsertTable,
            onInsertPageBreak: handleInsertPageBreak,
            onHeaderFooter: openHeaderFooter,
            onHelp: () => setHelpOpen(true),
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

          {editor && <BubbleToolbar editor={editor} onSetLink={setLink} />}
          {editor && <LinkPopoverHost editor={editor} />}
          {editor && <MentionPopover editor={editor} />}
          {editor && (
            <MentionSuggest
              editor={editor}
              users={() =>
                collaborators
                  .filter((c) => c.name)
                  .map((c) => ({ id: c.id, name: c.name }))
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

        {activeDoc && (
          <VersionHistoryDialog
            open={versionHistoryOpen}
            onClose={() => setVersionHistoryOpen(false)}
            versionHistory={versionHistory}
          />
        )}
        {activeDoc && (
          <ShareDialog
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            docId={activeDoc.id}
          />
        )}

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
