import { useState, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { cn, Popover, PopoverContent, PopoverTrigger, ScrollArea } from '@office/ui-kit';

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 64, 72, 96];
const MIN_SIZE = 1;
const MAX_SIZE = 400;

/* ── Micro SVG icons ── */
const IconChevronUp = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const IconChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(currentSize);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync inputVal khi currentSize thay đổi từ editor (selection change)
  const displaySize = open ? inputVal : currentSize;

  const clamp = (n: number) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, n));

  const commit = useCallback(
    (raw: string) => {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= MIN_SIZE) {
        onChangeSize(clamp(n));
        setInputVal(String(clamp(n)));
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
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setInputVal(currentSize);
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

  const handleInputBlur = () => commit(inputVal);

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
    <div className="flex items-center">
      {/* Input có thể gõ trực tiếp */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <div
              className={cn(
                'relative flex items-center h-7 rounded border border-transparent',
                'hover:border-border hover:bg-hover transition-colors',
                open && 'border-border bg-hover',
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
            aria-label="Cỡ chữ"
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onClick={() => setOpen(true)}
            className={cn(
              'w-[36px] h-full bg-transparent text-center text-[13px] text-foreground',
              'outline-none cursor-text',
            )}
          />
          {/* Nút mũi tên tăng/giảm dọc */}
          <div className="flex flex-col mr-0.5">
            <button
              type="button"
              tabIndex={-1}
              aria-label="Tăng cỡ chữ"
              onMouseDown={(e) => { e.preventDefault(); handleStep(1); }}
              className="flex items-center justify-center h-3.5 w-3.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-sm transition-colors"
            >
              <IconChevronUp />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Giảm cỡ chữ"
              onMouseDown={(e) => { e.preventDefault(); handleStep(-1); }}
              className="flex items-center justify-center h-3.5 w-3.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-sm transition-colors"
            >
              <IconChevronDown />
            </button>
          </div>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={2}
          className="w-[80px] p-0 rounded-xl border border-border bg-popover shadow-xl overflow-hidden"
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
                      'w-full flex items-center justify-between px-3 py-[5px]',
                      'text-[13px] text-foreground hover:bg-hover transition-colors cursor-pointer',
                      isSelected && 'text-primary font-medium',
                    )}
                  >
                    <span>{size}</span>
                    {isSelected && (
                      <span className="text-primary">
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
    </div>
  );
};
