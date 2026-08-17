import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import type { ViewMode } from '@/editor/use-pagination';
import { ToolbarButton } from '@/components/ToolbarButton';

interface DocToolsProps {
  findOpen: boolean;
  viewMode: ViewMode;
  canDelete: boolean;
  onToggleFind: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onPageSetup: () => void;
  onPrint: () => void;
  onExportHtml: () => void;
  onExportText: () => void;
  onDelete: () => void;
}

export const DocTools = ({
  findOpen,
  viewMode,
  canDelete,
  onToggleFind,
  onViewModeChange,
  onPageSetup,
  onPrint,
  onExportHtml,
  onExportText,
  onDelete,
}: DocToolsProps) => {
  const { t } = useTranslation('docs');

  return (
    <>
      <ToolbarButton active={findOpen} label={t('toolbar.findAndReplace')} onClick={onToggleFind}>
        <Icon name="search" />
      </ToolbarButton>
      <ToolbarButton
        active={viewMode === 'paged'}
        label={t('toolbar.switchViewMode')}
        onClick={() => onViewModeChange(viewMode === 'paged' ? 'continuous' : 'paged')}
      >
        <Icon name="file-text" />
        <span>{viewMode === 'paged' ? t('toolbar.viewModePaged') : t('toolbar.viewModeContinuous')}</span>
      </ToolbarButton>
      <ToolbarButton label={t('toolbar.pageSetup')} onClick={onPageSetup}>
        <Icon name="sliders-horizontal" />
      </ToolbarButton>
      <ToolbarButton label={t('toolbar.print')} onClick={onPrint}>
        <Icon name="printer" />
      </ToolbarButton>
      <span className="toolbar-spacer" />
      <ToolbarButton label={t('toolbar.exportHtml')} onClick={onExportHtml}>
        <Icon name="download" />
        <span>HTML</span>
      </ToolbarButton>
      <ToolbarButton label={t('toolbar.exportTxt')} onClick={onExportText}>
        <Icon name="download" />
        <span>TXT</span>
      </ToolbarButton>
      <ToolbarButton disabled={!canDelete} label={t('toolbar.deleteDocument')} tone="danger" onClick={onDelete}>
        <Icon name="trash-2" />
      </ToolbarButton>
    </>
  );
};