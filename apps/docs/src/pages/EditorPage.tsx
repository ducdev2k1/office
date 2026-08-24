import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@office/i18n';
import { useDocs } from '@/hooks/useDocs';
import { useDocPermissions } from '@/hooks/useDocPermissions';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useTheme } from '@/hooks/useTheme';
import {
  EditorCanvas,
  EditorContextMenu,
  Ruler,
  SlashCommandSuggest,
  Statusbar,
  WordCountFloatingBadge,
  useCollabEditor,
  useDocStats,
  useDocumentOutline,
  useEditorActions,
  useEditorModals,
  usePagination,
  usePrintDocument,
} from '@/modules/editor';
import { EditorDialogsHost } from '@/modules/editor/components/EditorDialogsHost';
import { TrackChangesBar } from '@/modules/editor/components/track-changes/TrackChangesBar';
import { useEditorComments } from '@/modules/editor/hooks/useEditorComments';
import { useTrackChanges } from '@/modules/editor/hooks/useTrackChanges';
import { FollowBanner, useFollowCollaborator, useCurrentUserProfile } from '@/modules/collab';
import { AccessModeBanner } from '@/modules/collab/components/AccessModeBanner';
import { MentionPopover } from '@/modules/collab/components/MentionPopover';
import { MentionSuggest } from '@/modules/collab/components/MentionSuggest';
import { useAccessMode } from '@/modules/collab/hooks/useAccessMode';
import { ensureOwnerGrant } from '@/services/docGrants.service';
import { restrictAccessMode } from '@/utils/permissions.utils';
import { useVersionHistory } from '@/modules/collab/hooks/useVersionHistory';
import { Header } from '@/modules/header';
import { DocsSidebar } from '@/modules/sidebar';
import { BubbleToolbar } from '@/modules/toolbar/components/BubbleToolbar';
import { ImageBubbleToolbar } from '@/modules/toolbar/components/ImageBubbleToolbar';
import { LinkPopoverHost } from '@/modules/toolbar/components/LinkPopoverHost';
import { Toolbar } from '@/modules/toolbar';
import type { PageSetup } from '@/types/docs.types';

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

  const profile = useCurrentUserProfile().profile;
  const urlAccessMode = useAccessMode();
  const { grants, can: canDo } = useDocPermissions(activeDoc?.id ?? null, profile.id);

  useEffect(() => {
    if (!activeDoc) return;
    void ensureOwnerGrant(activeDoc.id, profile).catch((err) =>
      console.warn('[EditorPage] Failed to ensure owner grant:', err),
    );
  }, [activeDoc?.id]);

  const accessMode = restrictAccessMode(urlAccessMode, grants, profile.id);
  const isReadOnly = accessMode === 'view';
  const modals = useEditorModals();
  const fontPickerRef = useRef<HTMLButtonElement>(null);
  const colorPickerRef = useRef<HTMLButtonElement>(null);
  const hiddenImageInputRef = useRef<HTMLInputElement>(null);

  const handleSelectDoc = (docId: string) => {
    setActiveId(docId);
    navigate(`/edit/${docId}`);
    if (window.innerWidth < 768) modals.handleCloseSidebar();
  };

  const handleDeleteDoc = () => {
    if (!activeDoc) return;
    const remaining = docs.filter((doc) => !doc.deletedAt && doc.id !== activeDoc.id);
    if (remaining.length === 0) return;
    deleteDoc();
    navigate(`/edit/${remaining[0]!.id}`);
  };

  const {
    editor,
    collabStatus,
    collaborators,
    currentUser,
    updateProfile,
    collabRoom,
    commentsStore,
    threads,
    suggestionStore,
    suggestions,
  } = useCollabEditor(
    activeDoc,
    updateContent,
    isReadOnly,
    (threadId) => comments.handleSelectCommentThread(threadId),
    (sugId) => trackChanges.handleSelectSuggestion(sugId),
  );

  const comments = useEditorComments(editor, commentsStore, currentUser, () =>
    modals.setCommentsOpen(true),
  );
  const trackChanges = useTrackChanges(suggestionStore, suggestions);
  const { followedUser, followedClientId, stopFollow, toggleFollow } = useFollowCollaborator({
    editor,
    provider: collabRoom.provider,
    collaborators,
  });

  const paginationState = usePagination(editor, activeDoc);
  const { viewMode, setViewMode, schedulePagination, zoom, setZoom } = paginationState;
  const versionHistory = useVersionHistory(activeDoc, collabRoom.doc);

  const actions = useEditorActions(editor, activeDoc);
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
    handleInsertMath,
    handleInsertFootnote,
    handleInsertColumns,
    handleInsertChart,
    handleInsertCallout,
  } = actions;

  useEffect(() => {
    if (!editor) return;
    const storage = (editor.storage as any)?.chartBlock;
    if (storage) {
      storage.onEditChart = (attrs: any) => {
        modals.setEditingChartAttrs(attrs);
        modals.setChartEditorOpen(true);
      };
    }
  }, [editor, modals]);

  useEffect(() => {
    if (id) {
      setActiveId(id);
      markOpened(id);
    }
  }, [id, setActiveId, markOpened]);

  const outline = useDocumentOutline(editor);
  const canDelete = docs.filter((doc) => !doc.deletedAt).length > 1;
  const { wordCount, charCount } = useDocStats(editor);
  const { printDocument } = usePrintDocument(editor, activeDoc, paginationState);

  useGlobalShortcuts(modals.toggleFind, modals.closeAllModals);

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
          onMenuToggle={modals.handleToggleSidebar}
          theme={theme}
          onToggleTheme={toggleTheme}
          starred={Boolean(activeDoc?.starred)}
          onToggleStar={() => activeDoc && star(activeDoc.id)}
          onMoveToFolder={() => modals.setMoveToFolderOpen(true)}
          onToggleComments={modals.toggleComments}
          commentsCount={threads.filter((t) => !t.resolved).length}
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
            onToggleSidebar: modals.handleToggleSidebar,
            onToggleFind: modals.toggleFind,
            onPageSetup: modals.openPageSetup,
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
            onInsertMath: () => modals.setMathEditorOpen(true),
            onInsertFootnote: () => handleInsertFootnote(),
            onInsertColumns: (cols) => handleInsertColumns(cols),
            onInsertChart: () => modals.setChartEditorOpen(true),
            onInsertCallout: () => handleInsertCallout('info'),
            onWatermark: () => modals.setWatermarkOpen(true),
            onHeaderFooter: modals.openHeaderFooter,
            onWordCount: () => modals.setWordCountOpen(true),
            onVnAdmin: () => modals.setVnAdminOpen(true),
            onHelp: () => modals.setHelpOpen(true),
            onVersionHistory: () => modals.setVersionHistoryOpen(true),
            onShare: canDo('share') ? () => modals.setShareOpen(true) : undefined,
          }}
        />

        <Toolbar
          editor={editor}
          findOpen={modals.findOpen}
          viewMode={viewMode}
          zoom={zoom}
          onZoomChange={setZoom}
          fontPickerRef={fontPickerRef}
          colorPickerRef={colorPickerRef}
          canDelete={canDelete}
          isReadOnly={isReadOnly}
          onSetLink={setLink}
          onExportHtml={exportHtml}
          onExportText={exportText}
          onPrint={() => void printDocument()}
          onDelete={handleDeleteDoc}
          onToggleFind={modals.toggleFind}
          onInsertImage={handleImageUpload}
          onInsertTable={handleInsertTable}
          onInsertPageBreak={handleInsertPageBreak}
          onInsertMath={() => modals.setMathEditorOpen(true)}
          onPageSetup={modals.openPageSetup}
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

          <TrackChangesBar
            isSuggesting={trackChanges.isSuggesting}
            onToggleSuggesting={() => trackChanges.setIsSuggesting((prev) => !prev)}
            pendingSuggestions={trackChanges.pendingSuggestions}
            onAcceptAll={() => suggestionStore.acceptAll()}
            onRejectAll={() => suggestionStore.rejectAll()}
            onSelectNext={trackChanges.handleSelectNextSuggestion}
            onSelectPrev={trackChanges.handleSelectPrevSuggestion}
          />

          <DocsSidebar
            docs={docs}
            activeId={activeDoc?.id ?? ''}
            query={query}
            outline={outline}
            sidebarOpen={modals.sidebarOpen}
            onQueryChange={setQuery}
            onSelect={handleSelectDoc}
            onAdd={addDoc}
            onClose={modals.handleCloseSidebar}
          />

          <EditorCanvas
            editor={editor}
            paginationState={paginationState}
            onContextMenu={modals.setContextMenu}
            sidebarOpen={modals.sidebarOpen}
            onOpenSidebar={modals.handleToggleSidebar}
            activeDoc={activeDoc}
            onPageSetupChange={handlePageSetupChange}
          />

          {editor && (
            <BubbleToolbar
              editor={editor}
              onSetLink={setLink}
              onAddComment={comments.handleStartAddComment}
            />
          )}
          {editor && <ImageBubbleToolbar editor={editor} />}
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
                  if (node.type.name === 'mention' && node.attrs.id) ids.push(node.attrs.id);
                });
                return ids;
              }}
            />
          )}

          {editor && (
            <SlashCommandSuggest
              editor={editor}
              onOpenImageUpload={() => hiddenImageInputRef.current?.click()}
              onOpenMathDialog={() => modals.setMathEditorOpen(true)}
              onOpenChartDialog={() => modals.setChartEditorOpen(true)}
            />
          )}

          <WordCountFloatingBadge
            editor={editor}
            visible={modals.showFloatingWordCount}
            onClick={() => modals.setWordCountOpen(true)}
          />

          <input
            ref={hiddenImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = '';
            }}
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

        <EditorDialogsHost
          editor={editor}
          activeDoc={activeDoc}
          docs={docs}
          modals={modals}
          versionHistory={versionHistory}
          commentsStore={commentsStore}
          threads={threads}
          currentUserId={currentUser?.id}
          currentUserName={currentUser?.name}
          selectedThreadId={comments.selectedThreadId}
          onSelectThread={comments.setSelectedThreadId}
          pendingComment={comments.pendingComment}
          onCancelPending={() => comments.setPendingComment(null)}
          onCommitPending={comments.handleCommitPendingComment}
          onPageSetupChange={handlePageSetupChange}
          onMoveToFolder={moveToFolder}
          onInsertMath={(tex, isBlock) => handleInsertMath(tex, isBlock)}
          onInsertChart={(chartAttrs) => handleInsertChart(chartAttrs)}
          pageCount={paginationState.pageCount}
          selectedSuggestion={trackChanges.selectedSuggestion}
          onAcceptSuggestion={trackChanges.handleAcceptSuggestion}
          onRejectSuggestion={trackChanges.handleRejectSuggestion}
          onCloseSuggestion={() => trackChanges.setSelectedSuggestionId(null)}
        />

        <EditorContextMenu
          editor={editor}
          position={modals.contextMenu}
          onClose={() => modals.setContextMenu(null)}
          onInsertImage={handleImageUpload}
          onInsertTable={handleInsertTable}
          onInsertPageBreak={handleInsertPageBreak}
          onToggleFind={modals.toggleFind}
          onAddComment={comments.handleStartAddComment}
          isReadOnly={isReadOnly}
        />
      </main>
    </div>
  );
};

export default EditorPage;
