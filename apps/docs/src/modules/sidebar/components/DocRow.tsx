import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { DocRecord } from '@/types/docs.types';
import { useTranslation } from '@office/i18n';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@office/ui-kit';

interface DocRowProps {
  doc: DocRecord;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onDuplicate?: (id: string) => void;
  onStar?: (id: string) => void;
  onTrash?: (id: string) => void;
}

export const DocRow = ({
  doc,
  isActive,
  onSelect,
  onRename,
  onDuplicate,
  onStar,
  onTrash,
}: DocRowProps) => {
  const { t, formatDateTime } = useTranslation('docs');
  const { t: tShell } = useTranslation('appShell');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(doc.title);

  const startRename = () => {
    setIsEditing(true);
    setDraft(doc.title);
  };

  const commitRename = () => {
    if (isEditing && onRename) {
      onRename(doc.id, draft.trim() || t('header.titlePlaceholder'));
    }
    setIsEditing(false);
  };

  const handleRenameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitRename();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsEditing(false);
    }
  };

  const handleOpenInNewTab = (docId: string) => {
    window.open(`/edit/${docId}`, '_blank');
  };

  const renderMenuItems = (isContext: boolean) => {
    const MenuItem = isContext ? ContextMenuItem : DropdownMenuItem;
    const MenuSep = isContext ? ContextMenuSeparator : DropdownMenuSeparator;

    return (
      <>
        <MenuItem onClick={() => onSelect(doc.id)}>
          <Icon name="file-text" size={16} aria-hidden="true" />
          <span>{tShell('fileActions.open')}</span>
        </MenuItem>
        <MenuItem onClick={() => handleOpenInNewTab(doc.id)}>
          <Icon name="external-link" size={16} aria-hidden="true" />
          <span>{tShell('fileActions.openInNewTab')}</span>
        </MenuItem>
        <MenuSep />
        {onRename && (
          <MenuItem onClick={startRename}>
            <Icon name="pencil" size={16} aria-hidden="true" />
            <span>{tShell('fileActions.rename')}</span>
          </MenuItem>
        )}
        {onDuplicate && (
          <MenuItem onClick={() => onDuplicate(doc.id)}>
            <Icon name="copy" size={16} aria-hidden="true" />
            <span>{tShell('fileActions.duplicate')}</span>
          </MenuItem>
        )}
        {onStar && (
          <MenuItem onClick={() => onStar(doc.id)}>
            <Icon name="star" size={16} preferDuotone={doc.starred} aria-hidden="true" />
            <span>{doc.starred ? tShell('fileActions.unstar') : tShell('fileActions.star')}</span>
          </MenuItem>
        )}
        {onTrash && (
          <>
            <MenuSep />
            <MenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onTrash(doc.id)}
            >
              <Icon name="trash-2" size={16} aria-hidden="true" />
              <span>{tShell('fileActions.moveToTrash')}</span>
            </MenuItem>
          </>
        )}
      </>
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div
            className={cn(
              'group flex items-center gap-2 min-h-10 w-full px-2.5 py-1.5 rounded-xl text-left cursor-pointer transition-colors outline-none select-none relative',
              isActive
                ? 'bg-primary/15 text-primary'
                : 'text-foreground hover:bg-hover focus-visible:bg-hover',
            )}
            onClick={() => onSelect(doc.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(doc.id);
              }
            }}
          />
        }
      >
        <Icon name="file-text" className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1 mr-1">
          {isEditing ? (
            <input
              autoFocus
              aria-label={tShell('fileActions.rename')}
              className="w-full h-6 px-1.5 text-xs font-medium text-foreground bg-background border border-primary rounded outline-none"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleRenameKey}
              onBlur={commitRename}
              onClick={(event: MouseEvent) => event.stopPropagation()}
            />
          ) : (
            <>
              <strong className="block text-xs font-medium text-inherit truncate">
                {doc.title}
              </strong>
              <small className="block text-[11px] text-muted-foreground truncate mt-0.5">
                {formatDateTime(doc.updatedAt)}
              </small>
            </>
          )}
        </div>
        {doc.starred && (
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="inline-flex items-center text-amber-500 shrink-0 mr-0.5 cursor-default">
                  <Icon name="star" size={13} preferDuotone aria-hidden="true" />
                </span>
              }
            />
            <TooltipContent side="top">{tShell('fileActions.star')}</TooltipContent>
          </Tooltip>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="grid place-items-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100 shrink-0 ml-auto transition-opacity cursor-pointer"
                aria-label={tShell('fileActions.moreOptions')}
                onClick={(event: MouseEvent) => event.stopPropagation()}
              />
            }
          >
            <Icon name="more-vertical" size={15} aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            {renderMenuItems(false)}
          </DropdownMenuContent>
        </DropdownMenu>
      </ContextMenuTrigger>
      <ContextMenuContent>{renderMenuItems(true)}</ContextMenuContent>
    </ContextMenu>
  );
};
