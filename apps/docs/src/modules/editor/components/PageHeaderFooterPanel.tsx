import { useEffect, useState } from 'react';
import { useTranslation } from '@office/i18n';
import { Button, Icon, Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
import type { PageSetup } from '@/types/docs.types';
import { DocumentSettingsTab } from './page-settings/DocumentSettingsTab';
import { HeaderFooterSettingsTab } from './page-settings/HeaderFooterSettingsTab';
import type { SettingsUnit } from './page-settings/PageSettingsControls';

export interface PageHeaderFooterPanelProps {
  open: boolean;
  setup: PageSetup;
  docTitle?: string;
  defaultTab?: 'document' | 'headerFooter';
  activeBand?: 'header' | 'footer';
  onActiveBandChange?: (band: 'header' | 'footer') => void;
  onPageSetupChange: (setup: PageSetup) => void;
  onClose: () => void;
}

export const PageHeaderFooterPanel = ({
  open,
  setup,
  defaultTab = 'headerFooter',
  activeBand: externalActiveBand,
  onActiveBandChange,
  onPageSetupChange,
  onClose,
}: PageHeaderFooterPanelProps) => {
  const { t } = useTranslation('docs');
  const [activeTab, setActiveTab] = useState<'document' | 'headerFooter'>(defaultTab);
  const [internalBand, setInternalBand] = useState<'header' | 'footer'>('header');
  const [unit, setUnit] = useState<SettingsUnit>('cm');
  const [marginsLinked, setMarginsLinked] = useState(false);

  const [shouldRender, setShouldRender] = useState(open);
  const [animState, setAnimState] = useState<'open' | 'closed'>(open ? 'open' : 'closed');

  const activeBand = externalActiveBand ?? internalBand;

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setAnimState('open');
    } else if (shouldRender) {
      setAnimState('closed');
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  const handleClose = () => {
    setAnimState('closed');
    setTimeout(() => {
      onClose();
    }, 240);
  };

  const handleBandChange = (band: 'header' | 'footer') => {
    setInternalBand(band);
    onActiveBandChange?.(band);
  };

  return (
    <aside
      data-state={animState}
      className={cn(
        'doc-settings-nav-panel fixed right-4 top-20 bottom-10 w-[324px] z-40 flex flex-col',
        'rounded-2xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl',
        'text-card-foreground select-none overflow-hidden font-sans',
      )}
      aria-label="Cài đặt tài liệu và đầu/chân trang"
    >
      {/* Top Header & Tab Navigation */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/40">
        <div className="inline-flex items-center rounded-xl bg-muted p-1 text-xs gap-1 border border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('document')}
            className={cn(
              'rounded-lg px-3 py-1.5 font-medium text-xs transition-colors',
              activeTab === 'document'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('headerFooter.tabs.document')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('headerFooter')}
            className={cn(
              'rounded-lg px-3 py-1.5 font-medium text-xs transition-colors',
              activeTab === 'headerFooter'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('headerFooter.tabs.headersFooters')}
          </Button>
        </div>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                aria-label="Đóng"
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="x" size={15} />
              </Button>
            }
          />
          <TooltipContent side="left">Đóng</TooltipContent>
        </Tooltip>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar text-foreground">
        {activeTab === 'document' ? (
          <DocumentSettingsTab
            setup={setup}
            unit={unit}
            setUnit={setUnit}
            marginsLinked={marginsLinked}
            setMarginsLinked={setMarginsLinked}
            onPageSetupChange={onPageSetupChange}
          />
        ) : (
          <HeaderFooterSettingsTab
            setup={setup}
            activeBand={activeBand}
            onPageSetupChange={onPageSetupChange}
          />
        )}
      </div>

      {/* Bottom Switcher: Header & Footer */}
      {activeTab === 'headerFooter' && (
        <div className="p-3 border-t border-border bg-muted/40">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl border border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleBandChange('header')}
              className={cn(
                'py-1.5 rounded-lg text-xs font-semibold text-center transition-colors',
                activeBand === 'header'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t('headerFooter.header')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleBandChange('footer')}
              className={cn(
                'py-1.5 rounded-lg text-xs font-semibold text-center transition-colors',
                activeBand === 'footer'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t('headerFooter.footer')}
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};
