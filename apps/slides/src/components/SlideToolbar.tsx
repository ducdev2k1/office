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
}: SlideToolbarProps) => {
  const { t } = useTranslation('slides');

  return (
    <TooltipProvider>
      <div className="flex h-11 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-1.5">
          {/* Undo Button */}
          {onUndo && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="h-8 w-8 p-0"
                  />
                }
              >
                <Icon
                  name="undo"
                  size={14}
                  className={canUndo ? 'text-foreground' : 'text-muted-foreground'}
                />
              </TooltipTrigger>
              <TooltipContent>Hoàn tác (Ctrl+Z)</TooltipContent>
            </Tooltip>
          )}

          {/* Redo Button */}
          {onRedo && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="h-8 w-8 p-0"
                  />
                }
              >
                <Icon
                  name="redo"
                  size={14}
                  className={canRedo ? 'text-foreground' : 'text-muted-foreground'}
                />
              </TooltipTrigger>
              <TooltipContent>Làm lại (Ctrl+Y)</TooltipContent>
            </Tooltip>
          )}

          <div className="mx-1 h-4 w-px bg-border" />

          {/* Add Slide Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddSlide}
                  className="h-8 gap-1.5 px-2.5 text-xs font-medium"
                />
              }
            >
              <Icon name="plus" size={14} />
              <span>{t('toolbar.addSlide')}</span>
            </TooltipTrigger>
            <TooltipContent>{t('toolbar.addSlide')} (Ctrl+M)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDuplicateSlide}
                  className="h-8 w-8 p-0"
                />
              }
            >
              <Icon name="copy" size={14} className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>{t('toolbar.duplicateSlide')} (Ctrl+D)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeleteSlide}
                  disabled={!canDelete}
                  className="h-8 w-8 p-0"
                />
              }
            >
              <Icon
                name="trash-2"
                size={14}
                className={canDelete ? 'text-destructive' : 'text-muted-foreground'}
              />
            </TooltipTrigger>
            <TooltipContent>{t('toolbar.deleteSlide')} (Delete)</TooltipContent>
          </Tooltip>

          <div className="mx-2 h-4 w-px bg-border" />

          {/* Placeholders for shape, text, image tools */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
                />
              }
            >
              <Icon name="type" size={14} />
              <span>{t('toolbar.textBox')}</span>
            </TooltipTrigger>
            <TooltipContent>{t('toolbar.textBox')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
                />
              }
            >
              <Icon name="square" size={14} />
              <span>{t('toolbar.shapes')}</span>
            </TooltipTrigger>
            <TooltipContent>{t('toolbar.shapes')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
                />
              }
            >
              <Icon name="image" size={14} />
              <span>{t('toolbar.image')}</span>
            </TooltipTrigger>
            <TooltipContent>{t('toolbar.image')}</TooltipContent>
          </Tooltip>

          {/* Sample PPTX quick loader */}
          {onLoadSample && (
            <>
              <div className="mx-2 h-4 w-px bg-border" />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <Icon name="file-text" size={13} />
                  <span>File Mẫu Khảo Sát</span>
                  <Icon name="chevron-down" size={12} className="opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={6}>
                  <DropdownMenuItem onClick={() => onLoadSample('sample-basic.pptx')}>
                    <span className="font-medium">1. Mẫu Cơ Bản</span>
                    <span className="ml-2 text-xs text-muted-foreground">(3 slide, Text tiếng Việt)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLoadSample('sample-medium.pptx')}>
                    <span className="font-medium">2. Mẫu Trung Bình</span>
                    <span className="ml-2 text-xs text-muted-foreground">(5 slide, Shape & Bố cục)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLoadSample('sample-advanced.pptx')}>
                    <span className="font-medium">3. Mẫu Nâng Cao</span>
                    <span className="ml-2 text-xs text-muted-foreground">(10 slide, Hồ sơ năng lực)</span>
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
              className="px-1 hover:text-foreground"
            >
              -
            </button>
            <span className="w-10 text-center font-medium text-foreground">{zoom}%</span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="px-1 hover:text-foreground"
            >
              +
            </button>
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="default"
                  size="sm"
                  onClick={onPresent}
                  className="h-8 gap-1.5 bg-[var(--o-kind-slides)] px-3 text-xs text-white hover:opacity-90 shadow-sm"
                />
              }
            >
              <Icon name="play" size={13} />
              <span>{t('header.present')}</span>
            </TooltipTrigger>
            <TooltipContent>{t('header.present')} (F5 / Ctrl+Enter)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
