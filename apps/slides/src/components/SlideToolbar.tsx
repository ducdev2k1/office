import type { SlideElement, SlideShapeKind } from '@/types/slides.types';
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
  TooltipProvider,
} from '@office/ui-kit';
import React, { useRef } from 'react';
import { ElementFormattingBar } from './toolbar/ElementFormattingBar';

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

interface SlideToolbarProps {
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onDuplicateSlide: () => void;
  onPresent: () => void;
  canDelete: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onLoadSample?: (sample: 'sample-basic.pptx' | 'sample-medium.pptx' | 'sample-advanced.pptx') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  selectedElement?: SlideElement;
  onAddTextBox: () => void;
  onAddShape: (kind: SlideShapeKind) => void;
  onAddImage: (dataUrl: string) => void;
  onChangeSlideBackground: (color: string) => void;
  onUpdateSelectedElement: (patch: Partial<SlideElement>) => void;
  onDeleteSelectedElement: () => void;
  onDuplicateSelectedElement: () => void;
  onCenterSelectedElement?: (axis: 'horizontal' | 'vertical' | 'both') => void;
  onRotateSelectedElement?: (deltaDeg: number) => void;
  onReplaceImageSelectedElement?: (dataUrl: string) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

export const SlideToolbar = ({
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onPresent,
  canDelete,
  zoom,
  onZoomChange,
  onLoadSample,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  selectedElement,
  onAddTextBox,
  onAddShape,
  onAddImage,
  onChangeSlideBackground,
  onUpdateSelectedElement,
  onDeleteSelectedElement,
  onDuplicateSelectedElement,
  onCenterSelectedElement,
  onRotateSelectedElement,
  onReplaceImageSelectedElement,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
}: SlideToolbarProps) => {
  const { t } = useTranslation('slides');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onAddImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <TooltipProvider>
      <div className="flex h-10 items-center justify-between border-b border-border bg-card px-3">
        <div className="flex items-center gap-1">
          {/* Undo / Redo */}
          {onUndo && (
            <ToolbarButton label="Hoàn tác (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}>
              <Icon name="undo" size={14} />
            </ToolbarButton>
          )}

          {onRedo && (
            <ToolbarButton label="Làm lại (Ctrl+Y)" disabled={!canRedo} onClick={onRedo}>
              <Icon name="redo" size={14} />
            </ToolbarButton>
          )}

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Add Slide */}
          <ToolbarButton
            label={`${t('toolbar.addSlide')} (Ctrl+M)`}
            onClick={onAddSlide}
            className="border border-border font-medium px-2 gap-1.5"
          >
            <Icon name="plus" size={14} />
            <span>{t('toolbar.addSlide')}</span>
          </ToolbarButton>

          <ToolbarButton label={`${t('toolbar.duplicateSlide')} (Ctrl+D)`} onClick={onDuplicateSlide}>
            <Icon name="copy" size={14} />
          </ToolbarButton>

          <ToolbarButton
            label={`${t('toolbar.deleteSlide')} (Delete)`}
            disabled={!canDelete}
            onClick={onDeleteSlide}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Icon name="trash-2" size={14} />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Insert TextBox */}
          <ToolbarButton label="Chèn hộp văn bản" onClick={onAddTextBox} className="gap-1.5 px-2">
            <Icon name="type" size={14} />
            <span>{t('toolbar.textBox')}</span>
          </ToolbarButton>

          {/* Insert Shapes Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal hover:bg-hover" />
              }
            >
              <Icon name="square" size={14} />
              <span>{t('toolbar.shapes')}</span>
              <Icon name="chevron-down" size={11} className="opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onAddShape('rect')}>
                <div className="mr-2 h-3.5 w-3.5 border border-primary bg-primary/20" />
                <span>Hình chữ nhật</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('rounded')}>
                <div className="mr-2 h-3.5 w-3.5 rounded-xs border border-primary bg-primary/20" />
                <span>Hình chữ nhật bo góc</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('circle')}>
                <div className="mr-2 h-3.5 w-3.5 rounded-full border border-primary bg-primary/20" />
                <span>Hình tròn / Elip</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAddShape('triangle')}>
                <span className="mr-2 text-xs">🔺</span>
                <span>Hình tam giác</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('arrow')}>
                <span className="mr-2 text-xs">➡️</span>
                <span>Mũi tên phải</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('star')}>
                <span className="mr-2 text-xs">⭐</span>
                <span>Ngôi sao 5 cánh</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Insert Image */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFileChange}
          />
          <ToolbarButton
            label="Chèn hình ảnh từ máy tính"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 px-2"
          >
            <Icon name="image" size={14} />
            <span>{t('toolbar.image')}</span>
          </ToolbarButton>

          {/* Slide Background Color Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs font-normal text-muted-foreground hover:text-foreground" />
              }
            >
              <span className="h-3 w-3 rounded-full border border-border bg-gradient-to-tr from-amber-400 to-blue-500 shadow-2xs" />
              <span>Nền Slide</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="grid grid-cols-4 gap-1 p-2">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onChangeSlideBackground(c.value)}
                  className="h-6 w-6 rounded border border-border shadow-2xs hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Selected Element Formatting Bar */}
          {selectedElement && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <ElementFormattingBar
                element={selectedElement}
                onUpdate={onUpdateSelectedElement}
                onDelete={onDeleteSelectedElement}
                onDuplicate={onDuplicateSelectedElement}
                onCenter={onCenterSelectedElement}
                onRotate={onRotateSelectedElement}
                onReplaceImage={onReplaceImageSelectedElement}
                onBringForward={onBringForward}
                onSendBackward={onSendBackward}
                onBringToFront={onBringToFront}
                onSendToBack={onSendToBack}
              />
            </>
          )}

          {/* Sample PPTX Loader */}
          {onLoadSample && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <Icon name="file-text" size={13} />
                  <span>File Mẫu</span>
                  <Icon name="chevron-down" size={11} className="opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={6}>
                  <DropdownMenuItem onClick={() => onLoadSample('sample-basic.pptx')}>
                    <span className="font-medium">1. Mẫu Cơ Bản</span>
                    <span className="ml-2 text-xs text-muted-foreground">(3 slide)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLoadSample('sample-medium.pptx')}>
                    <span className="font-medium">2. Mẫu Trung Bình</span>
                    <span className="ml-2 text-xs text-muted-foreground">(5 slide)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLoadSample('sample-advanced.pptx')}>
                    <span className="font-medium">3. Mẫu Nâng Cao</span>
                    <span className="ml-2 text-xs text-muted-foreground">(10 slide)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(50, zoom - 10))}
              className="px-1 font-semibold hover:text-foreground transition-colors"
            >
              -
            </button>
            <span className="w-10 text-center font-medium text-foreground">{zoom}%</span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="px-1 font-semibold hover:text-foreground transition-colors"
            >
              +
            </button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onPresent}
            className="h-7 gap-1.5 bg-[var(--o-kind-slides)] px-3 text-xs text-white hover:opacity-90 shadow-xs"
          >
            <Icon name="play" size={13} />
            <span>{t('header.present')}</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
