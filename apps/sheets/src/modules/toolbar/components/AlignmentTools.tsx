import type { TextRotationAngle, TextWrapMode } from '@/modules/toolbar/types/toolbar.types';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@office/ui-kit';

export interface AlignmentToolsProps {
  horizontalAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  wrapMode: TextWrapMode;
  textRotation: TextRotationAngle;
  onHorizontalAlignChange: (align: 'left' | 'center' | 'right') => void;
  onVerticalAlignChange: (align: 'top' | 'middle' | 'bottom') => void;
  onSetWrapMode: (mode: TextWrapMode) => void;
  onSetTextRotation: (angle: TextRotationAngle) => void;
}

const ROTATION_PRESETS: Array<{
  angle: TextRotationAngle;
  label: string;
  icon: string;
}> = [
  { angle: 0, label: 'Không xoay (Mặc định)', icon: 'minus' },
  { angle: 45, label: 'Nghiêng lên 45°', icon: 'trending-up' },
  { angle: -45, label: 'Nghiêng xuống -45°', icon: 'trending-down' },
  { angle: 90, label: 'Xoay lên 90°', icon: 'arrow-up' },
  { angle: -90, label: 'Xoay xuống -90°', icon: 'arrow-down' },
];

export const AlignmentTools = ({
  horizontalAlign,
  verticalAlign,
  wrapMode,
  textRotation,
  onHorizontalAlignChange,
  onVerticalAlignChange,
  onSetWrapMode,
  onSetTextRotation,
}: AlignmentToolsProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {/* Horizontal Alignment Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label="Căn chỉnh theo chiều ngang"
              className="flex h-7 items-center gap-0.5 rounded px-1 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon
            name={
              horizontalAlign === 'center'
                ? 'align-center'
                : horizontalAlign === 'right'
                  ? 'align-right'
                  : 'align-left'
            }
            size={16}
          />
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-28 text-xs">
          <DropdownMenuItem
            onClick={() => onHorizontalAlignChange('left')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="align-left" size={15} />
            <span>Trái</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onHorizontalAlignChange('center')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="align-center" size={15} />
            <span>Giữa</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onHorizontalAlignChange('right')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="align-right" size={15} />
            <span>Phải</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Vertical Alignment Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label="Căn chỉnh theo chiều dọc"
              className="flex h-7 items-center gap-0.5 rounded px-1 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon
            name={
              verticalAlign === 'top'
                ? 'arrow-up-to-line'
                : verticalAlign === 'middle'
                  ? 'align-vertical-space-around'
                  : 'arrow-down-to-line'
            }
            size={16}
          />
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-28 text-xs">
          <DropdownMenuItem
            onClick={() => onVerticalAlignChange('top')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="arrow-up-to-line" size={15} />
            <span>Trên cùng</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onVerticalAlignChange('middle')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="align-vertical-space-around" size={15} />
            <span>Ở giữa</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onVerticalAlignChange('bottom')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="arrow-down-to-line" size={15} />
            <span>Dưới cùng</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text Wrapping Mode Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label="Xuống dòng tự động"
              className="flex h-7 items-center gap-0.5 rounded px-1 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon name="wrap-text" size={16} />
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36 text-xs">
          <DropdownMenuItem
            onClick={() => onSetWrapMode('overflow')}
            className="flex items-center justify-between py-1 text-xs"
          >
            <span>Tràn ô (Overflow)</span>
            {wrapMode === 'overflow' && <Icon name="check" size={14} className="text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSetWrapMode('wrap')}
            className="flex items-center justify-between py-1 text-xs"
          >
            <span>Xuống dòng (Wrap)</span>
            {wrapMode === 'wrap' && <Icon name="check" size={14} className="text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSetWrapMode('clip')}
            className="flex items-center justify-between py-1 text-xs"
          >
            <span>Cắt tỉa (Clip)</span>
            {wrapMode === 'clip' && <Icon name="check" size={14} className="text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text Rotation Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label="Xoay hướng chữ"
              className="flex h-7 items-center gap-0.5 rounded px-1 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon name="rotate-cw" size={15} />
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 text-xs">
          {ROTATION_PRESETS.map((rp) => (
            <DropdownMenuItem
              key={rp.angle}
              onClick={() => onSetTextRotation(rp.angle)}
              className="flex items-center justify-between py-1 text-xs"
            >
              <div className="flex items-center gap-2">
                <Icon name={rp.icon} size={14} />
                <span>{rp.label}</span>
              </div>
              {textRotation === rp.angle && (
                <Icon name="check" size={14} className="text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
