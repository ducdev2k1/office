import { useState, useRef, type RefObject } from 'react';
import { useTranslation } from '@office/i18n';
import {
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Button,
  cn,
} from '@office/ui-kit';

const GOOGLE_PALETTE_ROWS: string[][] = [
  [
    '#000000',
    '#434343',
    '#666666',
    '#999999',
    '#b7b7b7',
    '#cccccc',
    '#d9d9d9',
    '#efefef',
    '#f3f3f3',
    '#ffffff',
  ],
  [
    '#980000',
    '#ff0000',
    '#ff9900',
    '#ffff00',
    '#00ff00',
    '#00ffff',
    '#4a86e8',
    '#0000ff',
    '#9900ff',
    '#ff00ff',
  ],
  [
    '#e6b8af',
    '#f4cccc',
    '#fce5cd',
    '#fff2cc',
    '#d9ead3',
    '#d0e0e3',
    '#c9daf8',
    '#cfe2f3',
    '#d9d2e9',
    '#ead1dc',
  ],
  [
    '#dd7e6b',
    '#ea9999',
    '#f9cb9c',
    '#ffe599',
    '#b6d7a8',
    '#a2c4c9',
    '#a4c2f4',
    '#9fc5e8',
    '#b4a7d6',
    '#d5a6bd',
  ],
  [
    '#cc4125',
    '#e06666',
    '#f6b26b',
    '#ffd966',
    '#93c47d',
    '#76a5af',
    '#6d9eeb',
    '#6fa8dc',
    '#8e7cc3',
    '#c27ba0',
  ],
  [
    '#a61c00',
    '#cc0000',
    '#e69138',
    '#f1c232',
    '#6aa84f',
    '#45818e',
    '#3c78d8',
    '#3d85c6',
    '#674ea7',
    '#a64d79',
  ],
  [
    '#85200c',
    '#990000',
    '#b45f06',
    '#bf9000',
    '#38761d',
    '#134f5c',
    '#1155cc',
    '#0b5394',
    '#351c75',
    '#741b47',
  ],
  [
    '#5b0f00',
    '#660000',
    '#783f04',
    '#7f6000',
    '#274e13',
    '#0c343d',
    '#1c4587',
    '#073763',
    '#20124d',
    '#4c1130',
  ],
];

interface ColorPalettePopoverProps {
  iconName: string;
  label: string;
  currentColor?: string;
  active?: boolean;
  triggerRef?: RefObject<HTMLButtonElement | null>;
  onSelectColor: (color: string) => void;
  onResetColor?: () => void;
}

export const ColorPalettePopover = ({
  iconName,
  label,
  currentColor,
  active = false,
  triggerRef,
  onSelectColor,
  onResetColor,
}: ColorPalettePopoverProps) => {
  const { t } = useTranslation('docs');
  const [open, setOpen] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('docs_custom_colors');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const customInputRef = useRef<HTMLInputElement>(null);

  const handlePickColor = (color: string) => {
    onSelectColor(color);
    setOpen(false);
  };

  const handleCustomColorChange = (color: string) => {
    if (!color) return;
    onSelectColor(color);
    setCustomColors((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== color.toLowerCase());
      const next = [color, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('docs_custom_colors', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setOpen(false);
  };

  const isSelected = (color: string) =>
    currentColor && currentColor.toLowerCase() === color.toLowerCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  ref={triggerRef}
                  aria-label={label}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'relative inline-flex flex-col items-center justify-center h-7 min-w-7 px-1.5 rounded text-foreground/80 hover:text-foreground hover:bg-hover transition-colors',
                    (active || open) && 'bg-primary/15 text-primary',
                  )}
                />
              }
            >
              <Icon name={iconName} size={15} />
              <span
                className="absolute bottom-1 left-1.5 right-1.5 h-0.75 rounded-full"
                style={{
                  backgroundColor:
                    currentColor || (iconName === 'baseline' ? '#000000' : '#fef000'),
                }}
              />
            </PopoverTrigger>
          }
        >
          {null}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="w-56 p-3 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
      >
        <div className="grid grid-cols-10 gap-1">
          {GOOGLE_PALETTE_ROWS.map((row, rIdx) =>
            row.map((color) => {
              const checked = isSelected(color);
              const isLight =
                color === '#ffffff' ||
                color === '#f3f3f3' ||
                color === '#efefef' ||
                color === '#fff2cc' ||
                color === '#d9ead3';

              return (
                <button
                  key={`${rIdx}-${color}`}
                  type="button"
                  aria-label={color}
                  onClick={() => handlePickColor(color)}
                  className={cn(
                    'size-4.5 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-125 focus:outline-none',
                    checked && 'ring-2 ring-primary ring-offset-1',
                    isLight && 'border border-border/80',
                  )}
                  style={{ backgroundColor: color }}
                >
                  {checked && (
                    <span
                      className={cn('size-1.5 rounded-full', isLight ? 'bg-black' : 'bg-white')}
                    />
                  )}
                </button>
              );
            }),
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-border">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {t('toolbar.custom')}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label={t('toolbar.customColor')}
                    onClick={() => customInputRef.current?.click()}
                    className="size-5 rounded-full border border-dashed border-border hover:border-foreground/60 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors bg-muted/30"
                  >
                    <Icon name="plus" size={12} />
                  </button>
                }
              />
              <TooltipContent side="top">{t('toolbar.customColor')}</TooltipContent>
            </Tooltip>
            <input
              ref={customInputRef}
              type="color"
              className="sr-only"
              value={currentColor || '#000000'}
              onChange={(e) => handleCustomColorChange(e.target.value)}
            />

            {customColors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                onClick={() => handlePickColor(color)}
                className="size-4.5 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-125 focus:outline-none"
                style={{ backgroundColor: color }}
              >
                {isSelected(color) && <span className="size-1.5 rounded-full bg-white shadow-xs" />}
              </button>
            ))}
          </div>
        </div>

        {onResetColor && (
          <div className="mt-2 pt-2 border-t border-border flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                onResetColor();
                setOpen(false);
              }}
            >
              {t('toolbar.defaultFont')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
