import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import { mountPopup } from '@office/tiptap-extensions';

interface MentionPopoverProps {
  editor: Editor | null;
}

interface MentionState {
  userId: string;
  name: string;
  anchor: DOMRect;
}

export const MentionPopover = ({ editor }: MentionPopoverProps) => {
  const { t } = useTranslation('docs');
  const containerRef = useRef<HTMLDivElement>(null);
  const [mention, setMention] = useState<MentionState | null>(null);

  useEffect(() => {
    if (!editor) return;
    const storage = editor.storage.mention as
      | { onMentionClick: ((userId: string, name: string, anchor: DOMRect) => void) | null }
      | undefined;
    if (storage) {
      storage.onMentionClick = (userId, name, anchor) => {
        setMention({ userId, name, anchor });
      };
    }
  }, [editor]);

  useEffect(() => {
    if (!mention || !containerRef.current) return;
    const controller = mountPopup(containerRef.current, {
      placement: 'top-start',
      anchor: mention.anchor,
      offset: 8,
    });
    return () => controller.destroy();
  }, [mention]);

  const close = useCallback(() => setMention(null), []);

  useEffect(() => {
    if (!mention) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const handleOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) close();
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousedown', handleOutside);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('mousedown', handleOutside);
    };
  }, [mention, close]);

  if (!mention) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto z-50 flex min-w-[200px] items-center gap-2 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
      onMouseDown={(event) => event.preventDefault()}
    >
      <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {mention.name.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{mention.name}</div>
        <div className="truncate text-xs text-muted-foreground">{mention.userId}</div>
      </div>
      <Icon name="user" size={16} className="ml-auto shrink-0 text-muted-foreground" />
    </div>
  );
};