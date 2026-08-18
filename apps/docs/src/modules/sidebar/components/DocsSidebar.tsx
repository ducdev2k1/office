import type { OutlineItem } from '@/types/common.types';
import type { DocRecord } from '@/types/docs.types';
import { DocRow } from '@/modules/sidebar/components/DocRow';
import { OutlineList } from '@/modules/sidebar/components/OutlineList';
import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';

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
  const { t } = useTranslation('docs');

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? docs.filter((doc) => doc.title.toLowerCase().includes(normalized))
    : docs;

  return (
    <aside
      className={`c-side ${sidebarOpen ? 'is-open' : ''}`}
      aria-label={t('sidebar.title')}
    >
      <div className="c-side_top">
        <button
          className="c-side_btn"
          type="button"
          title={t('sidebar.closeAria')}
          aria-label={t('sidebar.closeAria')}
          onClick={onClose}
        >
          <Icon name="chevron-left" size={18} />
        </button>
        <span className="c-side_title">{t('sidebar.title')}</span>
        <button
          className="c-side_btn"
          type="button"
          title={t('sidebar.addAria')}
          aria-label={t('sidebar.addAria')}
          onClick={onAdd}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
      <label className="c-side_search">
        <Icon name="search" size={15} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('sidebar.searchPlaceholder')}
        />
      </label>
      <div className="c-side_list">
        {filtered.length ? (
          filtered.map((doc) => (
            <DocRow
              key={doc.id}
              doc={doc}
              isActive={doc.id === activeId}
              onSelect={onSelect}
              onRename={onRename}
              onDuplicate={onDuplicate}
              onStar={onStar}
              onTrash={onTrash}
            />
          ))
        ) : (
          <p className="c-side_empty">{t('sidebar.emptyDocs')}</p>
        )}
      </div>
      <OutlineList outline={outline} />
    </aside>
  );
};
