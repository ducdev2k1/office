import { useTranslation } from '@office/i18n';
import {
  Button,
  ColorPalettePopover,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  ToolbarButton,
  cn,
} from '@office/ui-kit';
import { BorderStyleTypes, BorderType } from '@univerjs/presets';

export interface CellFormatToolsProps {
  isMerged: boolean;
  borderColor: string;
  borderStyle: BorderStyleTypes;
  borderType?: BorderType;
  onToggleMerge: () => void;
  onMergeAll: () => void;
  onMergeHorizontal: () => void;
  onMergeVertical: () => void;
  onUnmerge: () => void;
  onSetBorderColor: (color: string) => void;
  onSetBorderStyle: (style: BorderStyleTypes) => void;
  onApplyBorder: (type: BorderType, style?: BorderStyleTypes, color?: string) => void;
}

const BORDER_TYPES: Array<{
  type: BorderType;
  labelKey: string;
  icon: string;
}> = [
  { type: BorderType.ALL, labelKey: 'toolbar.border.types.all', icon: 'grid' },
  { type: BorderType.INSIDE, labelKey: 'toolbar.border.types.inside', icon: 'table' },
  { type: BorderType.HORIZONTAL, labelKey: 'toolbar.border.types.horizontal', icon: 'minus' },
  { type: BorderType.VERTICAL, labelKey: 'toolbar.border.types.vertical', icon: 'pause' },
  { type: BorderType.OUTSIDE, labelKey: 'toolbar.border.types.outside', icon: 'square' },
  { type: BorderType.LEFT, labelKey: 'toolbar.border.types.left', icon: 'panel-left' },
  { type: BorderType.TOP, labelKey: 'toolbar.border.types.top', icon: 'panel-top' },
  { type: BorderType.RIGHT, labelKey: 'toolbar.border.types.right', icon: 'panel-right' },
  { type: BorderType.BOTTOM, labelKey: 'toolbar.border.types.bottom', icon: 'panel-bottom' },
  { type: BorderType.NONE, labelKey: 'toolbar.border.types.none', icon: 'x' },
];

interface BorderStyleOption {
  style: BorderStyleTypes;
  labelKey: string;
  borderClass: string;
}

/** Kiểu nét mặc định, cũng là giá trị dự phòng khi ô dùng kiểu nét ngoài danh sách */
const DEFAULT_BORDER_STYLE: BorderStyleOption = {
  style: BorderStyleTypes.THIN,
  labelKey: 'toolbar.border.styles.thin',
  borderClass: 'border-t',
};

const BORDER_STYLES: BorderStyleOption[] = [
  DEFAULT_BORDER_STYLE,
  {
    style: BorderStyleTypes.MEDIUM,
    labelKey: 'toolbar.border.styles.medium',
    borderClass: 'border-t-2',
  },
  {
    style: BorderStyleTypes.THICK,
    labelKey: 'toolbar.border.styles.thick',
    borderClass: 'border-t-4',
  },
  {
    style: BorderStyleTypes.DASHED,
    labelKey: 'toolbar.border.styles.dashed',
    borderClass: 'border-t border-dashed',
  },
  {
    style: BorderStyleTypes.DOTTED,
    labelKey: 'toolbar.border.styles.dotted',
    borderClass: 'border-t border-dotted',
  },
  {
    style: BorderStyleTypes.DOUBLE,
    labelKey: 'toolbar.border.styles.double',
    borderClass: 'border-t-4 border-double',
  },
];

export const CellFormatTools = ({
  isMerged,
  borderColor,
  borderStyle,
  borderType,
  onToggleMerge,
  onMergeAll,
  onMergeHorizontal,
  onMergeVertical,
  onUnmerge,
  onSetBorderColor,
  onSetBorderStyle,
  onApplyBorder,
}: CellFormatToolsProps) => {
  const { t } = useTranslation('sheets');
  const currentStyle = BORDER_STYLES.find((s) => s.style === borderStyle) ?? DEFAULT_BORDER_STYLE;

  const handleSelectBorderType = (type: BorderType) => {
    onApplyBorder(type, borderStyle, borderColor);
  };

  return (
    <div className="flex items-center gap-0.5">
      {/* Borders Popover */}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('toolbar.border.ariaLabel')}
              className="flex h-7 w-7 items-center justify-center rounded p-0 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon name="grid" size={16} />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[200px] p-2 text-xs">
          <div className="mb-2 text-[11px] font-medium text-muted-foreground">
            {t('toolbar.border.sectionTitle')}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {BORDER_TYPES.map((b) => (
              <ToolbarButton
                key={b.type}
                label={t(b.labelKey)}
                active={borderType === b.type && b.type !== BorderType.NONE}
                onClick={() => handleSelectBorderType(b.type)}
                className="h-7 w-7"
              >
                <Icon name={b.icon} size={15} />
              </ToolbarButton>
            ))}
          </div>

          <Separator className="my-2" />

          {/* Border color & line style controls */}
          <div className="flex items-center justify-between gap-1 text-xs">
            <span className="text-[11px] text-muted-foreground">
              {t('toolbar.border.colorLabel')}
            </span>
            <ColorPalettePopover
              iconName="brush"
              currentColor={borderColor}
              onSelectColor={onSetBorderColor}
              label={t('toolbar.border.colorPick')}
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-1 text-xs">
            <span className="text-[11px] text-muted-foreground">
              {t('toolbar.border.styleLabel')}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={t('toolbar.border.stylePick')}
                    className="flex h-6 w-24 items-center justify-between px-1.5 text-[11px]"
                  />
                }
              >
                <span
                  className={cn('w-14 shrink-0', currentStyle.borderClass)}
                  style={{ borderTopColor: borderColor }}
                />
                <Icon name="chevron-down" size={10} className="opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 text-xs">
                {BORDER_STYLES.map((bs) => (
                  <DropdownMenuItem
                    key={bs.style}
                    onClick={() => onSetBorderStyle(bs.style)}
                    className={cn(
                      'flex items-center justify-between py-1 px-2 text-xs cursor-pointer',
                      borderStyle === bs.style && 'bg-accent font-medium',
                    )}
                  >
                    <span className="text-[11px]">{t(bs.labelKey)}</span>
                    <span
                      className={cn('w-10 shrink-0', bs.borderClass)}
                      style={{ borderTopColor: borderColor }}
                    />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PopoverContent>
      </Popover>

      {/* Merge Cells with Dropdown */}
      <div className="flex items-center">
        <ToolbarButton
          label={isMerged ? t('toolbar.merge.unmerge') : t('toolbar.merge.merge')}
          active={isMerged}
          onClick={onToggleMerge}
        >
          <Icon name="columns" size={16} />
        </ToolbarButton>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                aria-label={t('toolbar.merge.optionsAriaLabel')}
                className="flex h-7 w-4 items-center justify-center p-0 text-foreground hover:bg-accent/70"
              />
            }
          >
            <Icon name="chevron-down" size={10} className="opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[150px] text-xs">
            <DropdownMenuItem onClick={onMergeAll} className="py-1 text-xs">
              {t('toolbar.merge.all')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMergeHorizontal} className="py-1 text-xs">
              {t('toolbar.merge.horizontal')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMergeVertical} className="py-1 text-xs">
              {t('toolbar.merge.vertical')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onUnmerge} className="py-1 text-xs text-destructive">
              {t('toolbar.merge.unmerge')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
