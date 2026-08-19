import { useTranslation } from '@office/i18n';
import { Icon, Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
import {
  PAPER_SIZES,
  type Orientation,
  type PageSetup,
  type PaperSize,
} from '@/types/docs.types';
import {
  NumberInputWithUnit,
  SelectField,
  type SettingsUnit,
} from './PageSettingsControls';

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
        <h3 className="font-semibold text-neutral-100 text-xs tracking-tight">
          {t('pageSetup.pageFormat')}
        </h3>

        {/* Row 1: Paper Size & Unit Selects */}
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            value={setup.paperSize}
            onChange={(val) =>
              onPageSetupChange({ ...setup, paperSize: val as PaperSize })
            }
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
          <button
            type="button"
            onClick={() => onPageSetupChange({ ...setup, orientation: 'portrait' })}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer',
              setup.orientation === 'portrait'
                ? 'border-purple-500 bg-purple-950/30 text-purple-200 ring-1 ring-purple-500/40 shadow-xs'
                : 'border-neutral-800 bg-[#1c1c1f] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700',
            )}
          >
            <div className={cn(
              'w-3.5 h-5 rounded-xs border-2 transition-colors',
              setup.orientation === 'portrait' ? 'border-purple-400 bg-purple-500/20' : 'border-neutral-500',
            )} />
            <span>{t('pageSetup.portrait')}</span>
          </button>

          <button
            type="button"
            onClick={() => onPageSetupChange({ ...setup, orientation: 'landscape' })}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer',
              setup.orientation === 'landscape'
                ? 'border-purple-500 bg-purple-950/30 text-purple-200 ring-1 ring-purple-500/40 shadow-xs'
                : 'border-neutral-800 bg-[#1c1c1f] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700',
            )}
          >
            <div className={cn(
              'w-5 h-3.5 rounded-xs border-2 transition-colors',
              setup.orientation === 'landscape' ? 'border-purple-400 bg-purple-500/20' : 'border-neutral-500',
            )} />
            <span>{t('pageSetup.landscape')}</span>
          </button>
        </div>
      </div>

      {/* Section: Page margins */}
      <div className="space-y-2.5 pt-3 border-t border-neutral-800/80">
        <h3 className="font-semibold text-neutral-100 text-xs tracking-tight">
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
              <button
                type="button"
                onClick={() => setMarginsLinked((prev) => !prev)}
                aria-label={marginsLinked ? 'Hủy liên kết lề' : 'Đồng bộ 4 lề'}
                className={cn(
                  'size-8 rounded-lg border grid place-items-center transition-all cursor-pointer',
                  marginsLinked
                    ? 'border-purple-500 bg-purple-950/40 text-purple-400 ring-1 ring-purple-500/30'
                    : 'border-neutral-800 bg-[#1c1c1f] text-neutral-400 hover:text-neutral-200',
                )}
              >
                <Icon name="link" size={14} />
              </button>
            }
          />
          <TooltipContent side="top">
            {marginsLinked ? 'Hủy liên kết lề' : 'Đồng bộ 4 lề'}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Section: Page styling */}
      <div className="space-y-2.5 pt-3 border-t border-neutral-800/80">
        <h3 className="font-semibold text-neutral-100 text-xs tracking-tight">
          {t('pageSetup.pageStyling')}
        </h3>

        <div className="space-y-2">
          <NumberInputWithUnit
            label={t('pageSetup.pageGap')}
            value={16}
            unit="px"
            readOnly
          />

          <div className="space-y-1">
            <span className="text-[11px] text-neutral-400 font-normal">{t('pageSetup.backgroundColor')}</span>
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
