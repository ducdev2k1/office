import { useTranslation } from '@office/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@office/ui-kit';
import type { FileSort, FileView } from './../types';

interface FileToolbarProps {
  sort: FileSort;
  view: FileView;
  onSortChange: (sort: FileSort) => void;
  onViewChange: (view: FileView) => void;
}

const SORT_OPTIONS: { value: FileSort; labelKey: string }[] = [
  { value: 'lastOpened', labelKey: 'home.sortLastOpened' },
  { value: 'updated', labelKey: 'home.sortLastModified' },
  { value: 'name', labelKey: 'home.sortTitle' },
];

export const FileToolbar = ({ sort, view, onSortChange, onViewChange }: FileToolbarProps) => {
  const { t } = useTranslation('appShell');

  return (
    <div className="flex items-center justify-end gap-1 border-b border-border px-6 pb-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          }
        >
          <Icon name="arrow-up-down" size={16} aria-hidden="true" />
          {t('home.sortBy')}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onSortChange(option.value)}
            >
              {t(option.labelKey)}
              {sort === option.value && <Icon name="check" size={16} className="ml-auto" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="ml-1 flex items-center rounded-md border border-border p-0.5">
        <button
          type="button"
          aria-label={t('home.viewList')}
          aria-pressed={view === 'list'}
          onClick={() => onViewChange('list')}
          className={`flex size-7 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
            view === 'list' ? 'bg-active text-active-foreground' : 'text-muted-foreground hover:bg-hover'
          }`}
        >
          <Icon name="list" size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={t('home.viewGrid')}
          aria-pressed={view === 'grid'}
          onClick={() => onViewChange('grid')}
          className={`flex size-7 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
            view === 'grid' ? 'bg-active text-active-foreground' : 'text-muted-foreground hover:bg-hover'
          }`}
        >
          <Icon name="grid-2x2" size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};