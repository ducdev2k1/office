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

interface SlideThumbnailListProps {
  slides: SlideItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAddSlide: () => void;
  onDuplicateSlide?: (index: number) => void;
  onDeleteSlide?: (index: number) => void;
  onMoveSlide?: (fromIndex: number, toIndex: number) => void;
}

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
                  className={`relative aspect-[16/9] w-full overflow-hidden rounded-md border bg-white p-2 text-[6px] shadow-xs transition-all duration-200 ease-out hover:scale-[1.02] dark:bg-slate-900 ${
                    isActive
                      ? 'border-[var(--o-kind-slides)] ring-2 ring-[var(--o-kind-slides)]/30 shadow-md'
                      : 'border-border hover:border-foreground/40 hover:shadow-xs'
                  }`}
                  style={{
                    backgroundColor: slide.background || undefined,
                    background: slide.backgroundGradient || slide.backgroundImage || slide.background || undefined,
                  }}
                >
                  {slide.elements.slice(0, 4).map((el) => (
                    <div
                      key={el.id}
                      className="truncate text-foreground/80"
                      style={{
                        fontSize: el.fontSize ? Math.max(5, Math.round(el.fontSize * 0.16)) : 6,
                        textAlign: el.align || 'left',
                        color: el.color || undefined,
                      }}
                    >
                      {el.content || (el.type === 'shape' ? '■' : '')}
                    </div>
                  ))}
                  {slide.elements.length === 0 && (
                    <div className="flex h-full items-center justify-center text-[7px] text-muted-foreground/60">
                      {t('editor.noSlides')}
                    </div>
                  )}

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
                            className="h-5 w-5 rounded-xs p-0 shadow-xs"
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
