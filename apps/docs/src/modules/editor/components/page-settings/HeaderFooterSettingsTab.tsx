import { useState } from 'react';
import { useTranslation } from '@office/i18n';
import { Button, Checkbox, Input, Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
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
        <h3 className="font-semibold text-foreground text-xs tracking-tight">
          {t('headerFooter.layout')}
        </h3>
        <div className="space-y-2 pl-0.5">
          <label className="flex items-center gap-2.5 text-foreground cursor-pointer font-medium hover:text-primary transition-colors">
            <Checkbox
              checked={pageNumber.skipFirstPage}
              onCheckedChange={(checked) => updatePageNumber({ skipFirstPage: Boolean(checked) })}
            />
            <span>{t('headerFooter.differentFirstPage')}</span>
          </label>
          <label className="flex items-center gap-2.5 text-muted-foreground cursor-not-allowed">
            <Checkbox checked={false} disabled />
            <span>{t('headerFooter.differentOddEven')}</span>
          </label>
        </div>
      </div>

      {/* Section: Distance to page edge */}
      <div className="space-y-2.5 pt-3 border-t border-border">
        <h3 className="font-semibold text-foreground text-xs tracking-tight">
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
      <div className="space-y-2.5 pt-3 border-t border-border">
        <h3 className="font-semibold text-foreground text-xs tracking-tight">
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
                      isSelected ? 'text-primary font-medium' : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] text-primary font-mono font-medium">Đang chọn</span>
                  )}
                </div>
                <Input
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
                    'w-full h-8.5 rounded-lg border bg-background px-3 text-xs font-medium text-foreground transition-all',
                    isSelected
                      ? 'border-primary ring-1 ring-primary/40'
                      : 'border-input focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/30',
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertTokenToActiveBand(item.token)}
                    aria-label={item.title}
                    className="font-mono text-[11px] text-muted-foreground hover:text-foreground border-border bg-background hover:bg-muted"
                  >
                    + {item.label}
                  </Button>
                }
              />
              <TooltipContent side="top">{item.title}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Section: Page numbers */}
      <div className="space-y-2.5 pt-3 border-t border-border">
        <h3 className="font-semibold text-foreground text-xs tracking-tight">
          {t('headerFooter.pageNumber.title')}
        </h3>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const targetSlot = pageNumber.align || activeSlot;
              updatePageNumber({ enabled: true, format: '{page}' });
              insertTokenToActiveBand('{page}', targetSlot);
            }}
            className="w-full justify-start gap-2.5 px-3 py-2 border-border bg-background hover:bg-muted text-left font-medium text-foreground hover:border-primary/40"
          >
            <span className="font-mono text-primary font-bold">#</span>
            <span>{t('headerFooter.insertPageNumber')}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const targetSlot = pageNumber.align || activeSlot;
              updatePageNumber({ enabled: true, format: '{page} / {pages}' });
              insertTokenToActiveBand('{page} / {pages}', targetSlot);
            }}
            className="w-full justify-start gap-2.5 px-3 py-2 border-border bg-background hover:bg-muted text-left font-medium text-foreground hover:border-primary/40"
          >
            <span className="font-mono text-primary font-bold">##</span>
            <span>{t('headerFooter.insertTotalPages')}</span>
          </Button>
        </div>

        {/* Number format & position options */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <span className="text-muted-foreground text-[11px]">
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
            <span className="text-muted-foreground text-[11px]">
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
