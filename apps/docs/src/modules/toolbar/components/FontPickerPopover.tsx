import { useState, useRef, useEffect, type KeyboardEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input, cn, Popover, PopoverContent, PopoverTrigger } from '@office/ui-kit';
import {
  FONT_CATEGORIES,
  type FontVariant,
  type FontCategory,
  getFontFamilyCSS,
} from '@office/fonts';
import { useTranslation } from '@office/i18n';
import { useFontPicker } from '@/modules/toolbar/hooks/useFontPicker';

/* ── Constants ── */
const FONT_VARIANTS: FontVariant[] = ['Normal', 'Medium', 'Semi Bold', 'Bold'];
export const FONT_VARIANT_WEIGHTS: Partial<Record<FontVariant, number>> = {
  Normal: 400,
  Medium: 500,
  'Semi Bold': 600,
  Bold: 700,
};
const CLOSE_DELAY = 100;

/* ── SVG Icons ── */
const IconCheck = () => (
  <svg
    width="13"
    height="13"
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
    width="13"
    height="13"
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

  useEffect(() => {
    const handleScroll = () => setSubOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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

  const cancelClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const fontStyle = getFontFamilyCSS(font);

  return (
    <>
      <div ref={rowRef} onMouseEnter={openSub} onMouseLeave={scheduleClose}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSelect(font)}
          className="w-full justify-between px-3 py-1.5 h-auto text-foreground"
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <span className={cn('text-primary shrink-0', !isSelected && 'opacity-0')}>
              <IconCheck />
            </span>
            <span className="truncate text-[13px] leading-snug" style={fontStyle}>
              {font}
            </span>
          </span>
          <span className="text-muted-foreground shrink-0 ml-2">
            <IconChevronRight />
          </span>
        </Button>
      </div>

      {subOpen &&
        createPortal(
          <div
            style={{ position: 'fixed', top: subPos.top, left: subPos.left, zIndex: 9999 }}
            className="w-[148px] py-1 rounded-lg border border-border bg-popover shadow-xl"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            {FONT_VARIANTS.map((variant) => (
              <Button
                key={variant}
                type="button"
                variant="ghost"
                onClick={() => onSelectVariant(font, variant)}
                className="w-full justify-start px-4 py-1.5 h-auto text-[13px] text-foreground"
                style={{
                  ...fontStyle,
                  fontWeight: FONT_VARIANT_WEIGHTS[variant],
                }}
              >
                {variant}
              </Button>
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
  onSelectVariant?: (font: string, variant: FontVariant) => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}

export const FontPickerPopover = ({
  currentFont,
  onSelectFont,
  onSelectVariant,
  triggerRef,
}: FontPickerPopoverProps) => {
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

  const handleVariantSelect = (font: string, variant: FontVariant) => {
    if (onSelectVariant) {
      onSelectVariant(font, variant);
      handleOpenChange(false);
      return;
    }
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

  const triggerStyle = getFontFamilyCSS(displayName);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            id="font-picker-trigger"
            ref={triggerRef}
            type="button"
            variant="ghost"
            aria-label={`Font: ${displayName}`}
            className={cn(
              'gap-1 h-7 px-2',
              'text-[13px] text-foreground',
              'min-w-[100px] max-w-[155px]',
              open && 'bg-hover border-border',
            )}
          />
        }
      >
        <span className="truncate flex-1 text-left" style={triggerStyle}>
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
        className="w-[290px] p-0 rounded-xl border border-border bg-popover shadow-xl overflow-hidden"
      >
        {/* Search */}
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-1.5 h-7 px-2 rounded-md bg-muted/60 border border-border/50 focus-within:border-primary/50 focus-within:bg-background transition-colors">
            <span className="text-muted-foreground shrink-0">
              <IconSearch />
            </span>
            <Input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm font..."
              className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setSearch('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <IconX />
              </Button>
            )}
          </div>
        </div>

        {/* List – cuộn mượt mà max-h 420px */}
        <div className="max-h-[420px] overflow-y-auto overscroll-contain py-1">
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
      </PopoverContent>
    </Popover>
  );
};
