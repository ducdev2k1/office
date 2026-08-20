import type {
  SlideElement,
  SlideLayoutType,
  SlideLineKind,
  SlideShapeKind,
  SlideTransitionType,
} from '@/types/slides.types';
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
import { SlideLayoutDropdown } from './toolbar/SlideLayoutDropdown';

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
  currentTransitionDuration?: number;
  onChangeTransition?: (transition: SlideTransitionType, applyToAll?: boolean) => void;
  onChangeTransitionDuration?: (duration: number, applyToAll?: boolean) => void;
  onSelectLayout?: (layout: SlideLayoutType) => void;
  selectedElement?: SlideElement;
  onAddTextBox: () => void;
  onAddShape: (kind: SlideShapeKind) => void;
  onAddLine?: (kind: SlideLineKind) => void;
  onAddTable?: (rows: number, cols: number) => void;
  onAddImage: (dataUrl: string) => void;
  onOpenBackgroundDialog?: () => void;
  onOpenFindReplace?: () => void;
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
  currentTransition,
  currentTransitionDuration = 0.5,
  onChangeTransition,
  onChangeTransitionDuration,
  onSelectLayout,
  selectedElement,
  onAddTextBox,
  onAddShape,
  onAddLine,
  onAddTable,
  onAddImage,
  onOpenBackgroundDialog,
  onOpenFindReplace,
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

  const transitionSpeeds = [
    { label: '⚡ Rất nhanh (0.25s)', value: 0.25 },
    { label: '🐇 Nhanh (0.4s)', value: 0.4 },
    { label: '⚖️ Trung bình (0.6s)', value: 0.6 },
    { label: '🐢 Chậm (1.0s)', value: 1.0 },
    { label: '⏳ Rất chậm (1.6s)', value: 1.6 },
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
      <div className="flex h-10 items-center justify-between border-b border-border bg-card px-3 select-none">
        {/* Left & Middle tools container */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {/* 1. Undo / Redo */}
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

          {/* 2. Add Slide Button */}
          <ToolbarButton
            label={t('toolbar.addSlideShortcut')}
            onClick={onAddSlide}
            className="border border-border font-medium px-2 gap-1.5"
          >
            <Icon name="plus" size={14} />
            <span>{t('toolbar.addSlide')}</span>
          </ToolbarButton>

          {/* 3. Insert Tools (Always Accessible) */}
          <ToolbarButton label={t('toolbar.textBox')} onClick={onAddTextBox} className="gap-1.5 px-2">
            <Icon name="type" size={14} />
            <span>{t('toolbar.textBox')}</span>
          </ToolbarButton>

          {/* Shapes Dropdown */}
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
            <DropdownMenuContent align="start" className="grid grid-cols-2 gap-1 p-2 w-64">
              <DropdownMenuItem onClick={() => onAddShape('rect')}>
                <span className="mr-2 text-xs">⬛</span>
                <span>{t('shapes.rect')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('rounded')}>
                <span className="mr-2 text-xs">🔲</span>
                <span>{t('shapes.rounded')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('circle')}>
                <span className="mr-2 text-xs">⚪</span>
                <span>{t('shapes.circle')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('triangle')}>
                <span className="mr-2 text-xs">🔺</span>
                <span>{t('shapes.triangle')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('diamond')}>
                <span className="mr-2 text-xs">🔶</span>
                <span>Hình thoi</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('hexagon')}>
                <span className="mr-2 text-xs">⬡</span>
                <span>Hình lục giác</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('star')}>
                <span className="mr-2 text-xs">⭐</span>
                <span>{t('shapes.star')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('callout')}>
                <span className="mr-2 text-xs">💬</span>
                <span>Khung hội thoại</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('heart')}>
                <span className="mr-2 text-xs">❤️</span>
                <span>Trái tim</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddShape('cloud')}>
                <span className="mr-2 text-xs">☁️</span>
                <span>Đám mây</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Lines Dropdown */}
          {onAddLine && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal hover:bg-hover" />
                }
              >
                <Icon name="minus" size={14} />
                <span>Đường kẻ</span>
                <Icon name="chevron-down" size={11} className="opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onAddLine('straight')}>
                  <span>— Đường thẳng</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddLine('arrow')}>
                  <span>➡️ Mũi tên</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddLine('double-arrow')}>
                  <span>↔️ Mũi tên 2 đầu</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddLine('elbow')}>
                  <span>↪️ Đường gấp khúc (Elbow)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddLine('curved')}>
                  <span>〰️ Đường cong (Curved)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Table Dropdown */}
          {onAddTable && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal hover:bg-hover" />
                }
              >
                <Icon name="table" size={14} />
                <span>Bảng</span>
                <Icon name="chevron-down" size={11} className="opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onAddTable(2, 2)}>Bảng 2 x 2</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddTable(3, 3)}>Bảng 3 x 3</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddTable(4, 4)}>Bảng 4 x 4</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddTable(5, 3)}>Bảng 5 x 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Image Upload Button */}
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

          {/* 4. CONTEXTUAL SWITCHING: ELEMENT FORMATTING vs SLIDE-LEVEL ACTIONS */}
          {selectedElement ? (
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
          ) : (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />

              {/* Background Color/Image Customizer */}
              {onOpenBackgroundDialog && (
                <ToolbarButton
                  label="Đổi hình nền slide (Màu sắc, Gradient, Ảnh)"
                  onClick={onOpenBackgroundDialog}
                  className="gap-1.5 px-2"
                >
                  <Icon name="palette" size={14} className="text-amber-500" />
                  <span>{t('toolbar.background')}</span>
                </ToolbarButton>
              )}

              {/* Slide Layouts Picker */}
              {onSelectLayout && <SlideLayoutDropdown onSelectLayout={onSelectLayout} />}

              {/* Slide Transitions Picker with Speed Controls */}
              {onChangeTransition && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs font-normal text-muted-foreground hover:text-foreground" />
                    }
                  >
                    <Icon name="sparkles" size={13} className="text-amber-500" />
                    <span className="truncate max-w-[120px]">
                      {activeTransLabel} ({currentTransitionDuration}s)
                    </span>
                    <Icon name="chevron-down" size={11} className="opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-56 p-1.5">
                    <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Kiểu chuyển tiếp slide
                    </div>
                    {transitionsList.map((item) => (
                      <DropdownMenuItem
                        key={item.value}
                        onClick={() => onChangeTransition(item.value)}
                        className={item.value === currentTransition ? 'font-semibold text-primary' : ''}
                      >
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    ))}

                    {onChangeTransitionDuration && currentTransition !== 'none' && (
                      <>
                        <DropdownMenuSeparator className="my-1.5" />
                        <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Tốc độ chuyển tiếp slide
                        </div>
                        {transitionSpeeds.map((spd) => {
                          const isSelected = currentTransitionDuration === spd.value;
                          return (
                            <DropdownMenuItem
                              key={spd.value}
                              onClick={() => onChangeTransitionDuration(spd.value)}
                              className={isSelected ? 'font-semibold text-primary' : ''}
                            >
                              <span>{spd.label}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </>
                    )}

                    <DropdownMenuSeparator className="my-1.5" />
                    <DropdownMenuItem
                      onClick={() => {
                        onChangeTransition(currentTransition || 'fade', true);
                        if (onChangeTransitionDuration) {
                          onChangeTransitionDuration(currentTransitionDuration, true);
                        }
                      }}
                    >
                      <span className="text-xs text-muted-foreground">{t('toolbar.applyToAll')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Find and Replace */}
              {onOpenFindReplace && (
                <ToolbarButton label="Tìm kiếm & Thay thế (Ctrl+H)" onClick={onOpenFindReplace}>
                  <Icon name="search" size={13} />
                </ToolbarButton>
              )}

              {/* Sample Templates Dropdown */}
              {onLoadSample && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal hover:bg-hover" />
                    }
                  >
                    <Icon name="file-text" size={13} />
                    <span>File Mẫu</span>
                    <Icon name="chevron-down" size={11} className="opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => onLoadSample('sample-basic.pptx')}>
                      1. Mẫu Cơ Bản (3 slide)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onLoadSample('sample-medium.pptx')}>
                      2. Mẫu Trung Bình (5 slide)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onLoadSample('sample-advanced.pptx')}>
                      3. Mẫu Nâng Cao (10 slide)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>

        {/* Right side controls: Zoom & Present */}
        <div className="flex items-center gap-1 shrink-0 pl-2">
          <div className="flex items-center rounded-md border border-border bg-background px-1 h-7">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(50, zoom - 10))}
              className="px-1 text-xs font-bold hover:text-primary transition-colors"
            >
              -
            </button>
            <span className="w-10 text-center text-xs font-semibold">{zoom}%</span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="px-1 text-xs font-bold hover:text-primary transition-colors"
            >
              +
            </button>
          </div>

          <Button
            size="sm"
            onClick={onPresent}
            className="h-7 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition-transform active:scale-95"
          >
            <Icon name="play" size={13} />
            <span>{t('toolbar.present')}</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
