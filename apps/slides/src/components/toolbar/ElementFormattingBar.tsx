import type { SlideAnimationType, SlideElement } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
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
import { FontFamilyDropdown } from './FontFamilyDropdown';

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

const ANIMATIONS: { label: string; value: SlideAnimationType }[] = [
  { label: 'Không hiệu ứng', value: 'none' },
  { label: 'Mờ dần vào (Fade in)', value: 'fade-in' },
  { label: 'Bay vào từ trái (Fly left)', value: 'fly-in-left' },
  { label: 'Bay vào từ phải (Fly right)', value: 'fly-in-right' },
  { label: 'Bay vào từ dưới (Fly up)', value: 'fly-in-up' },
  { label: 'Bay vào từ trên (Fly down)', value: 'fly-in-down' },
  { label: 'Thu phóng vào (Zoom in)', value: 'zoom-in' },
  { label: 'Xoay tròn (Spin)', value: 'spin' },
];

const ANIMATION_SPEEDS = [
  { label: '⚡ Rất nhanh (0.2s)', value: 0.2 },
  { label: '🐇 Nhanh (0.4s)', value: 0.4 },
  { label: '⚖️ Trung bình (0.6s)', value: 0.6 },
  { label: '🐢 Chậm (1.0s)', value: 1.0 },
  { label: '⏳ Rất chậm (1.8s)', value: 1.8 },
];

