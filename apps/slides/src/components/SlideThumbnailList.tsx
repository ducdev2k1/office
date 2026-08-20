import type { SlideItem } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
      <aside className="flex w-56 flex-col border-r border-border bg-card/60">
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
            <TooltipContent>{t('header.addSlide')} (Ctrl+M)</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={slide.id}
                onClick={() => onSelect(index)}
                className="group relative flex cursor-pointer items-center gap-2"
              >
                <span className="w-4 text-right text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>

                <div
                  className={`relative aspect-[16/9] w-full overflow-hidden rounded-md border bg-white p-2 text-[6px] shadow-xs transition-all dark:bg-slate-900 ${
                    isActive
                      ? 'border-[var(--o-kind-slides)] ring-2 ring-[var(--o-kind-slides)]/30'
                      : 'border-border hover:border-foreground/40'
                  }`}
                  style={{ backgroundColor: slide.background || undefined }}
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
                      {el.content || (el.type === 'shape' ? '■' : 'Văn bản')}
                    </div>
                  ))}
                  {slide.elements.length === 0 && (
                    <div className="flex h-full items-center justify-center text-[7px] text-muted-foreground/60">
                      Trống
                    </div>
                  )}

                  {/* 3-dot Action Menu */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDuplicateSlide?.(index)}>
                          <Icon name="copy" size={13} className="mr-2" />
                          <span>Nhân bản slide</span>
                        </DropdownMenuItem>
                        {index > 0 && onMoveSlide && (
                          <DropdownMenuItem onClick={() => onMoveSlide(index, index - 1)}>
                            <Icon name="arrow-up" size={13} className="mr-2" />
                            <span>Di chuyển lên</span>
                          </DropdownMenuItem>
                        )}
                        {index < slides.length - 1 && onMoveSlide && (
                          <DropdownMenuItem onClick={() => onMoveSlide(index, index + 1)}>
                            <Icon name="arrow-down" size={13} className="mr-2" />
                            <span>Di chuyển xuống</span>
                          </DropdownMenuItem>
                        )}
                        {slides.length > 1 && onDeleteSlide && (
                          <DropdownMenuItem
                            onClick={() => onDeleteSlide(index)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Icon name="trash-2" size={13} className="mr-2" />
                            <span>Xoá slide</span>
                          </DropdownMenuItem>
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
            className="w-full gap-1.5 border-dashed py-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <Icon name="plus" size={13} />
            <span>Thêm trang chiếu</span>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
};
