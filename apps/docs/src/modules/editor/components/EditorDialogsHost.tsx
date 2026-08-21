import type { Editor } from '@tiptap/core';
import type { CommentsStore, CommentThread, TrackSuggestion } from '@office/tiptap-extensions';
import type { DocRecord, PageSetup } from '@/types/docs.types';
import { HelpModal } from '@/modules/editor/components/HelpModal';
import { PageHeaderFooterPanel } from '@/modules/editor/components/PageHeaderFooterPanel';
import { WatermarkDialog } from '@/modules/editor/components/WatermarkDialog';
import { MathEditorDialog } from '@/modules/editor/components/MathEditorDialog';
import { ChartEditorDialog } from '@/modules/editor/components/ChartEditorDialog';
import { WordCountDialog } from '@/modules/editor/components/WordCountDialog';
import { VnAdminStandardDialog } from '@/modules/editor/components/VnAdminStandardDialog';
import { SuggestionCard } from '@/modules/editor/components/track-changes/SuggestionCard';
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
  onInsertMath?: (tex: string, isBlock: boolean) => void;
  onInsertChart?: (attrs: any) => void;
  pageCount?: number;
  selectedSuggestion?: TrackSuggestion | null;
  onAcceptSuggestion?: (id: string) => void;
  onRejectSuggestion?: (id: string) => void;
  onCloseSuggestion?: () => void;
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
  onInsertMath,
  selectedSuggestion,
  onAcceptSuggestion,
  onRejectSuggestion,
  onCloseSuggestion,
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
    mathEditorOpen,
    setFindOpen,
    setDocSettingsOpen,
    setActiveBand,
    setHelpOpen,
    setVersionHistoryOpen,
    setShareOpen,
    setWatermarkOpen,
    setMoveToFolderOpen,
    setCommentsOpen,
    setMathEditorOpen,
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

      <MathEditorDialog
        open={mathEditorOpen}
        onOpenChange={setMathEditorOpen}
        onSave={(tex, isBlock) => onInsertMath?.(tex, isBlock)}
      />

      <ChartEditorDialog
        open={modals.chartEditorOpen}
        initialAttrs={modals.editingChartAttrs}
        onClose={() => {
          modals.setChartEditorOpen(false);
          modals.setEditingChartAttrs(null);
        }}
        onSave={(attrs) => {
          if (modals.editingChartAttrs && editor) {
            editor.chain().focus().updateChart(attrs).run();
          } else if (onInsertChart) {
            onInsertChart(attrs);
          } else if (editor) {
            editor.chain().focus().insertChart(attrs).run();
          }
        }}
      />

      <WordCountDialog
        open={modals.wordCountOpen}
        editor={editor}
        pageCount={pageCount ?? 1}
        onClose={() => modals.setWordCountOpen(false)}
        showFloating={modals.showFloatingWordCount}
        onToggleFloating={modals.toggleFloatingWordCount}
      />

      <VnAdminStandardDialog
        open={modals.vnAdminOpen}
        editor={editor}
        pageSetup={activeDoc?.pageSetup}
        onClose={() => modals.setVnAdminOpen(false)}
        onApplyPageSetup={onPageSetupChange}
      />

      {selectedSuggestion && onAcceptSuggestion && onRejectSuggestion && onCloseSuggestion && (
        <div className="fixed bottom-14 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <SuggestionCard
            suggestion={selectedSuggestion}
            onAccept={onAcceptSuggestion}
            onReject={onRejectSuggestion}
            onClose={onCloseSuggestion}
          />
        </div>
      )}
    </>
  );
};
