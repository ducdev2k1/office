import { useEffect, useState } from 'react';
import { useTranslation } from '@office/i18n';
import { Icon, Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
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
        'rounded-2xl border border-neutral-800/80 bg-[#121214]/95 backdrop-blur-2xl shadow-2xl',
        'text-neutral-100 select-none overflow-hidden font-sans',
      )}
      aria-label="Cài đặt tài liệu và đầu/chân trang"
    >
      {/* Top Header & Tab Navigation */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-800/80 bg-neutral-900/30">
        <div className="inline-flex items-center rounded-xl bg-[#1c1c1f] p-1 text-xs gap-1 border border-neutral-800/50">
          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={cn(
              'rounded-lg px-3 py-1.5 font-medium transition-all duration-150 cursor-pointer text-xs',
              activeTab === 'document'
                ? 'bg-[#2b2b30] text-white shadow-xs font-semibold'
                : 'text-neutral-400 hover:text-neutral-200',
            )}
          >
            {t('headerFooter.tabs.document')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('headerFooter')}
            className={cn(
              'rounded-lg px-3 py-1.5 font-medium transition-all duration-150 cursor-pointer text-xs',
              activeTab === 'headerFooter'
                ? 'bg-[#2b2b30] text-white shadow-xs font-semibold'
                : 'text-neutral-400 hover:text-neutral-200',
            )}
          >
            {t('headerFooter.tabs.headersFooters')}
          </button>
        </div>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={handleClose}
                className="size-7 rounded-lg grid place-items-center text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <Icon name="x" size={15} />
              </button>
            }
          />
          <TooltipContent side="left">Đóng</TooltipContent>
        </Tooltip>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar text-neutral-200">
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
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/40">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#1c1c1f] rounded-xl border border-neutral-800/50">
            <button
              type="button"
              onClick={() => handleBandChange('header')}
              className={cn(
                'py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer text-center',
                activeBand === 'header'
                  ? 'bg-[#2b2b30] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200',
              )}
            >
              {t('headerFooter.header')}
            </button>
            <button
              type="button"
              onClick={() => handleBandChange('footer')}
              className={cn(
                'py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer text-center',
                activeBand === 'footer'
                  ? 'bg-[#2b2b30] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200',
              )}
            >
              {t('headerFooter.footer')}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
