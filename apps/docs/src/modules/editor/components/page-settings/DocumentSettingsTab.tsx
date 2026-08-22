import { useTranslation } from '@office/i18n';
import { Button, Icon, Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
import { PAPER_SIZES, type Orientation, type PageSetup, type PaperSize } from '@/types/docs.types';
import { NumberInputWithUnit, SelectField, type SettingsUnit } from './PageSettingsControls';

interface DocumentSettingsTabProps {
  setup: PageSetup;
  unit: SettingsUnit;
  setUnit: (u: SettingsUnit) => void;
  marginsLinked: boolean;
  setMarginsLinked: (updater: (prev: boolean) => boolean) => void;
  onPageSetupChange: (setup: PageSetup) => void;
}

export const DocumentSettingsTab = ({
  setup,
  unit,
  setUnit,
  marginsLinked,
  setMarginsLinked,
  onPageSetupChange,
}: DocumentSettingsTabProps) => {
  const { t } = useTranslation('docs');

  const mmToUnit = (mm: number): number => {
    if (unit === 'cm') return Number((mm / 10).toFixed(2));
    if (unit === 'inch') return Number((mm / 25.4).toFixed(2));
    return mm;
  };

  const unitToMm = (val: number): number => {
    if (unit === 'cm') return val * 10;
    if (unit === 'inch') return val * 25.4;
    return val;
  };

  const setMargin = (side: keyof PageSetup['margins'], valueInUnit: number) => {
    const mm = Math.min(100, Math.max(0, Math.round(unitToMm(valueInUnit) * 10) / 10));
    if (marginsLinked) {
      onPageSetupChange({
        ...setup,
        margins: { top: mm, bottom: mm, left: mm, right: mm },
      });
    } else {
      onPageSetupChange({
        ...setup,
        margins: { ...setup.margins, [side]: mm },
      });
    }
  };

  const paper = PAPER_SIZES[setup.paperSize] ?? PAPER_SIZES.a4;
  const rawW = setup.orientation === 'landscape' ? paper.height : paper.width;
  const rawH = setup.orientation === 'landscape' ? paper.width : paper.height;

  const widthInUnit = mmToUnit(rawW);
  const heightInUnit = mmToUnit(rawH);

  return (
    <>
      {/* Section: Page format */}
      <div className="space-y-2.5">
        <h3 className="font-semibold text-foreground text-xs tracking-tight">
          {t('pageSetup.pageFormat')}
        </h3>

        {/* Row 1: Paper Size & Unit Selects */}
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            value={setup.paperSize}
            onChange={(val) => onPageSetupChange({ ...setup, paperSize: val as PaperSize })}
            options={[
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'a5', label: 'A5' },
            ]}
          />

          <SelectField
            value={unit}
            onChange={(val) => setUnit(val as SettingsUnit)}
            options={[
              { value: 'cm', label: 'cm' },
              { value: 'mm', label: 'mm' },
              { value: 'inch', label: 'inch' },
            ]}
          />
        </div>

        {/* Row 2: Width & Height inputs */}
        <div className="grid grid-cols-2 gap-2">
          <NumberInputWithUnit
            label={t('pageSetup.width')}
            value={widthInUnit}
            unit={unit}
            readOnly
          />
          <NumberInputWithUnit
            label={t('pageSetup.height')}
            value={heightInUnit}
            unit={unit}
            readOnly
          />
        </div>

        {/* Row 3: Orientation Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPageSetupChange({ ...setup, orientation: 'portrait' })}
            className={cn(
              'justify-start gap-2 px-3 py-2 text-xs font-medium transition-colors',
              setup.orientation === 'portrait'
                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs'
                : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <div
              className={cn(
                'w-3.5 h-5 rounded-xs border-2 transition-colors',
                setup.orientation === 'portrait'
                  ? 'border-primary bg-primary/20'
                  : 'border-muted-foreground',
              )}
            />
            <span>{t('pageSetup.portrait')}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onPageSetupChange({ ...setup, orientation: 'landscape' })}
            className={cn(
              'justify-start gap-2 px-3 py-2 text-xs font-medium transition-colors',
              setup.orientation === 'landscape'
                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs'
                : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <div
              className={cn(
                'w-5 h-3.5 rounded-xs border-2 transition-colors',
                setup.orientation === 'landscape'
                  ? 'border-primary bg-primary/20'
                  : 'border-muted-foreground',
              )}
            />
            <span>{t('pageSetup.landscape')}</span>
          </Button>
        </div>
      </div>

      {/* Section: Page margins */}
      <div className="space-y-2.5 pt-3 border-t border-border">
        <h3 className="font-semibold text-foreground text-xs tracking-tight">
          {t('pageSetup.margins')}
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <NumberInputWithUnit
            label={t('pageSetup.marginTop')}
            value={mmToUnit(setup.margins.top)}
            unit={unit}
            step={unit === 'mm' ? 1 : 0.1}
            min={0}
            max={unit === 'mm' ? 100 : 10}
            onChange={(v) => setMargin('top', v)}
          />
          <NumberInputWithUnit
            label={t('pageSetup.marginBottom')}
            value={mmToUnit(setup.margins.bottom)}
            unit={unit}
            step={unit === 'mm' ? 1 : 0.1}
            min={0}
            max={unit === 'mm' ? 100 : 10}
            onChange={(v) => setMargin('bottom', v)}
          />
          <NumberInputWithUnit
            label={t('pageSetup.marginLeft')}
            value={mmToUnit(setup.margins.left)}
            unit={unit}
            step={unit === 'mm' ? 1 : 0.1}
            min={0}
            max={unit === 'mm' ? 100 : 10}
            onChange={(v) => setMargin('left', v)}
          />
          <NumberInputWithUnit
            label={t('pageSetup.marginRight')}
            value={mmToUnit(setup.margins.right)}
            unit={unit}
            step={unit === 'mm' ? 1 : 0.1}
            min={0}
            max={unit === 'mm' ? 100 : 10}
            onChange={(v) => setMargin('right', v)}
          />
        </div>

        {/* Link all margins toggle button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setMarginsLinked((prev) => !prev)}
                aria-label={marginsLinked ? 'Hủy liên kết lề' : 'Đồng bộ 4 lề'}
                className={cn(
                  'transition-colors',
                  marginsLinked
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <Icon name="link" size={14} />
              </Button>
            }
          />
          <TooltipContent side="top">
            {marginsLinked ? 'Hủy liên kết lề' : 'Đồng bộ 4 lề'}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Section: Page styling */}
      <div className="space-y-2.5 pt-3 border-t border-border">
        <h3 className="font-semibold text-foreground text-xs tracking-tight">
          {t('pageSetup.pageStyling')}
        </h3>

        <div className="space-y-2">
          <NumberInputWithUnit label={t('pageSetup.pageGap')} value={16} unit="px" readOnly />

          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground font-normal">
              {t('pageSetup.backgroundColor')}
            </span>
            <SelectField
              value="default"
              onChange={() => {}}
              options={[
                { value: 'default', label: t('pageSetup.backgrounds.default') },
                { value: 'white', label: t('pageSetup.backgrounds.white') },
                { value: 'gray', label: t('pageSetup.backgrounds.gray') },
                { value: 'cream', label: t('pageSetup.backgrounds.cream') },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
};
