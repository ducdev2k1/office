import { useState, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { cn } from '../../cn';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { ToolbarButton } from './ToolbarButton';
import { Icon } from '../../icons';

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 64, 72, 96];
const MIN_SIZE = 1;
const MAX_SIZE = 400;

export interface FontSizePickerProps {
  currentSize: string | number;
  onChangeSize: (size: number) => void;
  decreaseLabel?: string;
  increaseLabel?: string;
  fontSizeLabel?: string;
}

export const FontSizePicker = ({
  currentSize,
  onChangeSize,
  decreaseLabel = 'Giảm cỡ chữ',
  increaseLabel = 'Tăng cỡ chữ',
  fontSizeLabel = 'Cỡ chữ',
}: FontSizePickerProps) => {
  const strSize = String(currentSize || '11');
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(strSize);
  const inputRef = useRef<HTMLInputElement>(null);

  const displaySize = open ? inputVal : strSize;
  const clamp = (n: number) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, n));

  const commit = useCallback(
    (raw: string) => {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= MIN_SIZE) {
        const next = clamp(n);
        onChangeSize(next);
        setInputVal(String(next));
      } else {
        setInputVal(strSize);
      }
    },
    [strSize, onChangeSize],
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
      setInputVal(strSize);
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cur = parseInt(inputVal, 10) || parseInt(strSize, 10) || 11;
      const next = clamp(cur + 1);
      setInputVal(String(next));
      onChangeSize(next);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = parseInt(inputVal, 10) || parseInt(strSize, 10) || 11;
      const next = clamp(cur - 1);
      setInputVal(String(next));
      onChangeSize(next);
    }
  };

  const handleInputBlur = () => {
    commit(inputVal);
  };

  const handleInputFocus = () => {
    setInputVal(strSize);
    inputRef.current?.select();
  };

  const handleSelectSize = (size: number) => {
    onChangeSize(size);
    setInputVal(String(size));
    setOpen(false);
  };

  const handleStep = (delta: number) => {
    const cur = parseInt(strSize, 10) || 11;
    const next = clamp(cur + delta);
    onChangeSize(next);
    setInputVal(String(next));
  };

  const currentNum = parseInt(strSize, 10);

  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton label={decreaseLabel} onClick={() => handleStep(-1)}>
        <Icon name="minus" size={14} />
      </ToolbarButton>

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
            aria-label={fontSizeLabel}
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
                        <Icon name="check" size={13} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <ToolbarButton label={increaseLabel} onClick={() => handleStep(1)}>
        <Icon name="plus" size={14} />
      </ToolbarButton>
    </div>
  );
};
