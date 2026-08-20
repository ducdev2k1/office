import type { SlideElement } from '@/types/slides.types';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Separator,
  ToolbarButton,
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
          <div className="flex items-center rounded-md border border-border bg-background px-1 h-7">
            <button
              type="button"
              onClick={() => onUpdate({ fontSize: Math.max(10, (element.fontSize || 20) - 2) })}
              className="px-1 text-xs font-bold hover:text-primary transition-colors"
            >
              -
            </button>
            <span className="w-6 text-center text-xs font-semibold">{element.fontSize || 20}</span>
            <button
              type="button"
              onClick={() => onUpdate({ fontSize: Math.min(96, (element.fontSize || 20) + 2) })}
              className="px-1 text-xs font-bold hover:text-primary transition-colors"
            >
              +
            </button>
          </div>

          <ToolbarButton
            label="Đậm (Ctrl+B)"
            active={element.fontWeight === 'bold'}
            onClick={() => onUpdate({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}
          >
            <span className="font-bold text-xs">B</span>
          </ToolbarButton>

          <ToolbarButton
            label="Nghiêng (Ctrl+I)"
            active={element.fontStyle === 'italic'}
            onClick={() => onUpdate({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
          >
            <span className="italic font-serif text-xs">I</span>
          </ToolbarButton>

          {/* Text Color Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" />
              }
            >
              <span
                className="h-3.5 w-3.5 rounded-xs border border-border shadow-2xs"
                style={{ backgroundColor: element.color || '#0f172a' }}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="grid grid-cols-4 gap-1 p-2">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onUpdate({ color: c.value })}
                  className="h-6 w-6 rounded border border-border shadow-2xs hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Text Align Toggle */}
          <ToolbarButton
            label="Căn lề (Trái / Giữa / Phải)"
            onClick={() => {
              const nextAlign =
                element.align === 'left' ? 'center' : element.align === 'center' ? 'right' : 'left';
              onUpdate({ align: nextAlign });
            }}
          >
            <Icon name="align-center" size={14} />
          </ToolbarButton>
        </>
      )}

      {/* 2. SHAPE & TEXTBOX FILL */}
      {(element.type === 'shape' || element.type === 'text') && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal text-muted-foreground hover:text-foreground" />
            }
          >
            <Icon name="edit" size={13} />
            <span>Màu tô</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="grid grid-cols-4 gap-1 p-2">
            <button
              type="button"
              onClick={() => onUpdate({ fill: undefined })}
              className="col-span-4 rounded border border-dashed py-1 text-[11px] text-muted-foreground hover:bg-muted"
            >
              Không màu nền
            </button>
            {PALETTE_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onUpdate({ fill: c.value })}
                className="h-6 w-6 rounded border border-border shadow-2xs hover:scale-110 transition-transform"
                style={{ backgroundColor: c.value }}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* 3. IMAGE ACTIONS */}
      {element.type === 'image' && (
        <>
          <input
            ref={replaceImgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplaceFile}
          />
          <ToolbarButton
            label="Thay thế ảnh từ máy tính"
            onClick={() => replaceImgInputRef.current?.click()}
            className="gap-1.5 px-2 text-xs font-medium border border-border"
          >
            <Icon name="image" size={13} />
            <span>Thay thế ảnh</span>
          </ToolbarButton>

          {/* Border Stroke Width */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal text-muted-foreground hover:text-foreground" />
              }
            >
              <Icon name="square" size={13} />
              <span>Viền</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onUpdate({ stroke: undefined, strokeWidth: 0 })}>
                Không viền
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

      <Separator orientation="vertical" className="mx-1 h-4" />

      {/* 4. COMMON ACTIONS: ROTATE, CENTER, Z-INDEX, DUPLICATE, DELETE */}
      {onRotate && (
        <ToolbarButton label="Xoay 90°" onClick={() => onRotate(90)}>
          <Icon name="rotate-cw" size={14} />
        </ToolbarButton>
      )}

      {onCenter && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" />
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
            <DropdownMenuSeparator />
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
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" />
          }
        >
          <Icon name="layers" size={14} className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onBringForward}>Lên trước 1 lớp</DropdownMenuItem>
          <DropdownMenuItem onClick={onBringToFront}>Lên trên cùng</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSendBackward}>Xuống sau 1 lớp</DropdownMenuItem>
          <DropdownMenuItem onClick={onSendToBack}>Xuống dưới cùng</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarButton label="Nhân bản (Ctrl+D)" onClick={onDuplicate}>
        <Icon name="copy" size={13} />
      </ToolbarButton>

      <ToolbarButton
        label="Xoá (Delete)"
        onClick={onDelete}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Icon name="trash-2" size={13} />
      </ToolbarButton>
    </div>
  );
};
