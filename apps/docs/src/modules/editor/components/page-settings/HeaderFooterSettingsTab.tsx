import { useState } from 'react';
import { useTranslation } from '@office/i18n';
import { Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
import type { HeaderFooterSlot, HFAlign, PageNumberSetup, PageSetup } from '@/types/docs.types';
import { NumberInputWithUnit, SelectField } from './PageSettingsControls';

interface HeaderFooterSettingsTabProps {
  setup: PageSetup;
  activeBand: 'header' | 'footer';
  onPageSetupChange: (setup: PageSetup) => void;
}

export const HeaderFooterSettingsTab = ({
  setup,
  activeBand,
  onPageSetupChange,
}: HeaderFooterSettingsTabProps) => {
  const { t } = useTranslation('docs');
  const [activeSlot, setActiveSlot] = useState<keyof HeaderFooterSlot>('center');

  const header = setup.header ?? { left: '', center: '', right: '' };
  const footer = setup.footer ?? { left: '', center: '', right: '' };
  const pageNumber: PageNumberSetup = setup.pageNumber ?? {
    enabled: false,
    position: 'footer',
    align: 'center',
    format: '{page}',
    startAt: 1,
    skipFirstPage: false,
  };

  const headerMarginMm = setup.headerMargin ?? 12.5;
  const footerMarginMm = setup.footerMargin ?? 12.5;
  const headerDistanceCm = Number((headerMarginMm / 10).toFixed(2));
  const footerDistanceCm = Number((footerMarginMm / 10).toFixed(2));

  const updateHeaderSlot = (align: keyof HeaderFooterSlot, value: string) => {
    onPageSetupChange({ ...setup, header: { ...header, [align]: value } });
  };

  const updateFooterSlot = (align: keyof HeaderFooterSlot, value: string) => {
    onPageSetupChange({ ...setup, footer: { ...footer, [align]: value } });
  };

  const updatePageNumber = (updates: Partial<PageNumberSetup>) => {
    onPageSetupChange({ ...setup, pageNumber: { ...pageNumber, ...updates } });
  };

  const insertTokenToActiveBand = (token: string, targetSlot?: keyof HeaderFooterSlot) => {
    const slot = targetSlot ?? activeSlot;
    const current = (activeBand === 'header' ? header[slot] : footer[slot]) || '';
    const nextVal = current ? `${current} ${token}` : token;
    if (activeBand === 'header') {
      updateHeaderSlot(slot, nextVal);
    } else {
      updateFooterSlot(slot, nextVal);
    }
  };

  return (
    <>
      {/* Section: Layout */}
      <div className="space-y-2.5">
        <h3 className="font-semibold text-neutral-100 text-xs tracking-tight">
          {t('headerFooter.layout')}
        </h3>
        <div className="space-y-2 pl-0.5">
          <label className="flex items-center gap-2.5 text-neutral-200 cursor-pointer font-medium hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={pageNumber.skipFirstPage}
              onChange={(e) => updatePageNumber({ skipFirstPage: e.target.checked })}
              className="size-4 rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <span>{t('headerFooter.differentFirstPage')}</span>
          </label>
          <label className="flex items-center gap-2.5 text-neutral-500 cursor-not-allowed">
            <input
              type="checkbox"
              checked={false}
              disabled
              className="size-4 rounded border-neutral-800 bg-neutral-900 opacity-40"
            />
            <span>{t('headerFooter.differentOddEven')}</span>
          </label>
        </div>
      </div>

      {/* Section: Distance to page edge */}
      <div className="space-y-2.5 pt-3 border-t border-neutral-800/80">
        <h3 className="font-semibold text-neutral-100 text-xs tracking-tight">
          {t('headerFooter.distanceToEdge')}
        </h3>
        <div className="space-y-2">
          <NumberInputWithUnit
            label={t('headerFooter.headerDistanceFromTop')}
            value={headerDistanceCm}
            unit="cm"
            step={0.1}
            min={0}
            max={10}
            onChange={(val) => {
              const mm = Math.max(0, Math.min(100, Math.round(val * 100) / 10));
              onPageSetupChange({ ...setup, headerMargin: mm });
            }}
          />
          <NumberInputWithUnit
            label={t('headerFooter.footerDistanceFromBottom')}
            value={footerDistanceCm}
            unit="cm"
            step={0.1}
            min={0}
            max={10}
            onChange={(val) => {
              const mm = Math.max(0, Math.min(100, Math.round(val * 100) / 10));
              onPageSetupChange({ ...setup, footerMargin: mm });
            }}
          />
        </div>
      </div>

      {/* Section: Content Slots */}
      <div className="space-y-2.5 pt-3 border-t border-neutral-800/80">
        <h3 className="font-semibold text-neutral-100 text-xs tracking-tight">
          {t('headerFooter.content')} (
          {activeBand === 'header' ? t('headerFooter.header') : t('headerFooter.footer')})
        </h3>

        <div className="space-y-2">
          {(['left', 'center', 'right'] as const).map((slotKey) => {
            const val = activeBand === 'header' ? header[slotKey] : footer[slotKey];
            const label = t(
              `headerFooter.align${slotKey.charAt(0).toUpperCase() + slotKey.slice(1)}` as any,
            );
            const isSelected = activeSlot === slotKey;
            return (
              <div key={slotKey} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-[11px] transition-colors',
                      isSelected ? 'text-purple-400 font-medium' : 'text-neutral-400',
                    )}
                  >
                    {label}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] text-purple-400/80 font-mono">Đang chọn</span>
                  )}
                </div>
                <input
                  type="text"
                  value={val}
                  placeholder={label}
                  onFocus={() => setActiveSlot(slotKey)}
                  onChange={(e) =>
                    activeBand === 'header'
                      ? updateHeaderSlot(slotKey, e.target.value)
                      : updateFooterSlot(slotKey, e.target.value)
                  }
                  className={cn(
                    'w-full h-8.5 rounded-lg border bg-[#1c1c1f] px-3 text-xs font-medium text-neutral-100 transition-all',
                    isSelected
                      ? 'border-purple-500/80 ring-1 ring-purple-500/40'
                      : 'border-neutral-800 focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30',
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Dynamic Tokens */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: '{title}', token: '{title}', title: t('headerFooter.tokens.docTitle') },
            { label: '{date}', token: '{date}', title: t('headerFooter.tokens.date') },
          ].map((item) => (
            <Tooltip key={item.token}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertTokenToActiveBand(item.token)}
                    aria-label={item.title}
                    className="inline-flex items-center rounded-md border border-neutral-800 bg-[#1c1c1f] px-2 py-0.5 font-mono text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer active:scale-95"
                  >
                    + {item.label}
                  </button>
                }
              />
              <TooltipContent side="top">{item.title}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Section: Page numbers */}
      <div className="space-y-2.5 pt-3 border-t border-neutral-800/80">
        <h3 className="font-semibold text-neutral-100 text-xs tracking-tight">
          {t('headerFooter.pageNumber.title')}
        </h3>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              const targetSlot = pageNumber.align || activeSlot;
              updatePageNumber({ enabled: true, format: '{page}' });
              insertTokenToActiveBand('{page}', targetSlot);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-neutral-800 bg-[#1c1c1f] hover:bg-[#27272a] text-left font-medium text-neutral-200 transition-all duration-150 cursor-pointer hover:border-purple-500/40"
          >
            <span className="font-mono text-purple-400 font-bold">#</span>
            <span>{t('headerFooter.insertPageNumber')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const targetSlot = pageNumber.align || activeSlot;
              updatePageNumber({ enabled: true, format: '{page} / {pages}' });
              insertTokenToActiveBand('{page} / {pages}', targetSlot);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-neutral-800 bg-[#1c1c1f] hover:bg-[#27272a] text-left font-medium text-neutral-200 transition-all duration-150 cursor-pointer hover:border-purple-500/40"
          >
            <span className="font-mono text-purple-400 font-bold">##</span>
            <span>{t('headerFooter.insertTotalPages')}</span>
          </button>
        </div>

        {/* Number format & position options */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <span className="text-neutral-400 text-[11px]">
              {t('headerFooter.pageNumber.position')}
            </span>
            <SelectField
              value={pageNumber.position}
              onChange={(val) => updatePageNumber({ position: val as 'header' | 'footer' })}
              options={[
                { value: 'header', label: t('headerFooter.pageNumber.positionHeader') },
                { value: 'footer', label: t('headerFooter.pageNumber.positionFooter') },
              ]}
            />
          </div>

          <div className="space-y-1">
            <span className="text-neutral-400 text-[11px]">
              {t('headerFooter.pageNumber.align')}
            </span>
            <SelectField
              value={pageNumber.align}
              onChange={(val) => {
                const align = val as HFAlign;
                updatePageNumber({ align });
                setActiveSlot(align);
              }}
              options={[
                { value: 'left', label: t('headerFooter.alignLeft') },
                { value: 'center', label: t('headerFooter.alignCenter') },
                { value: 'right', label: t('headerFooter.alignRight') },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
};
