import type { SlideElement } from '@/types/slides.types';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@office/ui-kit';
import React, { useRef } from 'react';

const PALETTE_COLORS = [
  { label: 'Trắng', value: '#ffffff' },
  { label: 'Xám sáng', value: '#f8fafc' },
  { label: 'Đen than', value: '#0f172a' },
  { label: 'Xanh iNET', value: '#1e40af' },
  { label: 'Xanh nhạt', value: '#eff6ff' },
  { label: 'Vàng cam', value: '#b45309' },
  { label: 'Vàng ấm', value: '#fffbeb' },
  { label: 'Xanh lá', value: '#16a34a' },
  { label: 'Xanh ngọc', value: '#f0fdf4' },
  { label: 'Đỏ', value: '#dc2626' },
  { label: 'Tím', value: '#9333ea' },
];

interface ElementFormattingBarProps {
  element: SlideElement;
  onUpdate: (patch: Partial<SlideElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCenter?: (axis: 'horizontal' | 'vertical' | 'both') => void;
  onRotate?: (deltaDeg: number) => void;
  onReplaceImage?: (dataUrl: string) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

export const ElementFormattingBar = ({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onCenter,
  onRotate,
  onReplaceImage,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
}: ElementFormattingBarProps) => {
  const replaceImgInputRef = useRef<HTMLInputElement>(null);

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onReplaceImage) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onReplaceImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-1">
      {/* 1. TEXT FORMATTING */}
      {element.type === 'text' && (
        <>
          <div className="flex items-center rounded border border-border px-1">
            <button
              type="button"
              onClick={() => onUpdate({ fontSize: Math.max(10, (element.fontSize || 20) - 2) })}
              className="px-1 text-xs hover:text-primary"
            >
              -
            </button>
            <span className="w-6 text-center text-xs font-semibold">{element.fontSize || 20}</span>
            <button
              type="button"
              onClick={() => onUpdate({ fontSize: Math.min(96, (element.fontSize || 20) + 2) })}
              className="px-1 text-xs hover:text-primary"
            >
              +
            </button>
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={element.fontWeight === 'bold' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onUpdate({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className="h-8 w-8 p-0 font-bold"
                />
              }
            >
              B
            </TooltipTrigger>
            <TooltipContent>Đậm (Ctrl+B)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={element.fontStyle === 'italic' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onUpdate({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className="h-8 w-8 p-0 italic font-serif"
                />
              }
            >
              I
            </TooltipTrigger>
            <TooltipContent>Nghiêng (Ctrl+I)</TooltipContent>
          </Tooltip>

          {/* Text Color Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" />
              }
            >
              <span
                className="h-4 w-4 rounded-xs border border-border"
                style={{ backgroundColor: element.color || '#0f172a' }}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="grid grid-cols-4 gap-1 p-2">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onUpdate({ color: c.value })}
                  className="h-6 w-6 rounded border border-border shadow-xs hover:scale-110"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Alignment */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const nextAlign =
                      element.align === 'left' ? 'center' : element.align === 'center' ? 'right' : 'left';
                    onUpdate({ align: nextAlign });
                  }}
                  className="h-8 w-8 p-0 text-xs font-semibold"
                />
              }
            >
              <Icon name="align-center" size={14} />
            </TooltipTrigger>
            <TooltipContent>Căn lề (Trái / Giữa / Phải)</TooltipContent>
          </Tooltip>
        </>
      )}

      {/* 2. SHAPE & TEXTBOX FILL / BORDER */}
      {(element.type === 'shape' || element.type === 'text') && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-1.5 text-xs text-muted-foreground" />
            }
          >
            <Icon name="edit" size={13} />
            <span>Màu tô</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="grid grid-cols-4 gap-1 p-2">
            <button
              type="button"
              onClick={() => onUpdate({ fill: undefined })}
              className="col-span-4 rounded border border-dashed py-1 text-[11px] text-muted-foreground"
            >
              Không màu nền
            </button>
            {PALETTE_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onUpdate({ fill: c.value })}
                className="h-6 w-6 rounded border border-border shadow-xs hover:scale-110"
                style={{ backgroundColor: c.value }}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* 3. IMAGE ACTIONS (Google Slides Style) */}
      {element.type === 'image' && (
        <>
          <input
            ref={replaceImgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplaceFile}
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => replaceImgInputRef.current?.click()}
                  className="h-8 gap-1.5 px-2 text-xs font-medium"
                />
              }
            >
              <Icon name="image" size={13} />
              <span>Thay thế ảnh</span>
            </TooltipTrigger>
            <TooltipContent>Chọn ảnh mới từ máy tính</TooltipContent>
          </Tooltip>

          {/* Border Stroke Width */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-1.5 text-xs text-muted-foreground" />
              }
            >
              <Icon name="square" size={13} />
              <span>Viền</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onUpdate({ stroke: undefined, strokeWidth: 0 })}>
                Không viền
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ stroke: '#0f172a', strokeWidth: 1 })}>
                Viền mỏng (1px)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ stroke: '#0f172a', strokeWidth: 3 })}>
                Viền vừa (3px)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ stroke: '#1e40af', strokeWidth: 4 })}>
                Viền dày iNET (4px)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {/* 4. COMMON ACTIONS: ROTATE, CENTER, Z-INDEX, DUPLICATE, DELETE */}
      {onRotate && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRotate(90)}
                className="h-8 w-8 p-0"
              />
            }
          >
            <Icon name="rotate-cw" size={14} className="text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>Xoay 90°</TooltipContent>
        </Tooltip>
      )}

      {onCenter && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" />
            }
          >
            <Icon name="align-center" size={14} className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onCenter('horizontal')}>
              Căn giữa theo chiều ngang
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCenter('vertical')}>
              Căn giữa theo chiều dọc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCenter('both')}>
              Căn giữa toàn màn hình
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Reorder Z-index */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" />
          }
        >
          <Icon name="layers" size={14} className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onBringForward}>Lên trước 1 lớp</DropdownMenuItem>
          <DropdownMenuItem onClick={onBringToFront}>Lên trên cùng</DropdownMenuItem>
          <DropdownMenuItem onClick={onSendBackward}>Xuống sau 1 lớp</DropdownMenuItem>
          <DropdownMenuItem onClick={onSendToBack}>Xuống dưới cùng</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0"
            />
          }
        >
          <Icon name="copy" size={13} className="text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>Nhân bản (Ctrl+D)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            />
          }
        >
          <Icon name="trash-2" size={13} />
        </TooltipTrigger>
        <TooltipContent>Xoá (Delete)</TooltipContent>
      </Tooltip>
    </div>
  );
};
