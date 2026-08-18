import { useTranslation } from '@office/i18n';
import type { ViewMode } from '@/modules/editor/types/editor.types';

interface StatusbarProps {
  wordCount: number;
  charCount: number;
  pageCount: number;
  viewMode: ViewMode;
  storageUsage: number;
  lastSavedAt: Date | null;
}

export const Statusbar = ({
  wordCount,
  charCount,
  pageCount,
  viewMode,
  storageUsage,
  lastSavedAt,
}: StatusbarProps) => {
  const { t, formatDateTime } = useTranslation('docs');
  const isNearQuota = storageUsage > 4 * 1024 * 1024;

  return (
    <footer className="c-status" aria-label={t('statusbar.ariaLabel')}>
      <span className="c-status_item">{t('statusbar.words', { count: wordCount })}</span>
      <span className="c-status_item">{t('statusbar.characters', { count: charCount })}</span>
      {viewMode === 'paged' && (
        <span className="c-status_item">{t('statusbar.pages', { count: pageCount })}</span>
      )}
      <span className={`c-status_item ${isNearQuota ? 'is-warn' : ''}`}>
        {t('statusbar.storageUsage', { size: (storageUsage / 1024).toFixed(1) })}
      </span>
      {lastSavedAt && (
        <span className="c-status_item ml-auto opacity-75">
          {t('statusbar.lastSaved', {
            time: formatDateTime(lastSavedAt, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          })}
        </span>
      )}
    </footer>
  );
};
