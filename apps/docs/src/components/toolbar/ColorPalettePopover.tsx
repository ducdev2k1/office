import { useState, useRef } from 'react';
import {
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Button,
} from '@office/ui-kit';
import { cn } from '@office/ui-kit';

// Google Docs / Gmail Standard Color Palette (10 columns x 8 rows)
const GOOGLE_PALETTE_ROWS: string[][] = [
  // Neutrals / Grayscale
  ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff'],
  // Primary saturated hues
  ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'],
  // Row 1 - Lightest pastels
  ['#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
  // Row 2 - Light tints
  ['#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
  // Row 3 - Medium tints
  ['#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0'],
  // Row 4 - Deep tints
  ['#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79'],
  // Row 5 - Dark shades
  ['#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47'],
  // Row 6 - Darkest shades
  ['#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'],
];

interface ColorPalettePopoverProps {
  iconName: string;
  label: string;
  currentColor?: string;
  active?: boolean;
  onSelectColor: (color: string) => void;
  onResetColor?: () => void;
}

export const ColorPalettePopover = ({
  iconName,
  label,
  currentColor,
  active = false,
  onSelectColor,
  onResetColor,
}: ColorPalettePopoverProps) => {
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
                  aria-label={label}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 min-w-7 px-1.5 flex flex-col items-center justify-center gap-0.5 relative',
                    (active || open) && 'bg-accent text-accent-foreground',
                  )}
                />
              }
            >
              <Icon name={iconName} size={15} />
              <span
                className="w-4 h-1 rounded-xs shrink-0"
                style={{
                  backgroundColor: currentColor || (iconName === 'baseline' ? '#000000' : '#fef000'),
                }}
              />
            </PopoverTrigger>
          }
        >
          {null}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>

      <PopoverContent side="bottom" align="start" sideOffset={4} className="w-auto p-3 shadow-2xl">
        {/* Color Palette Grid */}
        <div className="flex flex-col gap-1">
          {GOOGLE_PALETTE_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1">
              {row.map((color) => {
                const checked = isSelected(color);
                const isLight =
                  color === '#ffffff' ||
                  color === '#f3f3f3' ||
                  color === '#efefef' ||
                  color === '#fff2cc' ||
                  color === '#d9ead3';

                return (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    aria-label={color}
                    onClick={() => handlePickColor(color)}
                    className={cn(
                      'relative size-5 rounded-full cursor-pointer transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center',
                      isLight && 'border border-border/80',
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {checked && (
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          isLight ? 'bg-black' : 'bg-white',
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Custom Section */}
        <div className="mt-3 pt-2.5 border-t border-border">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            CUSTOM
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              title="Custom color"
              aria-label="Custom color"
              onClick={() => customInputRef.current?.click()}
              className="size-5 rounded-full border border-dashed border-border hover:border-foreground/60 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors bg-muted/30"
            >
              <Icon name="plus" size={12} />
            </button>
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
                title={color}
                aria-label={color}
                onClick={() => handlePickColor(color)}
                className="size-5 rounded-full cursor-pointer transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center border border-border/60"
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
              Mặc định
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
