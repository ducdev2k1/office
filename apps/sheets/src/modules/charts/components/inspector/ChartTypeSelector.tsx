import { useTranslation } from '@office/i18n';
import { Button, Icon, cn } from '@office/ui-kit';
import { CHART_TYPES_METADATA } from '../../constants/charts.constants';
import type { ChartType } from '../../types/charts.types';

export interface ChartTypeSelectorProps {
  selectedType: ChartType;
  onSelectType: (type: ChartType) => void;
}

export const ChartTypeSelector = ({
  selectedType,
  onSelectType,
}: ChartTypeSelectorProps) => {
  const { t } = useTranslation('sheets');

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-foreground">{t('chart.typeLabel')}</span>
      <div className="grid grid-cols-3 gap-1.5">
        {CHART_TYPES_METADATA.map((item) => {
          const isSelected = selectedType === item.type;
          return (
            <Button
              key={item.type}
              variant="outline"
              size="sm"
              aria-pressed={isSelected}
              title={t(item.descriptionKey)}
              onClick={() => onSelectType(item.type)}
              className={cn(
                'h-auto flex-col gap-1 rounded-md p-2 text-center',
                isSelected
                  ? 'border-primary bg-primary/10 font-semibold text-primary shadow-xs hover:bg-primary/15 hover:text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <Icon name={item.iconName} size={18} />
              <span className="truncate text-[11px] leading-tight">{t(item.labelKey)}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
