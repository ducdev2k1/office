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
  cn,
} from '@office/ui-kit';
import { BorderStyleTypes, BorderType } from '@univerjs/presets';

export interface CellFormatToolsProps {
  isMerged: boolean;
  borderColor: string;
  borderStyle: BorderStyleTypes;
  borderType?: BorderType;
  onToggleMerge: () => void;
  onMergeAll: () => void;
  onMergeHorizontal: () => void;
  onMergeVertical: () => void;
  onUnmerge: () => void;
  onSetBorderColor: (color: string) => void;
  onSetBorderStyle: (style: BorderStyleTypes) => void;
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

interface BorderStyleOption {
  style: BorderStyleTypes;
  label: string;
  borderClass: string;
}

/** Kiểu nét mặc định, cũng là giá trị dự phòng khi ô dùng kiểu nét ngoài danh sách */
const DEFAULT_BORDER_STYLE: BorderStyleOption = {
  style: BorderStyleTypes.THIN,
  label: 'Nét mảnh',
  borderClass: 'border-t',
};

const BORDER_STYLES: BorderStyleOption[] = [
  DEFAULT_BORDER_STYLE,
  { style: BorderStyleTypes.MEDIUM, label: 'Nét vừa', borderClass: 'border-t-2' },
  { style: BorderStyleTypes.THICK, label: 'Nét đậm', borderClass: 'border-t-4' },
  { style: BorderStyleTypes.DASHED, label: 'Nét đứt', borderClass: 'border-t border-dashed' },
  { style: BorderStyleTypes.DOTTED, label: 'Nét chấm', borderClass: 'border-t border-dotted' },
  { style: BorderStyleTypes.DOUBLE, label: 'Nét đôi', borderClass: 'border-t-4 border-double' },
];

export const CellFormatTools = ({
  isMerged,
  borderColor,
  borderStyle,
  borderType,
  onToggleMerge,
  onMergeAll,
  onMergeHorizontal,
  onMergeVertical,
  onUnmerge,
  onSetBorderColor,
  onSetBorderStyle,
  onApplyBorder,
}: CellFormatToolsProps) => {
  const currentStyle =
    BORDER_STYLES.find((s) => s.style === borderStyle) ?? DEFAULT_BORDER_STYLE;

  const handleSelectBorderType = (type: BorderType) => {
    onApplyBorder(type, borderStyle, borderColor);
  };

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
                active={borderType === b.type && b.type !== BorderType.NONE}
                onClick={() => handleSelectBorderType(b.type)}
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
              onSelectColor={onSetBorderColor}
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
                    className="flex h-6 w-24 items-center justify-between px-1.5 text-[11px]"
                  />
                }
              >
                <span
                  className={cn('w-14 shrink-0', currentStyle.borderClass)}
                  style={{ borderTopColor: borderColor }}
                />
                <Icon name="chevron-down" size={10} className="opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 text-xs">
                {BORDER_STYLES.map((bs) => (
                  <DropdownMenuItem
                    key={bs.style}
                    onClick={() => onSetBorderStyle(bs.style)}
                    className={cn(
                      'flex items-center justify-between py-1 px-2 text-xs cursor-pointer',
                      borderStyle === bs.style && 'bg-accent font-medium',
                    )}
                  >
                    <span className="text-[11px]">{bs.label}</span>
                    <span
                      className={cn('w-10 shrink-0', bs.borderClass)}
                      style={{ borderTopColor: borderColor }}
                    />
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
