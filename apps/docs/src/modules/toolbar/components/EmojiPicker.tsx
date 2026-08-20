import 'emoji-picker-element';
import { useEffect, useRef, type ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@office/ui-kit';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'emoji-picker': EmojiPickerElementProps;
    }
  }
}

interface EmojiPickerElementProps {
  class?: string;
  ref?: React.LegacyRef<EmojiPickerElement>;
}

type EmojiPickerElement = HTMLElementTagNameMap['emoji-picker'];

interface EmojiClickDetail {
  unicode: string;
}

interface EmojiPickerProps {
  trigger: ReactNode;
  onSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ trigger, onSelect }: EmojiPickerProps) => {
  const pickerRef = useRef<EmojiPickerElement>(null);

  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;
    const handleEmojiClick = (event: Event) => {
      const detail = (event as CustomEvent<EmojiClickDetail>).detail;
      if (detail?.unicode) onSelect(detail.unicode);
    };
    picker.addEventListener('emoji-click', handleEmojiClick);
    return () => {
      picker.removeEventListener('emoji-click', handleEmojiClick);
    };
  }, [onSelect]);

  return (
    <Popover>
      <PopoverTrigger render={<button type="button" />}>{trigger}</PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-[320px] p-1.5" sideOffset={6}>
        <emoji-picker class="w-full h-[280px]" ref={pickerRef} />
      </PopoverContent>
    </Popover>
  );
};