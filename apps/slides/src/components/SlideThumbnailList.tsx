import type { SlideItem } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  ToolbarButton,
  TooltipProvider,
} from '@office/ui-kit';
import { LineSvgRenderer, ShapeSvgRenderer } from './canvas/ShapeSvgRenderer';

interface SlideThumbnailListProps {
  slides: SlideItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAddSlide: () => void;
  onDuplicateSlide?: (index: number) => void;
  onDeleteSlide?: (index: number) => void;
  onMoveSlide?: (fromIndex: number, toIndex: number) => void;
}

const SlideMiniaturePreview = ({ slide }: { slide: SlideItem }) => {
  return (
    <div
      className="pointer-events-none relative aspect-[16/9] w-full overflow-hidden select-none"
      style={{
        backgroundColor: slide.background || '#ffffff',
        background: slide.backgroundGradient || slide.backgroundImage || slide.background || '#ffffff',
      }}
    >
      {slide.elements.map((el) => {
        const leftPercent = (el.x / 960) * 100;
        const topPercent = (el.y / 540) * 100;
        const widthPercent = (el.width / 960) * 100;
        const heightPercent = (el.height / 540) * 100;
        const rot = el.rotation ? `rotate(${el.rotation}deg)` : '';
        const flip = `${el.flipH ? 'scaleX(-1)' : ''} ${el.flipV ? 'scaleY(-1)' : ''}`.trim();
        const transform = `${rot} ${flip}`.trim() || undefined;

        if (el.type === 'shape') {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                transform,
              }}
            >
              <ShapeSvgRenderer element={el} />
            </div>
          );
        }

        if (el.type === 'line') {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                transform,
              }}
            >
              <LineSvgRenderer element={el} />
            </div>
          );
        }

        if (el.type === 'table' && el.tableData) {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                transform,
              }}
              className="overflow-hidden rounded-[1px] border border-border/80"
            >
              <div
                className="grid h-full w-full"
                style={{ gridTemplateColumns: `repeat(${el.tableData.cols || 2}, 1fr)` }}
              >
                {el.tableData.cells.flatMap((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="border-[0.5px] border-border/60 truncate p-[0.5px] text-[3.5px] leading-none"
                      style={{
                        backgroundColor:
                          el.tableData?.cellFills?.[rIdx]?.[cIdx] ||
                          (rIdx === 0 && el.tableData?.headerRow ? 'rgba(0,0,0,0.06)' : undefined),
                      }}
                    >
                      {cell}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        }

        if (el.type === 'image') {
          return (
            <img
              key={el.id}
              src={el.url}
              alt=""
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                transform,
                borderRadius: el.borderRadius ? `${el.borderRadius * 0.15}px` : undefined,
              }}
              className="object-contain"
            />
          );
        }

        // Text element
        const miniFontSize = el.fontSize ? Math.max(3.5, Math.round(el.fontSize * 0.18)) : 4.5;
        return (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              width: `${widthPercent}%`,
              height: `${heightPercent}%`,
              transform,
              color: el.color || '#0f172a',
              backgroundColor: el.fill || undefined,
              border: el.stroke ? `0.5px solid ${el.stroke}` : undefined,
              borderRadius: el.fill ? '2px' : undefined,
              textAlign: el.align || 'left',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textDecoration: el.textDecoration || 'none',
              fontSize: `${miniFontSize}px`,
              lineHeight: 1.15,
            }}
            className="overflow-hidden p-[1px] whitespace-pre-wrap break-words"
          >
            {el.content}
          </div>
        );
      })}
    </div>
  );
};

export const SlideThumbnailList = ({
  slides,
  activeIndex,
  onSelect,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
}: SlideThumbnailListProps) => {
  const { t } = useTranslation('slides');

  return (
    <TooltipProvider>
      <aside className="flex w-56 flex-col border-r border-border bg-card/60 select-none">
        <div className="flex items-center justify-between border-b border-border p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>{t('thumbnails.countHeader', { count: slides.length })}</span>
          <ToolbarButton
            label={t('thumbnails.addSlide')}
            onClick={onAddSlide}
            className="h-6 w-6 p-0 transition-transform active:scale-95"
          >
            <Icon name="plus" size={14} />
          </ToolbarButton>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={slide.id}
                onClick={() => onSelect(index)}
                className="group relative flex cursor-pointer items-center gap-2 transition-transform active:scale-[0.98]"
              >
                <span className="w-4 text-right text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>

                <div
                  className={`relative aspect-[16/9] w-full overflow-hidden rounded-md border shadow-xs transition-all duration-200 ease-out hover:scale-[1.02] ${
                    isActive
                      ? 'border-[var(--o-kind-slides)] ring-2 ring-[var(--o-kind-slides)]/30 shadow-md'
                      : 'border-border hover:border-foreground/40 hover:shadow-xs'
                  }`}
                >
                  <SlideMiniaturePreview slide={slide} />

                  {/* 3-dot Action Menu */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-1 top-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-5 w-5 rounded-xs p-0 shadow-xs backdrop-blur-xs bg-background/80 hover:bg-background"
                          />
                        }
                      >
                        <Icon name="more-horizontal" size={12} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="animate-in fade-in zoom-in-95 duration-100">
                        <DropdownMenuItem onClick={() => onDuplicateSlide?.(index)}>
                          <Icon name="copy" size={13} className="mr-2" />
                          <span>{t('toolbar.duplicateSlide')}</span>
                        </DropdownMenuItem>
                        {index > 0 && onMoveSlide && (
                          <DropdownMenuItem onClick={() => onMoveSlide(index, index - 1)}>
                            <Icon name="arrow-up" size={13} className="mr-2" />
                            <span>{t('formatting.bringForward')}</span>
                          </DropdownMenuItem>
                        )}
                        {index < slides.length - 1 && onMoveSlide && (
                          <DropdownMenuItem onClick={() => onMoveSlide(index, index + 1)}>
                            <Icon name="arrow-down" size={13} className="mr-2" />
                            <span>{t('formatting.sendBackward')}</span>
                          </DropdownMenuItem>
                        )}
                        {slides.length > 1 && onDeleteSlide && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteSlide(index)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Icon name="trash-2" size={13} className="mr-2" />
                              <span>{t('toolbar.deleteSlide')}</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={onAddSlide}
            className="w-full gap-1.5 border-dashed py-3 text-xs text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95"
          >
            <Icon name="plus" size={13} />
            <span>{t('thumbnails.addSlideBottom')}</span>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
};
