import { useTranslation } from '@office/i18n';
import type { SelectionAggregate } from '@/hooks/useSelectionAggregate';

interface SheetsStatusbarProps {
  aggregate: SelectionAggregate;
}

export const SheetsStatusbar = ({ aggregate }: SheetsStatusbarProps) => {
  const { t, locale, formatNumber } = useTranslation('sheets');
  const hasSelection = aggregate.totalCells > 0;

  return (
    <div className="flex h-7 shrink-0 items-center gap-4 border-t border-border bg-background px-3 text-xs text-muted-foreground">
      <span>{t('statusbar.selected', { count: formatNumber(aggregate.totalCells) })}</span>
      {hasSelection && (
        <>
          <span className="border-l border-border pl-4">
            {t('statusbar.count')}:{' '}
            <span className="text-foreground">{formatNumber(aggregate.numericCount)}</span>
          </span>
          <span className="border-l border-border pl-4">
            {t('statusbar.sum')}:{' '}
            <span className="text-foreground">{formatNumber(aggregate.sum)}</span>
          </span>
          {aggregate.avg !== null && (
            <span className="border-l border-border pl-4">
              {t('statusbar.avg')}:{' '}
              <span className="text-foreground">{formatNumber(aggregate.avg)}</span>
            </span>
          )}
        </>
      )}
    </div>
  );
};
