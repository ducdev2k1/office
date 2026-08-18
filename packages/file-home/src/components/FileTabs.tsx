import { useTranslation } from '@office/i18n';
import type { FileRecord, FileTab } from '../types';

interface FileTabsProps {
  files: FileRecord[];
  active: FileTab;
  accentVar: string;
  onChange: (tab: FileTab) => void;
}

const TABS: FileTab[] = ['recent', 'starred', 'trash'];

export const FileTabs = ({ files, active, accentVar, onChange }: FileTabsProps) => {
  const { t } = useTranslation('appShell');
  const counts: Record<FileTab, number> = {
    recent: files.filter((f) => !f.deletedAt).length,
    starred: files.filter((f) => !f.deletedAt && f.starred).length,
    trash: files.filter((f) => f.deletedAt).length,
  };

  return (
    <div className="flex items-end gap-1" role="tablist" aria-label={t('fileList.filterLabel')}>
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`relative rounded-t-md px-4 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
            active === tab
              ? 'text-foreground'
              : 'text-muted-foreground hover:bg-hover hover:text-foreground'
          }`}
        >
          {t(`nav.${tab}`)}
          <span className="ml-1.5 text-xs text-muted-foreground">{counts[tab]}</span>
          {active === tab && (
            <span
              className="absolute inset-x-2 bottom-0 h-0.5 rounded-full"
              style={{ backgroundColor: accentVar }}
            />
          )}
        </button>
      ))}
    </div>
  );
};
