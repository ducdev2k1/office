import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { cn, Popover, PopoverContent, PopoverTrigger, ScrollArea } from '@office/ui-kit';
import { FONT_CATEGORIES, type FontVariant, type FontCategory } from '@office/fonts';
import { useTranslation } from '@office/i18n';
import { useFontPicker } from '@/modules/toolbar/hooks/useFontPicker';

/* ── Constants ── */
const FONT_VARIANTS: FontVariant[] = ['Normal', 'Medium', 'Semi Bold', 'Bold'];
const VARIANT_WEIGHT: Record<string, number> = {
  Normal: 400,
  Medium: 500,
  'Semi Bold': 600,
  Bold: 700,
};
const CLOSE_DELAY = 80;

/* ── SVG Icons ── */
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconChevronDown = ({ open }: { open?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* ── FontRow – tự quản lý submenu qua portal để tránh bị clip ── */
interface FontRowProps {
  font: string;
  isSelected: boolean;
  onSelect: (font: string) => void;
  onSelectVariant: (font: string, variant: FontVariant) => void;
}

const FontRow = ({ font, isSelected, onSelect, onSelectVariant }: FontRowProps) => {
  const [subOpen, setSubOpen] = useState(false);
  const [subPos, setSubPos] = useState({ top: 0, left: 0 });
  const rowRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const openSub = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      setSubPos({ top: rect.top, left: rect.right + 2 });
    }
    setSubOpen(true);
  };

  const scheduleClose = () => {
    timerRef.current = setTimeout(() => setSubOpen(false), CLOSE_DELAY);
  };

  const cancelClose = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  return (
    <>
      <div ref={rowRef} onMouseEnter={openSub} onMouseLeave={scheduleClose}>
        <button
          type="button"
          onClick={() => onSelect(font)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-[5px]',
            'text-[13px] text-foreground hover:bg-hover transition-colors cursor-pointer',
          )}
        >
          <span className="flex items-center gap-1.5 min-w-0">
            {/* checkmark luôn chiếm space, chỉ ẩn opacity */}
            <span className={cn('text-primary shrink-0', !isSelected && 'opacity-0')}>
              <IconCheck />
            </span>
            <span className="truncate" style={{ fontFamily: font }}>{font}</span>
          </span>
          {/* chevron luôn hiển thị để cho thấy có submenu */}
          <span className="text-muted-foreground shrink-0 ml-2">
            <IconChevronRight />
          </span>
        </button>
      </div>

      {subOpen && createPortal(
        <div
          style={{ position: 'fixed', top: subPos.top, left: subPos.left, zIndex: 9999 }}
          className="w-[148px] py-1 rounded-lg border border-border bg-popover shadow-xl"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {FONT_VARIANTS.map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => onSelectVariant(font, variant)}
              className="w-full px-4 py-[5px] text-left text-[13px] text-foreground hover:bg-hover transition-colors cursor-pointer"
              style={{ fontFamily: font, fontWeight: VARIANT_WEIGHT[variant] }}
            >
              {variant}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
};

/* ── FontPickerPopover ── */
interface FontPickerPopoverProps {
  currentFont: string;
  onSelectFont: (font: string) => void;
}

export const FontPickerPopover = ({ currentFont, onSelectFont }: FontPickerPopoverProps) => {
  const { t } = useTranslation('docs');
  const {
    open,
    search,
    recentFonts,
    filteredFonts,
    setSearch,
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
            <span className="text-muted-foreground shrink-0"><IconSearch /></span>
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
              <button type="button" onClick={() => setSearch('')}
                className="text-muted-foreground hover:text-foreground transition-colors">
                <IconX />
              </button>
            )}
          </div>
        </div>

        {/* List – chiều cao tăng lên 480px */}
        <ScrollArea className="max-h-[480px]">
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
                {/* Thêm font khác */}
                <button type="button"
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-primary hover:bg-hover transition-colors">
                  <span className="shrink-0"><IconPlus /></span>
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

                {/* Categories với i18n label */}
                {FONT_CATEGORIES.map((cat: FontCategory) => (
                  <div key={cat.id}>
                    <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(`toolbar.${cat.labelKey}`)}
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
