import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import type { OutlineItem } from '@/lib/utils';
import type { DocRecord } from '@/types';

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
}: DocsSidebarProps) => {
  const { t, formatDateTime } = useTranslation('docs');
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? docs.filter((doc) => doc.title.toLowerCase().includes(normalized))
    : docs;

  return (
    <aside
      className={`docs-sidebar ${sidebarOpen ? 'is-open' : ''}`}
      aria-label={t('sidebar.title')}
    >
      <div className="docs-sidebar-inner">
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
              <button
                className={`doc-row ${doc.id === activeId ? 'active' : ''}`}
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                type="button"
              >
                <Icon name="file-text" size={16} className="doc-row-icon shrink-0" aria-hidden="true" />
                <span className="doc-row-content">
                  <strong className="truncate">{doc.title}</strong>
                  <small>{formatDateTime(doc.updatedAt)}</small>
                </span>
                <span className="doc-more shrink-0">
                  <Icon name="more-vertical" size={14} />
                </span>
              </button>
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
      </div>
    </aside>
  );
};