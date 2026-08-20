import type { SlideElement, SlideShapeKind, SlideTransitionType } from '@/types/slides.types';
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
  currentTransition?: SlideTransitionType;
  onChangeTransition?: (transition: SlideTransitionType, applyToAll?: boolean) => void;
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
  currentTransition = 'fade',
  onChangeTransition,
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

  const transitionsList: { label: string; value: SlideTransitionType }[] = [
    { label: t('transitions.none'), value: 'none' },
    { label: t('transitions.fade'), value: 'fade' },
    { label: t('transitions.slideLeft'), value: 'slide-left' },
    { label: t('transitions.slideRight'), value: 'slide-right' },
    { label: t('transitions.slideUp'), value: 'slide-up' },
    { label: t('transitions.zoom'), value: 'zoom' },
    { label: t('transitions.flip3d'), value: 'flip-3d' },
    { label: t('transitions.cube3d'), value: 'cube-3d' },
  ];

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

  const activeTransLabel =
    transitionsList.find((tItem) => tItem.value === currentTransition)?.label || t('toolbar.transition');

  return (
    <TooltipProvider>
      <div className="flex h-10 items-center justify-between border-b border-border bg-card px-3">
        <div className="flex items-center gap-1">
          {/* Undo / Redo */}
          {onUndo && (
            <ToolbarButton label={t('toolbar.undo')} disabled={!canUndo} onClick={onUndo}>
              <Icon name="undo" size={14} />
            </ToolbarButton>
          )}

          {onRedo && (
            <ToolbarButton label={t('toolbar.redo')} disabled={!canRedo} onClick={onRedo}>
              <Icon name="redo" size={14} />
            </ToolbarButton>
          )}

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Add Slide */}
          <ToolbarButton
            label={t('toolbar.addSlideShortcut')}
            onClick={onAddSlide}
            className="border border-border font-medium px-2 gap-1.5"
          >
            <Icon name="plus" size={14} />
            <span>{t('toolbar.addSlide')}</span>
          </ToolbarButton>

          <ToolbarButton label={t('toolbar.duplicateSlide')} onClick={onDuplicateSlide}>
            <Icon name="copy" size={14} />
          </ToolbarButton>

          <ToolbarButton
            label={t('toolbar.deleteSlide')}
            disabled={!canDelete}
            onClick={onDeleteSlide}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Icon name="trash-2" size={14} />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Insert TextBox */}
          <ToolbarButton label={t('toolbar.textBox')} onClick={onAddTextBox} className="gap-1.5 px-2">
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
                <span>{t('shapes.rect')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('rounded')}>
                <div className="mr-2 h-3.5 w-3.5 rounded-xs border border-primary bg-primary/20" />
                <span>{t('shapes.rounded')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('circle')}>
                <div className="mr-2 h-3.5 w-3.5 rounded-full border border-primary bg-primary/20" />
                <span>{t('shapes.circle')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAddShape('triangle')}>
                <span className="mr-2 text-xs">🔺</span>
                <span>{t('shapes.triangle')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('arrow')}>
                <span className="mr-2 text-xs">➡️</span>
                <span>{t('shapes.arrow')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('star')}>
                <span className="mr-2 text-xs">⭐</span>
                <span>{t('shapes.star')}</span>
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
            label={t('toolbar.imageTooltip')}
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
              <span>{t('toolbar.background')}</span>
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

          {/* Slide Transitions Picker (Google Slides Animation Style) */}
          {onChangeTransition && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs font-normal text-muted-foreground hover:text-foreground" />
                }
              >
                <Icon name="sparkles" size={13} className="text-amber-500" />
                <span className="truncate max-w-[90px]">{activeTransLabel}</span>
                <Icon name="chevron-down" size={11} className="opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {transitionsList.map((item) => (
                  <DropdownMenuItem
                    key={item.value}
                    onClick={() => onChangeTransition(item.value)}
                    className={item.value === currentTransition ? 'font-semibold text-primary' : ''}
                  >
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onChangeTransition(currentTransition, true)}>
                  <span className="text-xs text-muted-foreground">{t('toolbar.applyToAll')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
                  <span>{t('toolbar.sampleFiles')}</span>
                  <Icon name="chevron-down" size={11} className="opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={6}>
                  <DropdownMenuItem onClick={() => onLoadSample('sample-basic.pptx')}>
                    <span className="font-medium">{t('toolbar.sampleBasic')}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{t('toolbar.sampleSlidesCount', { count: 3 })}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLoadSample('sample-medium.pptx')}>
                    <span className="font-medium">{t('toolbar.sampleMedium')}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{t('toolbar.sampleSlidesCount', { count: 5 })}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLoadSample('sample-advanced.pptx')}>
                    <span className="font-medium">{t('toolbar.sampleAdvanced')}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{t('toolbar.sampleSlidesCount', { count: 10 })}</span>
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
