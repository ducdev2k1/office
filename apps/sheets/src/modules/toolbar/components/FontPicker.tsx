import { FONT_CATEGORIES, getFontFamilyCSS, type FontCategory } from '@office/fonts';
import { useTranslation } from '@office/i18n';
import {
  Button,
  Icon,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  cn,
} from '@office/ui-kit';
import { useMemo, useState, type KeyboardEvent } from 'react';

const ALL_FONTS = FONT_CATEGORIES.flatMap((c) => c.fonts);

interface FontPickerProps {
  currentFont: string;
  onSelectFont: (font: string) => void;
}

interface FontOptionProps {
  font: string;
  isSelected: boolean;
  onSelect: (font: string) => void;
}

/** Một dòng font trong danh sách, dùng cho cả kết quả tìm kiếm và danh sách theo nhóm */
const FontOption = ({ font, isSelected, onSelect }: FontOptionProps) => (
  <Button
    variant="ghost"
    size="sm"
    aria-pressed={isSelected}
    onClick={() => onSelect(font)}
    className="h-auto w-full justify-between rounded-none px-3 py-1.5 text-[13px] font-normal text-foreground"
  >
    <span className="truncate" style={getFontFamilyCSS(font)}>
      {font}
    </span>
    {isSelected && <Icon name="check" size={14} className="shrink-0 text-primary" />}
  </Button>
);

export const FontPicker = ({ currentFont, onSelectFont }: FontPickerProps) => {
  const { t } = useTranslation('sheets');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={t('toolbar.font.ariaLabel', { font: displayName })}
            className={cn(
              'h-7 min-w-[105px] max-w-[155px] justify-between gap-1 rounded border border-transparent px-2 text-[13px] font-normal text-foreground hover:border-border hover:bg-hover',
              open && 'border-border bg-hover',
            )}
          />
        }
      >
        <span className="flex-1 truncate text-left" style={getFontFamilyCSS(displayName)}>
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
            <Icon name="search" size={13} className="shrink-0 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('toolbar.font.search')}
              className="h-full flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-[12px] shadow-none focus-visible:ring-0"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={t('toolbar.font.clearSearch')}
                onClick={() => setSearch('')}
                className="size-4 shrink-0 rounded-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                <Icon name="x" size={12} />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[360px] py-1">
          {filteredFonts ? (
            filteredFonts.length > 0 ? (
              filteredFonts.map((font) => (
                <FontOption
                  key={font}
                  font={font}
                  isSelected={font === currentFont}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                {t('toolbar.font.notFound')}
              </div>
            )
          ) : (
            FONT_CATEGORIES.map((cat: FontCategory) => (
              <div key={cat.id}>
                <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {cat.labelKey}
                </div>
                {cat.fonts.map((font) => (
                  <FontOption
                    key={font}
                    font={font}
                    isSelected={font === currentFont}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
