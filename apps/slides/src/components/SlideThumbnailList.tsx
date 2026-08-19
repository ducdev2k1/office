import type { SlideItem } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import { Button, Icon, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@office/ui-kit';

interface SlideThumbnailListProps {
  slides: SlideItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAddSlide: () => void;
}

export const SlideThumbnailList = ({
  slides,
  activeIndex,
  onSelect,
  onAddSlide,
}: SlideThumbnailListProps) => {
  const { t } = useTranslation('slides');

  return (
    <TooltipProvider>
      <aside className="flex w-52 flex-col border-r border-border bg-card/60">

        <div className="flex items-center justify-between border-b border-border p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>{t('slidesCount', { count: slides.length })}</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddSlide}
                  className="h-6 w-6 p-0"
                />
              }
            >
              <Icon name="plus" size={14} />
            </TooltipTrigger>
            <TooltipContent>{t('header.addSlide')}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={slide.id}
                onClick={() => onSelect(index)}
                className="group flex cursor-pointer items-center gap-2"
              >
                <span className="w-4 text-right text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>

                <div
                  className={`relative aspect-[16/9] w-full overflow-hidden rounded-md border bg-white p-2 text-[6px] shadow-sm transition-all dark:bg-slate-900 ${
                    isActive
                      ? 'border-[var(--o-kind-slides)] ring-2 ring-[var(--o-kind-slides)]/30'
                      : 'border-border hover:border-foreground/40'
                  }`}
                  style={{ backgroundColor: slide.background || undefined }}
                >
                  {slide.elements.slice(0, 3).map((el) => (
                    <div
                      key={el.id}
                      className="truncate text-foreground/80"
                      style={{
                        fontSize: el.fontSize ? Math.max(5, Math.round(el.fontSize * 0.18)) : 6,
                        textAlign: el.align || 'left',
                        color: el.color || undefined,
                      }}
                    >
                      {el.content || 'Văn bản'}
                    </div>
                  ))}
                  {slide.elements.length === 0 && (
                    <div className="flex h-full items-center justify-center text-[7px] text-muted-foreground/60">
                      Trống
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </TooltipProvider>
  );
};
