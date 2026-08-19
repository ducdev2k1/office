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
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-foreground">Loại biểu đồ</label>
      <div className="grid grid-cols-3 gap-1.5">
        {CHART_TYPES_METADATA.map((item) => {
          const isSelected = selectedType === item.type;
          return (
            <Button
              key={item.type}
              variant="outline"
              size="sm"
              aria-pressed={isSelected}
              onClick={() => onSelectType(item.type)}
              className={cn(
                'h-auto flex-col gap-1 rounded-md p-2 text-center',
                isSelected
                  ? 'border-primary bg-primary/10 font-semibold text-primary shadow-xs hover:bg-primary/15 hover:text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <Icon name={item.iconName} size={18} />
              <span className="truncate text-[11px] leading-tight">
                {item.label.split(' ')[2] || item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
