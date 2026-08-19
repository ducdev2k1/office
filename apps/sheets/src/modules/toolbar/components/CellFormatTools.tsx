import {
  Button,
  ColorPalettePopover,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  ToolbarButton,
} from '@office/ui-kit';
import { BorderStyleTypes, BorderType } from '@univerjs/presets';
import { useState } from 'react';

export interface CellFormatToolsProps {
  isMerged: boolean;
  onToggleMerge: () => void;
  onMergeAll: () => void;
  onMergeHorizontal: () => void;
  onMergeVertical: () => void;
  onUnmerge: () => void;
  onApplyBorder: (type: BorderType, style?: BorderStyleTypes, color?: string) => void;
}

const BORDER_TYPES: Array<{
  type: BorderType;
  label: string;
  icon: string;
}> = [
  { type: BorderType.ALL, label: 'Tất cả viền', icon: 'grid' },
  { type: BorderType.INSIDE, label: 'Viền bên trong', icon: 'table' },
  { type: BorderType.HORIZONTAL, label: 'Viền ngang bên trong', icon: 'minus' },
  { type: BorderType.VERTICAL, label: 'Viền dọc bên trong', icon: 'pause' },
  { type: BorderType.OUTSIDE, label: 'Viền ngoài cùng', icon: 'square' },
  { type: BorderType.LEFT, label: 'Viền bên trái', icon: 'panel-left' },
  { type: BorderType.TOP, label: 'Viền bên trên', icon: 'panel-top' },
  { type: BorderType.RIGHT, label: 'Viền bên phải', icon: 'panel-right' },
  { type: BorderType.BOTTOM, label: 'Viền bên dưới', icon: 'panel-bottom' },
  { type: BorderType.NONE, label: 'Xóa viền', icon: 'x' },
];

const BORDER_STYLES: Array<{
  style: BorderStyleTypes;
  label: string;
  borderClass: string;
}> = [
  { style: BorderStyleTypes.THIN, label: 'Nét mảnh', borderClass: 'border-t border-foreground' },
  { style: BorderStyleTypes.MEDIUM, label: 'Nét vừa', borderClass: 'border-t-2 border-foreground' },
  { style: BorderStyleTypes.THICK, label: 'Nét đậm', borderClass: 'border-t-4 border-foreground' },
  { style: BorderStyleTypes.DASHED, label: 'Nét đứt', borderClass: 'border-t border-dashed border-foreground' },
  { style: BorderStyleTypes.DOTTED, label: 'Nét chấm', borderClass: 'border-t border-dotted border-foreground' },
  { style: BorderStyleTypes.DOUBLE, label: 'Nét đôi', borderClass: 'border-t-4 border-double border-foreground' },
];

export const CellFormatTools = ({
  isMerged,
  onToggleMerge,
  onMergeAll,
  onMergeHorizontal,
  onMergeVertical,
  onUnmerge,
  onApplyBorder,
}: CellFormatToolsProps) => {
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderStyle, setBorderStyle] = useState<BorderStyleTypes>(BorderStyleTypes.THIN);

  return (
    <div className="flex items-center gap-0.5">
      {/* Borders Popover */}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label="Kẻ viền ô"
              className="flex h-7 w-7 items-center justify-center rounded p-0 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon name="grid" size={16} />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[200px] p-2 text-xs">
          <div className="mb-2 text-[11px] font-medium text-muted-foreground">Kiểu viền ô</div>
          <div className="grid grid-cols-5 gap-1">
            {BORDER_TYPES.map((b) => (
              <ToolbarButton
                key={b.type}
                label={b.label}
                onClick={() => onApplyBorder(b.type, borderStyle, borderColor)}
                className="h-7 w-7"
              >
                <Icon name={b.icon} size={15} />
              </ToolbarButton>
            ))}
          </div>

          <Separator className="my-2" />

          {/* Border color & line style controls */}
          <div className="flex items-center justify-between gap-1 text-xs">
            <span className="text-[11px] text-muted-foreground">Màu viền:</span>
            <ColorPalettePopover
              iconName="brush"
              currentColor={borderColor}
              onSelectColor={setBorderColor}
              label="Chọn màu viền"
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-1 text-xs">
            <span className="text-[11px] text-muted-foreground">Kiểu nét:</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Chọn kiểu nét"
                    className="flex h-6 w-24 items-center justify-center px-1 text-[11px]"
                  />
                }
              >
                <span className="w-12 border-t-2 border-foreground" />
                <Icon name="chevron-down" size={10} className="ml-1 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-28 text-xs">
                {BORDER_STYLES.map((bs) => (
                  <DropdownMenuItem
                    key={bs.style}
                    onClick={() => setBorderStyle(bs.style)}
                    className="flex items-center justify-between py-1 text-xs"
                  >
                    <span className="text-[11px]">{bs.label}</span>
                    <span className={`w-8 ${bs.borderClass}`} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PopoverContent>
      </Popover>

      {/* Merge Cells with Dropdown */}
      <div className="flex items-center">
        <ToolbarButton
          label={isMerged ? 'Hủy gộp ô' : 'Gộp các ô'}
          active={isMerged}
          onClick={onToggleMerge}
        >
          <Icon name="columns" size={16} />
        </ToolbarButton>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                aria-label="Tùy chọn gộp ô"
                className="flex h-7 w-4 items-center justify-center p-0 text-foreground hover:bg-accent/70"
              />
            }
          >
            <Icon name="chevron-down" size={10} className="opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[150px] text-xs">
            <DropdownMenuItem onClick={onMergeAll} className="py-1 text-xs">
              Gộp tất cả
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMergeHorizontal} className="py-1 text-xs">
              Gộp theo chiều ngang
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMergeVertical} className="py-1 text-xs">
              Gộp theo chiều dọc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onUnmerge} className="py-1 text-xs text-destructive">
              Hủy gộp ô
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