const ANIMATION_DELAYS = [
  { label: '0s (Ngay lập tức)', value: 0 },
  { label: '0.3 giây', value: 0.3 },
  { label: '0.5 giây', value: 0.5 },
  { label: '1.0 giây', value: 1.0 },
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
  const { t } = useTranslation('slides');
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
          <FontFamilyDropdown
            currentFont={element.fontFamily}
            onSelectFont={(fontFamily) => onUpdate({ fontFamily })}
          />

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
            label={t('formatting.bold')}
            active={element.fontWeight === 'bold'}
            onClick={() => onUpdate({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}
          >
            <span className="font-bold text-xs">B</span>
          </ToolbarButton>

          <ToolbarButton
            label={t('formatting.italic')}
            active={element.fontStyle === 'italic'}
            onClick={() => onUpdate({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
          >
            <span className="italic font-serif text-xs">I</span>
          </ToolbarButton>

          <ToolbarButton
            label="Gạch chân (Ctrl+U)"
            active={element.textDecoration === 'underline'}
            onClick={() =>
              onUpdate({
                textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline',
              })
            }
          >
            <span className="underline text-xs">U</span>
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
            label={t('formatting.align')}
            onClick={() => {
              const nextAlign =
                element.align === 'left' ? 'center' : element.align === 'center' ? 'right' : 'left';
              onUpdate({ align: nextAlign });
            }}
          >
            <Icon name="align-center" size={14} />
          </ToolbarButton>

          {/* Bullet list toggle */}
          <ToolbarButton
            label="Danh sách dấu đầu dòng"
            onClick={() => {
              if (element.content) {
                const lines = element.content.split('\n');
                const isBulleted = lines.every((l) => l.startsWith('• '));
                const nextContent = isBulleted
                  ? lines.map((l) => l.replace(/^• /, '')).join('\n')
                  : lines.map((l) => (l.startsWith('• ') ? l : `• ${l}`)).join('\n');
                onUpdate({ content: nextContent });
              }
            }}
          >
            <Icon name="list" size={14} />
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
            <span>{t('formatting.fillColor')}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="grid grid-cols-4 gap-1 p-2">
            <button
              type="button"
              onClick={() => onUpdate({ fill: undefined })}
              className="col-span-4 rounded border border-dashed py-1 text-[11px] text-muted-foreground hover:bg-muted"
            >
              {t('formatting.noBorder')}
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
            label={t('formatting.replaceImage')}
            onClick={() => replaceImgInputRef.current?.click()}
            className="gap-1.5 px-2 text-xs font-medium border border-border"
          >
            <Icon name="image" size={13} />
            <span>{t('formatting.replaceImage')}</span>
          </ToolbarButton>

          {/* Border Stroke Width */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal text-muted-foreground hover:text-foreground" />
              }
            >
              <Icon name="square" size={13} />
              <span>{t('formatting.borderStyle')}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onUpdate({ stroke: undefined, strokeWidth: 0 })}>
                {t('formatting.noBorder')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUpdate({ stroke: '#0f172a', strokeWidth: 2 })}>
                {t('formatting.borderBlack')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ stroke: '#1e40af', strokeWidth: 3 })}>
                {t('formatting.borderPrimary')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ stroke: '#dc2626', strokeWidth: 3 })}>
                {t('formatting.borderRed')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      <Separator orientation="vertical" className="mx-1 h-4" />

      {/* 4. ELEMENT ANIMATIONS (Google Slides Entrance Animations & Speed) */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal text-amber-600 hover:text-amber-700" />
          }
        >
          <Icon name="sparkles" size={13} />
          <span>
            {element.animation && element.animation !== 'none'
              ? `Hiệu ứng (${element.animationDuration || 0.6}s)`
              : 'Hiệu ứng'}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56 p-1.5">
          <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Kiểu hiệu ứng xuất hiện
          </div>
          {ANIMATIONS.map((anim) => (
            <DropdownMenuItem
              key={anim.value}
              onClick={() => onUpdate({ animation: anim.value })}
              className={element.animation === anim.value ? 'font-semibold text-primary' : ''}
            >
              <span>{anim.label}</span>
            </DropdownMenuItem>
          ))}

          {element.animation && element.animation !== 'none' && (
            <>
              <DropdownMenuSeparator className="my-1.5" />
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tốc độ hiệu ứng (Thời lượng)
              </div>
              {ANIMATION_SPEEDS.map((speed) => {
                const isCurrentSpeed =
                  (element.animationDuration || 0.6) === speed.value;
                return (
                  <DropdownMenuItem
                    key={speed.value}
                    onClick={() => onUpdate({ animationDuration: speed.value })}
                    className={isCurrentSpeed ? 'font-semibold text-primary' : ''}
                  >
                    <span>{speed.label}</span>
                  </DropdownMenuItem>
                );
              })}

              <DropdownMenuSeparator className="my-1.5" />
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Độ trễ xuất hiện
              </div>
              {ANIMATION_DELAYS.map((delay) => {
                const isCurrentDelay = (element.animationDelay || 0) === delay.value;
                return (
                  <DropdownMenuItem
                    key={delay.value}
                    onClick={() => onUpdate({ animationDelay: delay.value })}
                    className={isCurrentDelay ? 'font-semibold text-primary' : ''}
                  >
                    <span>{delay.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-4" />

      {/* 5. COMMON ACTIONS: ROTATE, FLIP, CENTER, Z-INDEX, DUPLICATE, DELETE */}
      {onRotate && (
        <ToolbarButton label={t('formatting.rotate90')} onClick={() => onRotate(90)}>
          <Icon name="rotate-cw" size={14} />
        </ToolbarButton>
      )}

      {/* Flip Horizontal / Vertical */}
      <ToolbarButton
        label="Lật ngang"
        active={element.flipH}
        onClick={() => onUpdate({ flipH: !element.flipH })}
      >
        <Icon name="columns" size={13} />
      </ToolbarButton>

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
              {t('formatting.centerHorizontally')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCenter('vertical')}>
              {t('formatting.centerVertically')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onCenter('both')}>
              {t('formatting.centerBoth')}
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
          <DropdownMenuItem onClick={onBringForward}>{t('formatting.bringForward')}</DropdownMenuItem>
          <DropdownMenuItem onClick={onBringToFront}>{t('formatting.bringToFront')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSendBackward}>{t('formatting.sendBackward')}</DropdownMenuItem>
          <DropdownMenuItem onClick={onSendToBack}>{t('formatting.sendToBack')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarButton label={t('formatting.duplicate')} onClick={onDuplicate}>
        <Icon name="copy" size={13} />
      </ToolbarButton>

      <ToolbarButton
        label={t('formatting.delete')}
        onClick={onDelete}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Icon name="trash-2" size={13} />
      </ToolbarButton>
    </div>
  );
};
