import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import type { FileRecord } from '../types';

interface StatsCardsProps {
  files: FileRecord[];
  storageMB?: number;
}

/** 4 the thong ke nho phia tren danh sach. */
export const StatsCards = ({ files, storageMB }: StatsCardsProps) => {
  const { t, formatRelativeTime } = useTranslation('appShell');
  const active = files.filter((file) => !file.deletedAt);
  const starredCount = active.filter((file) => file.starred).length;
  const lastOpened = active.reduce<string | null>(
    (max, file) => (max === null || file.lastOpenedAt > max ? file.lastOpenedAt : max),
    null,
  );

  const cards = [
    { label: t('home.statTotalFiles'), value: String(active.length), icon: 'file-text' },
    {
      label: t('home.statStorageUsed'),
      value: storageMB === undefined ? '—' : `~${storageMB.toFixed(1)} MB`,
      icon: 'hard-drive',
    },
    { label: t('home.statStarred'), value: String(starredCount), icon: 'star' },
    {
      label: t('home.statLastEdited'),
      value: lastOpened ? formatRelativeTime(lastOpened) : '—',
      icon: 'clock',
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 px-6 pt-4 sm:grid-cols-4" aria-label={t('home.statisticsLabel')}>
      {cards.map(({ label, value, icon }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
        >
          <Icon name={icon} size={20} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground" title={value}>
              {value}
            </div>
            <div className="truncate text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      ))}
    </section>
  );
};