import { Download, FileText, Printer, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import type { ViewMode } from '../../editor/use-pagination';
import { ToolbarButton } from '../ToolbarButton';

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
}: DocToolsProps) => (
  <>
    <ToolbarButton active={findOpen} label="Tim kiem va thay the (Ctrl+H)" onClick={onToggleFind}>
      <Search aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={viewMode === 'paged'}
      label="Chuyen che do xem trang"
      onClick={() => onViewModeChange(viewMode === 'paged' ? 'continuous' : 'paged')}
    >
      <FileText aria-hidden="true" />
      <span>{viewMode === 'paged' ? 'Trang' : 'Lien tuc'}</span>
    </ToolbarButton>
    <ToolbarButton label="Cau hinh trang" onClick={onPageSetup}>
      <SlidersHorizontal aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton label="In tai lieu" onClick={onPrint}>
      <Printer aria-hidden="true" />
    </ToolbarButton>
    <span className="toolbar-spacer" />
    <ToolbarButton label="Export HTML" onClick={onExportHtml}>
      <Download aria-hidden="true" />
      <span>HTML</span>
    </ToolbarButton>
    <ToolbarButton label="Export TXT" onClick={onExportText}>
      <Download aria-hidden="true" />
      <span>TXT</span>
    </ToolbarButton>
    <ToolbarButton disabled={!canDelete} label="Delete document" tone="danger" onClick={onDelete}>
      <Trash2 aria-hidden="true" />
    </ToolbarButton>
  </>
);
