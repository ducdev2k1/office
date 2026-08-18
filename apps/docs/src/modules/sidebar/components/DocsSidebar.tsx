import type { OutlineItem } from '@/types/common.types';
import type { DocRecord } from '@/types/docs.types';
import { DocRow } from '@/modules/sidebar/components/DocRow';
import { OutlineList } from '@/modules/sidebar/components/OutlineList';
import { useTranslation } from '@office/i18n';
import { Icon, cn } from '@office/ui-kit';

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
      className={cn(
        'absolute left-0 top-0 bottom-0 z-40 w-[290px] p-4 bg-card/95 backdrop-blur-md border-r border-border shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden scrollbar-thin',
        sidebarOpen
          ? 'translate-x-0 opacity-100 visible pointer-events-auto'
          : '-translate-x-full opacity-0 invisible pointer-events-none',
      )}
      aria-label={t('sidebar.title')}
    >
      <div className="w-[247px] min-w-[247px]">
        <div className="flex items-center gap-2 mb-3.5 text-foreground font-medium font-['Google_Sans',Roboto,sans-serif] text-sm">
          <button
            className="grid place-items-center size-7 rounded text-muted-foreground hover:text-foreground hover:bg-hover transition-colors"
            type="button"
            title={t('sidebar.closeAria')}
            aria-label={t('sidebar.closeAria')}
            onClick={onClose}
          >
            <Icon name="chevron-left" size={18} />
          </button>
          <span className="flex-1 font-medium text-sm text-foreground">{t('sidebar.title')}</span>
          <button
            className="grid place-items-center size-7 rounded text-muted-foreground hover:text-foreground hover:bg-hover transition-colors"
            type="button"
            title={t('sidebar.addAria')}
            aria-label={t('sidebar.addAria')}
            onClick={onAdd}
          >
            <Icon name="plus" size={18} />
          </button>
        </div>
        <label className="flex items-center gap-2 h-8.5 px-2.5 mb-3 border border-border focus-within:border-primary rounded-md bg-background text-muted-foreground transition-colors">
          <Icon name="search" size={15} aria-hidden="true" className="shrink-0" />
          <input
            className="w-full min-w-0 border-0 outline-none bg-transparent text-foreground text-xs placeholder:text-muted-foreground/75"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('sidebar.searchPlaceholder')}
          />
        </label>
        <div className="flex flex-col gap-0.5">
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
            <p className="my-3.5 mx-2 text-muted-foreground text-xs leading-relaxed">
              {t('sidebar.emptyDocs')}
            </p>
          )}
        </div>
        <OutlineList outline={outline} />
      </div>
    </aside>
  );
};
