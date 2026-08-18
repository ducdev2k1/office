import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import { useState, type KeyboardEvent } from 'react';
import type { FileHomeActions, FileRecord, FileTab } from '../types';
import { KIND_ICON } from '../lib/icons';
import { FileRowMenu } from './FileRowMenu';
import { ConfirmDialog } from './ConfirmDialog';

interface FileListProps {
  files: FileRecord[];
  accentVar: string;
  tab: FileTab;
  actions: FileHomeActions;
}

export const FileList = ({ files, accentVar, tab, actions }: FileListProps) => {
  const { t, formatRelativeTime } = useTranslation('appShell');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
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
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th scope="col" className="w-full py-2 pr-2 font-medium">
              {t('fileList.name')}
            </th>
            <th scope="col" className="whitespace-nowrap py-2 pr-2 font-medium">
              {isTrash ? t('fileList.deletedAt') : t('fileList.lastModified')}
            </th>
            {!isTrash && (
              <th scope="col" className="whitespace-nowrap py-2 pr-2 font-medium">
                {t('fileList.lastOpened')}
              </th>
            )}
            <th scope="col" className="w-10 py-2 font-medium">
              <span className="sr-only">{t('fileActions.star')}</span>
            </th>
            <th scope="col" className="w-10 py-2 font-medium">
              <span className="sr-only">{t('fileActions.open')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const openedAt = isTrash ? file.deletedAt : file.lastOpenedAt;
            return (
              <tr
                key={file.id}
                className="group border-t border-border transition-colors hover:bg-hover"
              >
                <td className="max-w-0 px-1 py-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-md text-white"
                      style={{ backgroundColor: accentVar }}
                      aria-hidden="true"
                    >
                      <Icon name={KIND_ICON[file.kind]} size={16} />
                    </span>
                    {editingId === file.id ? (
                      <input
                        autoFocus
                        aria-label={t('fileActions.rename')}
                        className="h-7 flex-1 rounded border border-ring bg-background px-2 text-sm text-foreground outline-none"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={handleRenameKey}
                        onBlur={commitRename}
                      />
                    ) : (
                      <button
                        type="button"
                        className="truncate text-left text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                        title={file.title}
                        onClick={() => actions.onOpen(file.id)}
                      >
                        {file.title}
                      </button>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-1 py-2.5 text-muted-foreground">
                  {isTrash
                    ? openedAt
                      ? formatRelativeTime(openedAt)
                      : '—'
                    : formatRelativeTime(file.updatedAt)}
                </td>
                {!isTrash && (
                  <td className="whitespace-nowrap px-1 py-2.5 text-muted-foreground">
                    {file.lastOpenedAt ? formatRelativeTime(file.lastOpenedAt) : '—'}
                  </td>
                )}
                <td className="px-1 py-2.5">
                  {!isTrash && (
                    <button
                      type="button"
                      aria-label={file.starred ? t('fileActions.unstar') : t('fileActions.star')}
                      aria-pressed={file.starred}
                      className={`flex size-8 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                        file.starred
                          ? 'text-amber-500'
                          : 'text-muted-foreground opacity-0 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100'
                      }`}
                      onClick={() => actions.onStar(file.id)}
                    >
                      <Icon name="star" size={16} preferDuotone={file.starred} aria-hidden="true" />
                    </button>
                  )}
                </td>
                <td className="px-1 py-2.5">
                  <FileRowMenu
                    file={file}
                    tab={tab}
                    actions={actions}
                    onRequestRename={() => startRename(file)}
                    onRequestDeleteForever={() => setConfirmId(file.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
