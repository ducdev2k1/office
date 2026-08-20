import { useState } from 'react';
import { useTranslation } from '@office/i18n';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Icon, ScrollArea } from '@office/ui-kit';
import { cn } from '@office/ui-kit';
import type { DocHistoryRecord } from '@/services/docs.service';
import type { VersionHistoryState } from '@/modules/collab/hooks/useVersionHistory';

interface VersionHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  versionHistory: VersionHistoryState;
}

const formatTime = (time: string): string => {
  const date = new Date(time);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export const VersionHistoryDialog = ({ open, onClose, versionHistory }: VersionHistoryDialogProps) => {
  const { t } = useTranslation('docs');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { versions, loading, restoreVersion, removeVersion, clearVersions, previewVersion } =
    versionHistory;

  const selected = versions.find((v) => v.id === selectedId) ?? null;

  const handleRestore = () => {
    if (!selected) return;
    if (window.confirm(t('versionHistory.confirmRestore'))) {
      restoreVersion(selected);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    await removeVersion(selected.id);
    setSelectedId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('versionHistory.title')}</DialogTitle>
          <DialogDescription>{t('versionHistory.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid flex-1 min-h-0 grid-cols-[220px_1fr] gap-4 overflow-hidden">
          <ScrollArea className="h-full border-r border-border pr-2">
            {loading ? (
              <div className="space-y-2">
                <div className="h-12 animate-pulse rounded-md bg-muted" />
                <div className="h-12 animate-pulse rounded-md bg-muted" />
                <div className="h-12 animate-pulse rounded-md bg-muted" />
              </div>
            ) : versions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('versionHistory.empty')}</p>
            ) : (
              <ul className="space-y-1">
                {versions.map((version) => (
                  <li key={version.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-hover',
                        selectedId === version.id && 'bg-primary/10 text-primary',
                      )}
                      onClick={() => setSelectedId(version.id)}
                    >
                      <div className="font-medium">{formatTime(version.time)}</div>
                      <div className="text-xs text-muted-foreground">
                        {version.author ?? t('versionHistory.unknownAuthor')}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          <div className="flex min-h-0 flex-col gap-3">
            {selected ? (
              <>
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  {previewVersion(selected)}
                </div>
                <p className="text-xs text-muted-foreground">{t('versionHistory.previewNote')}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={handleRestore}>
                    <Icon name="history" size={14} />
                    {t('versionHistory.restore')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void handleDelete()}>
                    <Icon name="trash-2" size={14} />
                    {t('versionHistory.delete')}
                  </Button>
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('versionHistory.selectPrompt')}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => void clearVersions()}>
            {t('versionHistory.clearAll')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};