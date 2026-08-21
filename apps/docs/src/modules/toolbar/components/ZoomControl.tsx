import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@office/ui-kit';
import { useTranslation } from '@office/i18n';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';

interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const ZOOM_LEVELS = [0.5, 0.75, 0.9, 1, 1.25, 1.5, 2];

export const ZoomControl = ({ zoom, onZoomChange }: ZoomControlProps) => {
  const { t } = useTranslation('docs');

  const zoomOut = () => {
    const current = ZOOM_LEVELS.findIndex((level) => level >= zoom - 0.001);
    const index = current <= 0 ? 0 : current - 1;
    onZoomChange(ZOOM_LEVELS[index]!);
  };

  const zoomIn = () => {
    const current = ZOOM_LEVELS.findIndex((level) => level >= zoom + 0.001);
    const index = current === -1 ? ZOOM_LEVELS.length - 1 : current;
    onZoomChange(ZOOM_LEVELS[index]!);
  };

  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton label={t('toolbar.zoomOut')} onClick={zoomOut}>
        <Icon name="minus" />
      </ToolbarButton>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex h-7 items-center gap-1 rounded px-1.5 text-[12px] font-medium text-foreground/80 hover:text-foreground hover:bg-hover transition-colors cursor-pointer"
                    aria-label={t('toolbar.zoom')}
                  >
                    {Math.round(zoom * 100)}%
                    <Icon name="chevron-down" size={13} />
                  </button>
                }
              />
            }
          />
          <TooltipContent>{t('toolbar.zoom')}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center" side="bottom" className="min-w-28" sideOffset={6}>
          {ZOOM_LEVELS.map((level) => (
            <DropdownMenuItem
              key={level}
              onClick={() => onZoomChange(level)}
              className={level === zoom ? 'font-semibold text-primary' : ''}
            >
              {Math.round(level * 100)}%
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ToolbarButton label={t('toolbar.zoomIn')} onClick={zoomIn}>
        <Icon name="plus" />
      </ToolbarButton>
    </div>
  );
};