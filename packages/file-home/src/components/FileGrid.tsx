import { useTranslation } from '@office/i18n';
import { InetIcon } from '@office/ui-kit';
import type { FileHomeActions, FileRecord, FileTab } from '../types';
import { KIND_ICON } from '../lib/icons';
import { FileRowMenu } from './FileRowMenu';
import { ConfirmDialog } from './ConfirmDialog';
import { useState, type KeyboardEvent } from 'react';

interface FileGridProps {
  files: FileRecord[];
  accentVar: string;
  tab: FileTab;
  actions: FileHomeActions;
}

export const FileGrid = ({ files, accentVar, tab, actions }: FileGridProps) => {
  const { t, formatRelativeTime } = useTranslation('appShell');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const confirmFile = files.find((file) => file.id === confirmId);
  const isTrash = tab === 'trash';

  const startRename = (file: FileRecord): void => {
    setEditingId(file.id);
    setDraft(file.title);
  };

  const commitRename = (): void => {
    if (editingId) actions.onRename(editingId, draft);
    setEditingId(null);
  };

  const handleRenameKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') commitRename();
    else if (event.key === 'Escape') setEditingId(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 px-1 py-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {files.map((file) => {
          return (
            <div
              key={file.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                className="flex h-28 items-center justify-center bg-muted outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                aria-label={t('fileActions.open')}
                onClick={() => actions.onOpen(file.id)}
              >
                <InetIcon name={KIND_ICON[file.kind]} size={48} className="text-muted-foreground" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-2 p-2">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: accentVar }}
                  aria-hidden="true"
                >
                  <InetIcon name={KIND_ICON[file.kind]} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  {editingId === file.id ? (
                    <input
                      autoFocus
                      aria-label={t('fileActions.rename')}
                      className="h-6 w-full rounded border border-ring bg-background px-1.5 text-sm text-foreground outline-none"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleRenameKey}
                      onBlur={commitRename}
                    />
                  ) : (
                    <div className="truncate text-sm text-foreground" title={file.title}>
                      {file.title}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {isTrash
                      ? file.deletedAt
                        ? formatRelativeTime(file.deletedAt)
                        : '—'
                      : formatRelativeTime(file.updatedAt)}
                  </div>
                </div>
                <div className="flex items-center">
                  {!isTrash && (
                    <button
                      type="button"
                      aria-label={file.starred ? t('fileActions.unstar') : t('fileActions.star')}
                      aria-pressed={file.starred}
                      className={`flex size-7 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                        file.starred
                          ? 'text-amber-500'
                          : 'text-muted-foreground opacity-0 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100'
                      }`}
                      onClick={() => actions.onStar(file.id)}
                    >
                      <InetIcon name="star" size={14} preferDuotone={file.starred} aria-hidden="true" />
                    </button>
                  )}
                  <FileRowMenu
                    file={file}
                    tab={tab}
                    actions={actions}
                    onRequestRename={() => startRename(file)}
                    onRequestDeleteForever={() => setConfirmId(file.id)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {confirmFile && (
        <ConfirmDialog
          open
          title={t('trash.title')}
          description={t('fileActions.confirmDeleteForever', { title: confirmFile.title })}
          confirmLabel={t('fileActions.deletePermanently')}
          onConfirm={() => actions.onDeleteForever(confirmFile.id)}
          onOpenChange={(open) => {
            if (!open) setConfirmId(null);
          }}
        />
      )}
    </>
  );
};