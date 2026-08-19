import { FONT_CATEGORIES, getFontFamilyCSS, type FontCategory } from '@office/fonts';
import { cn, Icon, Popover, PopoverContent, PopoverTrigger } from '@office/ui-kit';
import { useMemo, useRef, useState, type KeyboardEvent } from 'react';

const ALL_FONTS = FONT_CATEGORIES.flatMap((c) => c.fonts);

interface FontPickerProps {
  currentFont: string;
  onSelectFont: (font: string) => void;
}

export const FontPicker = ({ currentFont, onSelectFont }: FontPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const displayName = currentFont || 'Arial';

  const filteredFonts = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return ALL_FONTS.filter((f) => f.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = (font: string) => {
    onSelectFont(font);
    setOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') setOpen(false);
  };

  const triggerStyle = getFontFamilyCSS(displayName);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Font chữ: ${displayName}`}
            className={cn(
              'flex h-7 min-w-[105px] max-w-[155px] items-center justify-between gap-1 rounded border border-transparent px-2 text-[13px] text-foreground transition-colors hover:border-border hover:bg-hover',
              open && 'border-border bg-hover',
            )}
          />
        }
      >
        <span className="truncate flex-1 text-left" style={triggerStyle}>
          {displayName}
        </span>
        <Icon
          name="chevron-down"
          size={14}
          className={cn('text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={2}
        className="w-[280px] overflow-hidden rounded-xl border border-border bg-popover p-0 shadow-xl"
      >
        <div className="border-b border-border p-2">
          <div className="flex h-7 items-center gap-1.5 rounded-md border border-border/60 bg-muted/50 px-2">
            <Icon name="search" size={13} className="text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm font chữ..."
              className="flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="x" size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto overscroll-contain py-1">
          {filteredFonts ? (
            filteredFonts.length > 0 ? (
              filteredFonts.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => handleSelect(font)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] text-foreground hover:bg-hover"
                >
                  <span style={getFontFamilyCSS(font)}>{font}</span>
                  {font === currentFont && (
                    <Icon name="check" size={14} className="text-primary shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">Không tìm thấy font</div>
            )
          ) : (
            FONT_CATEGORIES.map((cat: FontCategory) => (
              <div key={cat.id}>
                <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat.labelKey}
                </div>
                {cat.fonts.map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => handleSelect(font)}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] text-foreground hover:bg-hover"
                  >
                    <span style={getFontFamilyCSS(font)}>{font}</span>
                    {font === currentFont && (
                      <Icon name="check" size={14} className="text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
