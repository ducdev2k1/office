import { useRef, type KeyboardEvent } from 'react';
import { cn, Popover, PopoverContent, PopoverTrigger, ScrollArea } from '@office/ui-kit';
import { FONT_CATEGORIES, type FontVariant, type FontCategory } from '@office/fonts';
import { useFontPicker } from '@/modules/toolbar/hooks/useFontPicker';
import { FontVariantSubmenu } from '@/modules/toolbar/components/FontVariantSubmenu';

/* ───────────── Micro SVG icons ───────────── */

const IconCheck = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconChevronDown = ({ open }: { open?: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconChevronRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconSearch = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconX = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconPlus = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* ───────────── Types ───────────── */

interface FontPickerPopoverProps {
  currentFont: string;
  onSelectFont: (font: string) => void;
}

interface FontRowProps {
  font: string;
  isSelected: boolean;
  isHovered: boolean;
  onMouseEnter: (font: string) => void;
  onMouseLeave: () => void;
  onSelect: (font: string) => void;
  onSelectVariant: (font: string, variant: FontVariant) => void;
}

/* ───────────── FontRow ───────────── */

const FontRow = ({
  font,
  isSelected,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onSelect,
  onSelectVariant,
}: FontRowProps) => (
  <div className="relative" onMouseEnter={() => onMouseEnter(font)} onMouseLeave={onMouseLeave}>
    <button
      type="button"
      onClick={() => onSelect(font)}
      className={cn(
        'w-full flex items-center justify-between px-3 py-[5px] text-[13px] text-foreground',
        'hover:bg-hover transition-colors cursor-pointer group',
        isHovered && 'bg-hover',
      )}
    >
      <span className="flex items-center gap-1.5 min-w-0">
        <span className={cn('text-primary shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}>
          <IconCheck />
        </span>
        <span className="truncate" style={{ fontFamily: font }}>
          {font}
        </span>
      </span>
      <span className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <IconChevronRight />
      </span>
    </button>

    {isHovered && <FontVariantSubmenu font={font} onSelect={onSelectVariant} />}
  </div>
);

/* ───────────── FontPickerPopover ───────────── */

export const FontPickerPopover = ({ currentFont, onSelectFont }: FontPickerPopoverProps) => {
  const {
    open,
    search,
    recentFonts,
    hoveredFont,
    filteredFonts,
    setSearch,
    setHoveredFont,
    handleSelectFont,
    handleOpenChange,
  } = useFontPicker(currentFont);

  const searchRef = useRef<HTMLInputElement>(null);
  const displayName = currentFont || 'Arial';

  const handleVariantSelect = (font: string, _variant: FontVariant) => {
    handleSelectFont(font, onSelectFont);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') handleOpenChange(false);
  };

  const renderFontRow = (font: string) => (
    <FontRow
      key={font}
      font={font}
      isSelected={font === currentFont}
      isHovered={hoveredFont === font}
      onMouseEnter={setHoveredFont}
      onMouseLeave={() => setHoveredFont(null)}
      onSelect={(f) => handleSelectFont(f, onSelectFont)}
      onSelectVariant={handleVariantSelect}
    />
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            id="font-picker-trigger"
            type="button"
            aria-label={`Font: ${displayName}`}
            className={cn(
              'flex items-center gap-1 h-7 px-2 rounded border border-transparent',
              'text-[13px] text-foreground bg-transparent hover:bg-hover hover:border-border',
              'transition-colors cursor-pointer min-w-[100px] max-w-[148px]',
              open && 'bg-hover border-border',
            )}
          />
        }
      >
        <span className="truncate flex-1 text-left" style={{ fontFamily: displayName }}>
          {displayName}
        </span>
        <span className="shrink-0 text-muted-foreground">
          <IconChevronDown open={open} />
        </span>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={2}
        className="w-[280px] p-0 rounded-xl border border-border bg-popover shadow-xl overflow-hidden"
      >
        {/* Search */}
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-1.5 h-7 px-2 rounded-md bg-muted/60 border border-border/50 focus-within:border-primary/50 focus-within:bg-background transition-colors">
            <span className="text-muted-foreground shrink-0">
              <IconSearch />
            </span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm font..."
              className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconX />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[340px]">
          <div className="py-1">
            {filteredFonts ? (
              filteredFonts.length > 0 ? (
                <>
                  <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Kết quả
                  </div>
                  {filteredFonts.map(renderFontRow)}
                </>
              ) : (
                <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">
                  Không tìm thấy font
                </div>
              )
            ) : (
              <>
                {/* More Fonts */}
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-primary hover:bg-hover transition-colors"
                >
                  <span className="shrink-0">
                    <IconPlus />
                  </span>
                  <span>Thêm font khác</span>
                </button>

                <div className="mx-3 my-1 h-px bg-border/60" />

                {/* Recent */}
                {recentFonts.length > 0 && (
                  <>
                    <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Gần đây
                    </div>
                    {recentFonts.map(renderFontRow)}
                    <div className="mx-3 my-1 h-px bg-border/60" />
                  </>
                )}

                {/* Categories */}
                {FONT_CATEGORIES.map((cat: FontCategory) => (
                  <div key={cat.id}>
                    <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {cat.labelKey}
                    </div>
                    {cat.fonts.map(renderFontRow)}
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
