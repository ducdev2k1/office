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
            className={`c-side_row ${isActive ? 'is-active' : ''}`}
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
        <Icon name="file-text" className="c-side_icon" aria-hidden="true" />
        <div className="c-side_body">
          {isEditing ? (
            <input
              autoFocus
              aria-label={tShell('fileActions.rename')}
              className="c-side_input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleRenameKey}
              onBlur={commitRename}
              onClick={(event: MouseEvent) => event.stopPropagation()}
            />
          ) : (
            <>
              <strong title={doc.title}>{doc.title}</strong>
              <small>{formatDateTime(doc.updatedAt)}</small>
            </>
          )}
        </div>
        {doc.starred && (
          <span className="c-side_star" title={tShell('fileActions.star')}>
            <Icon name="star" size={13} preferDuotone aria-hidden="true" />
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="c-side_more"
                aria-label={tShell('fileActions.moreOptions')}
                title={tShell('fileActions.moreOptions')}
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
