import { useTranslation } from '@office/i18n';
import { InetIcon } from '@office/ui-kit';
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
      <div className="sidebar-topline">
        <button
          className="back-button"
          type="button"
          aria-label={t('sidebar.closeAria')}
          onClick={onClose}
        >
          ‹
        </button>
        <span>{t('sidebar.title')}</span>
        <button
          className="add-tab-button"
          type="button"
          aria-label={t('sidebar.addAria')}
          onClick={onAdd}
        >
          +
        </button>
      </div>
      <label className="search-box">
        <InetIcon name="search" aria-hidden="true" />
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
              <InetIcon name="file-text" aria-hidden="true" />
              <span>
                <strong>{doc.title}</strong>
                <small>{formatDateTime(doc.updatedAt)}</small>
              </span>
              <span className="doc-more">⋮</span>
            </button>
          ))
        ) : (
          <p className="empty-docs">{t('sidebar.emptyDocs')}</p>
        )}
      </div>
      <div className="outline-section">
        <div className="outline-label">{t('sidebar.outlineTitle')}</div>
        {outline.length ? (
          outline.map((item) => (
            <button className={`outline-row level-${item.level}`} key={item.id} type="button">
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