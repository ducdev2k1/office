import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Tooltip, TooltipContent, TooltipTrigger } from '@office/ui-kit';

interface WordCountFloatingBadgeProps {
  editor: Editor | null;
  visible: boolean;
  onClick?: () => void;
}

export const WordCountFloatingBadge = ({
  editor,
  visible,
  onClick,
}: WordCountFloatingBadgeProps) => {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (!editor || !visible) return;

    const updateCount = () => {
      const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, ' ', ' ');
      const trimmed = text.trim();
      const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    };

    updateCount();
    editor.on('update', updateCount);
    return () => {
      editor.off('update', updateCount);
    };
  }, [editor, visible]);

  if (!visible) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            className="fixed bottom-10 right-6 z-40 flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground/90 shadow-md backdrop-blur-xs transition-all hover:bg-hover hover:scale-105 cursor-pointer"
            aria-label="Thống kê số từ"
          >
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{wordCount.toLocaleString()} từ</span>
          </button>
        }
      />
      <TooltipContent side="top">Bấm để xem thống kê chi tiết</TooltipContent>
    </Tooltip>
  );
};

