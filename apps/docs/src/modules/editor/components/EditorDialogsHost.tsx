import type { Editor } from '@tiptap/core';
import type { CommentsStore, CommentThread } from '@office/tiptap-extensions';
import type { DocRecord, PageSetup } from '@/types/docs.types';
import { HelpModal } from '@/modules/editor/components/HelpModal';
import { PageHeaderFooterPanel } from '@/modules/editor/components/PageHeaderFooterPanel';
import { WatermarkDialog } from '@/modules/editor/components/WatermarkDialog';
import { CommentsPanel } from '@/modules/editor/components/comments/CommentsPanel';
import { ShareDialog } from '@/modules/collab/components/ShareDialog';
import { VersionHistoryDialog } from '@/modules/collab/components/VersionHistoryDialog';
import type { useVersionHistory } from '@/modules/collab/hooks/useVersionHistory';
import { SearchAndReplace } from '@/modules/search-replace';
import { MoveToFolderDialog } from '@/modules/sidebar/components/MoveToFolderDialog';
import type { useEditorModals } from '@/modules/editor/hooks/useEditorModals';

interface EditorDialogsHostProps {
  editor: Editor | null;
  activeDoc: DocRecord | undefined;
  docs: DocRecord[];
  modals: ReturnType<typeof useEditorModals>;
  versionHistory: ReturnType<typeof useVersionHistory>;
  commentsStore: CommentsStore;
  threads: CommentThread[];
  currentUserId?: string;
  currentUserName?: string;
  selectedThreadId?: string | null;
  onSelectThread?: (threadId: string | null) => void;
  pendingComment?: { from: number; to: number; text: string } | null;
  onCancelPending?: () => void;
  onCommitPending?: (content: string) => void;
  onPageSetupChange: (setup: PageSetup) => void;
  onMoveToFolder: (docId: string, folderId: string | null) => void;
}

export const EditorDialogsHost = ({
  editor,
  activeDoc,
  docs,
  modals,
  versionHistory,
  commentsStore,
  threads,
  currentUserId,
  currentUserName,
  selectedThreadId,
  onSelectThread,
  pendingComment,
  onCancelPending,
  onCommitPending,
  onPageSetupChange,
  onMoveToFolder,
}: EditorDialogsHostProps) => {
  const {
    findOpen,
    docSettingsOpen,
    docSettingsTab,
    activeBand,
    helpOpen,
    versionHistoryOpen,
    shareOpen,
    watermarkOpen,
    moveToFolderOpen,
    commentsOpen,
    setFindOpen,
    setDocSettingsOpen,
    setActiveBand,
    setHelpOpen,
    setVersionHistoryOpen,
    setShareOpen,
    setWatermarkOpen,
    setMoveToFolderOpen,
    setCommentsOpen,
  } = modals;

  return (
    <>
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
          onPageSetupChange={onPageSetupChange}
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

      {activeDoc && (
        <WatermarkDialog
          open={watermarkOpen}
          onOpenChange={setWatermarkOpen}
          watermark={activeDoc.pageSetup?.watermark}
          onSave={(watermark) => {
            if (!activeDoc.pageSetup) return;
            onPageSetupChange({ ...activeDoc.pageSetup, watermark });
          }}
        />
      )}

      {activeDoc && (
        <MoveToFolderDialog
          open={moveToFolderOpen}
          onOpenChange={setMoveToFolderOpen}
          activeDoc={activeDoc}
          docs={docs}
          onMoveToFolder={onMoveToFolder}
        />
      )}

      <CommentsPanel
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        commentsStore={commentsStore}
        threads={threads}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        selectedThreadId={selectedThreadId}
        onSelectThread={onSelectThread}
        pendingComment={pendingComment}
        onCancelPending={onCancelPending}
        onCommitPending={onCommitPending}
      />
    </>
  );
};
