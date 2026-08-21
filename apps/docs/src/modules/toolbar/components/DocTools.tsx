import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import type { ViewMode } from '@/modules/editor/types/editor.types';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';
import { ZoomControl } from '@/modules/toolbar/components/ZoomControl';

interface DocToolsProps {
  viewMode: ViewMode;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onPageSetup: () => void;
  onPrint: () => void;
}

export const DocTools = ({
  viewMode,
  zoom,
  onZoomChange,
  onViewModeChange,
  onPageSetup,
  onPrint,
}: DocToolsProps) => {
  const { t } = useTranslation('docs');

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <ToolbarButton label={t('toolbar.print')} onClick={onPrint}>
        <Icon name="printer" />
      </ToolbarButton>
      <ToolbarButton label={t('toolbar.pageSetup')} onClick={onPageSetup}>
        <Icon name="sliders-horizontal" />
      </ToolbarButton>
      <ToolbarButton
        active={viewMode === 'paged'}
        label={t('toolbar.switchViewMode')}
        onClick={() => onViewModeChange(viewMode === 'paged' ? 'continuous' : 'paged')}
      >
        <Icon name="file-text" />
      </ToolbarButton>
      <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
    </div>
  );
};

