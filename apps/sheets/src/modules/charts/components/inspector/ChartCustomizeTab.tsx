import { useTranslation } from '@office/i18n';
import { Button, Input, Switch, cn } from '@office/ui-kit';
import { DEFAULT_PALETTES } from '../../constants/charts.constants';
import type { ChartSpec, LegendPosition } from '../../types/charts.types';

export interface ChartCustomizeTabProps {
  spec: ChartSpec;
  onUpdateSpec: (partial: Partial<ChartSpec>) => void;
}

const LEGEND_POSITIONS: Array<LegendPosition | 'none'> = [
  'top',
  'bottom',
  'left',
  'right',
  'none',
];

const PALETTES = [
  { key: 'inet', colors: DEFAULT_PALETTES.inet },
  { key: 'warm', colors: DEFAULT_PALETTES.warm },
  { key: 'cool', colors: DEFAULT_PALETTES.cool },
  { key: 'pastel', colors: DEFAULT_PALETTES.pastel },
];

export const ChartCustomizeTab = ({ spec, onUpdateSpec }: ChartCustomizeTabProps) => {
  const { t } = useTranslation('sheets');

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Tiêu đề biểu đồ */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="chart-title-input" className="text-xs font-semibold text-foreground">
          {t('chart.customize.titleLabel')}
        </label>
        <Input
          id="chart-title-input"
          value={spec.title}
          onChange={(e) => onUpdateSpec({ title: e.target.value })}
          placeholder={t('chart.customize.titlePlaceholder')}
          className="h-8 text-xs"
        />
      </div>

      {/* 2. Tiêu đề phụ */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="chart-sub-input" className="text-xs font-semibold text-foreground">
          {t('chart.customize.subtitleLabel')}
        </label>
        <Input
          id="chart-sub-input"
          value={spec.subtitle || ''}
          onChange={(e) => onUpdateSpec({ subtitle: e.target.value })}
          placeholder={t('chart.customize.subtitlePlaceholder')}
          className="h-8 text-xs"
        />
      </div>

      {/* 3. Chú giải (Legend) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-foreground">{t('chart.customize.legendLabel')}</span>
        <div className="grid grid-cols-2 gap-1.5">
          {LEGEND_POSITIONS.map((pos) => {
            const isSelected =
              pos === 'none' ? !spec.legend.show : spec.legend.show && spec.legend.position === pos;
            return (
              <Button
                key={pos}
                variant="outline"
                size="sm"
                aria-pressed={isSelected}
                onClick={() =>
                  onUpdateSpec({
                    legend: {
                      show: pos !== 'none',
                      position: pos === 'none' ? 'top' : pos,
                    },
                  })
                }
                className={cn(
                  'h-auto rounded-md px-1.5 py-1.5',
                  isSelected
                    ? 'border-primary bg-primary/10 font-semibold text-primary hover:bg-primary/15 hover:text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {t(`chart.customize.legend.${pos}`)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 4. Bộ màu sắc (Palette) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-foreground">{t('chart.customize.paletteLabel')}</span>
        <div className="flex flex-col gap-1.5">
          {PALETTES.map((p) => {
            const isSelected =
              JSON.stringify(spec.palette) === JSON.stringify(p.colors) ||
              (!spec.palette && p.key === 'inet');
            return (
              <Button
                key={p.key}
                variant="outline"
                size="sm"
                aria-pressed={isSelected}
                onClick={() => onUpdateSpec({ palette: p.colors })}
                className={cn(
                  'h-auto w-full justify-between rounded-md p-2',
                  isSelected && 'border-primary bg-primary/5 ring-1 ring-primary',
                )}
              >
                <span className="font-medium text-foreground">{t(`chart.customize.palettes.${p.key}`)}</span>
                <div className="flex items-center gap-1">
                  {p.colors.slice(0, 5).map((color, i) => (
                    <span
                      key={i}
                      style={{ backgroundColor: color }}
                      className="h-3.5 w-3.5 rounded-full shadow-xs"
                    />
                  ))}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 5. Tùy chọn bánh Donut (với Pie chart) */}
      {spec.type === 'pie' && (
        <div className="flex items-center justify-between rounded-md border border-border p-2.5">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">{t('chart.customize.donut')}</span>
            <span className="text-[11px] text-muted-foreground">{t('chart.customize.donutHint')}</span>
          </div>
          <Switch
            checked={Boolean(spec.isDonut)}
            onCheckedChange={(checked) => onUpdateSpec({ isDonut: Boolean(checked) })}
          />
        </div>
      )}
    </div>
  );
};
