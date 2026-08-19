import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  ToolbarButton,
} from '@office/ui-kit';

export interface QuickActionsProps {
  onUndo: () => void;
  onRedo: () => void;
  onPrint?: () => void;
  isPaintingFormat: boolean;
  onTogglePaintFormat: () => void;
  zoom: number;
  onSetZoom: (zoom: number) => void;
}

const ZOOM_PRESETS = [50, 75, 90, 100, 125, 150, 200];

export const QuickActions = ({
  onUndo,
  onRedo,
  onPrint,
  isPaintingFormat,
  onTogglePaintFormat,
  zoom,
  onSetZoom,
}: QuickActionsProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {/* Undo */}
      <ToolbarButton label="Hoàn tác (Ctrl+Z)" onClick={onUndo}>
        <Icon name="undo" size={16} />
      </ToolbarButton>

      {/* Redo */}
      <ToolbarButton label="Làm lại (Ctrl+Y)" onClick={onRedo}>
        <Icon name="redo" size={16} />
      </ToolbarButton>

      {/* Print */}
      {onPrint && (
        <ToolbarButton label="In (Ctrl+P)" onClick={onPrint}>
          <Icon name="printer" size={16} />
        </ToolbarButton>
      )}

      {/* Format Painter */}
      <ToolbarButton
        label="Sao chép định dạng"
        active={isPaintingFormat}
        onClick={onTogglePaintFormat}
      >
        <Icon name="brush" size={16} />
      </ToolbarButton>

      {/* Zoom Level Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label="Thu phóng"
              className="flex h-7 items-center gap-1 rounded px-1.5 text-xs text-foreground hover:bg-accent/70"
            />
          }
        >
          <span className="min-w-[32px] text-left">{zoom}%</span>
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[100px] text-xs">
          {ZOOM_PRESETS.map((z) => (
            <DropdownMenuItem
              key={z}
              onClick={() => onSetZoom(z)}
              className="flex items-center justify-between py-1 text-xs"
            >
              <span>{z}%</span>
              {zoom === z && <Icon name="check" size={14} className="text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
