import type { Editor } from '@tiptap/core';
import type { DocRecord, PageSetup } from '@/types/docs.types';
import { HelpModal } from '@/modules/editor/components/HelpModal';
import { PageHeaderFooterPanel } from '@/modules/editor/components/PageHeaderFooterPanel';
import { WatermarkDialog } from '@/modules/editor/components/WatermarkDialog';
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
  onPageSetupChange: (setup: PageSetup) => void;
  onMoveToFolder: (docId: string, folderId: string | null) => void;
}

export const EditorDialogsHost = ({
  editor,
  activeDoc,
  docs,
  modals,
  versionHistory,
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
    setFindOpen,
    setDocSettingsOpen,
    setActiveBand,
    setHelpOpen,
    setVersionHistoryOpen,
    setShareOpen,
    setWatermarkOpen,
    setMoveToFolderOpen,
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
    </>
  );
};
