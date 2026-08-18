import type { OutlineItem } from '@/lib/utils';
import type { DocRecord } from '@/types';
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
import { useState, type KeyboardEvent, type MouseEvent } from 'react';

interface DocsSidebarProps {
  docs: DocRecord[];
  activeId: string;
  query: string;
  outline: OutlineItem[];
  sidebarOpen: boolean;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
  onRename?: (id: string, title: string) => void;
  onDuplicate?: (id: string) => void;
  onStar?: (id: string) => void;
  onTrash?: (id: string) => void;
}

export const DocsSidebar = ({
  docs,
  activeId,
  query,
  outline,
  sidebarOpen,
  onQueryChange,
  onSelect,
  onAdd,
  onClose,
  onRename,
  onDuplicate,
  onStar,
  onTrash,
}: DocsSidebarProps) => {
  const { t, formatDateTime } = useTranslation('docs');
  const { t: tShell } = useTranslation('appShell');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? docs.filter((doc) => doc.title.toLowerCase().includes(normalized))
    : docs;

  const startRename = (doc: DocRecord) => {
    setEditingId(doc.id);
    setDraft(doc.title);
  };

  const commitRename = () => {
    if (editingId && onRename) {
      onRename(editingId, draft.trim() || t('header.titlePlaceholder'));
    }
    setEditingId(null);
  };

  const handleRenameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitRename();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditingId(null);
    }
  };

  const handleOpenInNewTab = (docId: string) => {
    window.open(`/edit/${docId}`, '_blank');
  };

  const renderDocMenuItems = (doc: DocRecord, isContext: boolean) => {
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
          <MenuItem onClick={() => startRename(doc)}>
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
    <aside
      className={`docs-sidebar ${sidebarOpen ? 'is-open' : ''}`}
      aria-label={t('sidebar.title')}
    >
      <div className="sidebar-topline">
        <button
          className="back-button"
          type="button"
          title={t('sidebar.closeAria')}
          aria-label={t('sidebar.closeAria')}
          onClick={onClose}
        >
          <Icon name="chevron-left" size={18} />
        </button>
        <span className="sidebar-title">{t('sidebar.title')}</span>
        <button
          className="add-tab-button"
          type="button"
          title={t('sidebar.addAria')}
          aria-label={t('sidebar.addAria')}
          onClick={onAdd}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
      <label className="search-box">
        <Icon name="search" size={15} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('sidebar.searchPlaceholder')}
        />
      </label>
      <div className="doc-list">
        {filtered.length ? (
          filtered.map((doc) => (
            <ContextMenu key={doc.id}>
              <ContextMenuTrigger
                render={
                  <div
                    className={`doc-row ${doc.id === activeId ? 'active' : ''}`}
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
                <Icon name="file-text" className="doc-row-icon" aria-hidden="true" />
                <div className="doc-row-content">
                  {editingId === doc.id ? (
                    <input
                      autoFocus
                      aria-label={tShell('fileActions.rename')}
                      className="doc-rename-input"
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
                  <span className="doc-star-indicator" title={tShell('fileActions.star')}>
                    <Icon name="star" size={13} preferDuotone aria-hidden="true" />
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="doc-more-btn"
                        aria-label={tShell('fileActions.moreOptions')}
                        title={tShell('fileActions.moreOptions')}
                        onClick={(event: MouseEvent) => event.stopPropagation()}
                      />
                    }
                  >
                    <Icon name="more-vertical" size={15} aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={4}>
                    {renderDocMenuItems(doc, false)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </ContextMenuTrigger>
              <ContextMenuContent>{renderDocMenuItems(doc, true)}</ContextMenuContent>
            </ContextMenu>
          ))
        ) : (
          <p className="empty-docs">{t('sidebar.emptyDocs')}</p>
        )}
      </div>
      <div className="outline-section">
        <div className="outline-label">{t('sidebar.outlineTitle')}</div>
        {outline.length ? (
          outline.map((item, index) => (
            <button
              className={`outline-row level-${item.level}`}
              key={item.id}
              type="button"
              onClick={() => {
                const headings = document.querySelectorAll('.tiptap h1, .tiptap h2, .tiptap h3');
                if (headings[index]) {
                  headings[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              {item.text}
            </button>
          ))
        ) : (
          <p className="outline-empty">{t('sidebar.emptyOutline')}</p>
        )}
      </div>
    </aside>
  );
};
