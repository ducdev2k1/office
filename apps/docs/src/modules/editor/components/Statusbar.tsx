import { useTranslation } from '@office/i18n';
import { cn } from '@office/ui-kit';
import type { ViewMode } from '@/modules/editor/types/editor.types';

interface StatusbarProps {
  wordCount: number;
  charCount: number;
  /** null = đang chờ phân trang nền. */
  pageCount: number | null;
  viewMode: ViewMode;
  storageUsage: number;
  saveState?: 'loading' | 'saving' | 'saved';
  lastSavedAt: Date | null;
}

export const Statusbar = ({
  wordCount,
  charCount,
  pageCount,
  viewMode,
  storageUsage,
  saveState,
  lastSavedAt,
}: StatusbarProps) => {
  const { t, formatDateTime } = useTranslation('docs');
  const isNearQuota = storageUsage > 4 * 1024 * 1024;

  return (
    <footer
      className="statusbar flex items-center gap-3 md:gap-4.5 min-h-[30px] px-3 md:px-6.5 border-t border-border bg-background text-muted-foreground text-[11px] select-none z-10"
      aria-label={t('statusbar.ariaLabel')}
    >
      <span className="inline-flex items-center gap-1">
        {t('statusbar.words', { count: wordCount })}
      </span>
      <span className="inline-flex items-center gap-1 max-md:hidden">
        {t('statusbar.characters', { count: charCount })}
      </span>
      {viewMode === 'paged' && (
        <span className="inline-flex items-center gap-1">
          {pageCount == null ? '—' : t('statusbar.pages', { count: pageCount })}
        </span>
      )}
      <span
        className={cn(
          'inline-flex items-center gap-1 max-md:hidden',
          isNearQuota && 'text-destructive font-semibold',
        )}
      >
        {t('statusbar.storageUsage', { size: (storageUsage / (1024 * 1024)).toFixed(1) })}
      </span>
      {saveState === 'saving' && (
        <span className="inline-flex items-center gap-1">{t('statusbar.saving')}</span>
      )}
      {lastSavedAt && (
        <span className="inline-flex items-center gap-1 ml-auto opacity-75">
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
