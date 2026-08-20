import { useState, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { cn, Popover, PopoverContent, PopoverTrigger, ScrollArea } from '@office/ui-kit';
import { useTranslation } from '@office/i18n';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 64, 72, 96];
const MIN_SIZE = 1;
const MAX_SIZE = 400;

/* ── Micro SVG icons ── */
const IconMinus = () => (
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
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconPlus = () => (
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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

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

/* ── Types ── */
interface FontSizePickerProps {
  currentSize: string;
  onChangeSize: (size: number) => void;
}

/* ── Component ── */
export const FontSizePicker = ({ currentSize, onChangeSize }: FontSizePickerProps) => {
  const { t } = useTranslation('docs');
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(currentSize);
  const inputRef = useRef<HTMLInputElement>(null);

  const displaySize = open ? inputVal : currentSize;
  const clamp = (n: number) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, n));

  const commit = useCallback(
    (raw: string) => {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= MIN_SIZE) {
        const next = clamp(n);
        onChangeSize(next);
        setInputVal(String(next));
      } else {
        setInputVal(currentSize);
      }
    },
    [currentSize, onChangeSize],
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit(inputVal);
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setInputVal(currentSize);
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cur = parseInt(inputVal, 10) || parseInt(currentSize, 10) || 12;
      const next = clamp(cur + 1);
      setInputVal(String(next));
      onChangeSize(next);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = parseInt(inputVal, 10) || parseInt(currentSize, 10) || 12;
      const next = clamp(cur - 1);
      setInputVal(String(next));
      onChangeSize(next);
    }
  };

  const handleInputBlur = () => {
    commit(inputVal);
  };

  const handleInputFocus = () => {
    setInputVal(currentSize);
    inputRef.current?.select();
  };

  const handleSelectSize = (size: number) => {
    onChangeSize(size);
    setInputVal(String(size));
    setOpen(false);
  };

  const handleStep = (delta: number) => {
    const cur = parseInt(currentSize, 10) || 12;
    const next = clamp(cur + delta);
    onChangeSize(next);
    setInputVal(String(next));
  };

  const currentNum = parseInt(currentSize, 10);

  return (
    <div className="flex items-center gap-0.5">
      {/* Nút giảm cỡ chữ (-) ở bên trái */}
      <ToolbarButton label={t('toolbar.decreaseFontSize')} onClick={() => handleStep(-1)}>
        <IconMinus />
      </ToolbarButton>

      {/* Ô nhập cỡ chữ ở giữa + Dropdown Popover các cỡ preset */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          nativeButton={false}
          render={
            <div
              className={cn(
                'flex items-center justify-center h-7 w-9 rounded border border-border bg-background',
                'hover:bg-hover hover:border-border/80 transition-colors cursor-text',
                open && 'border-ring ring-1 ring-ring bg-background',
              )}
            />
          }
        >
          <input
            ref={inputRef}
            id="font-size-input"
            type="text"
            inputMode="numeric"
            value={displaySize}
            aria-label={t('toolbar.fontSize')}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onClick={() => setOpen(true)}
            className={cn(
              'w-full h-full bg-transparent text-center text-[12px] font-normal text-foreground',
              'outline-none cursor-text select-all',
            )}
          />
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="center"
          sideOffset={2}
          className="w-[72px] p-0 rounded-lg border border-border bg-popover shadow-xl overflow-hidden"
        >
          <ScrollArea className="max-h-[260px]">
            <div className="py-1">
              {FONT_SIZES.map((size) => {
                const isSelected = size === currentNum;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSelectSize(size)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-[5px]',
                      'text-[13px] text-foreground hover:bg-hover transition-colors cursor-pointer text-left',
                      isSelected && 'text-primary font-semibold bg-primary/10',
                    )}
                  >
                    <span>{size}</span>
                    {isSelected && (
                      <span className="text-primary shrink-0">
                        <IconCheck />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Nút tăng cỡ chữ (+) ở bên phải */}
      <ToolbarButton label={t('toolbar.increaseFontSize')} onClick={() => handleStep(1)}>
        <IconPlus />
      </ToolbarButton>
    </div>
  );
};
