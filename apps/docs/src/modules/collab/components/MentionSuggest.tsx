import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { cn, Icon } from '@office/ui-kit';
import { mountPopup, type SuggestionItem } from '@office/tiptap-extensions';

interface MentionSuggestProps {
  editor: Editor | null;
  users: () => { id: string; name: string }[];
  getMentionedIds: () => string[];
}

interface SuggestState {
  items: SuggestionItem[];
  index: number;
  anchor: DOMRect;
}

const getStorage = (editor: Editor | null) => editor?.storage.mentionSuggestion ?? null;

export const MentionSuggest = ({ editor, users, getMentionedIds }: MentionSuggestProps) => {
  const { t } = useTranslation('docs');
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SuggestState | null>(null);
  const stateRef = useRef<SuggestState | null>(null);
  stateRef.current = state;

  useEffect(() => {
    if (!editor) return;
    const storage = getStorage(editor);
    if (!storage) return;

    let query = '';

    const computeItems = (): SuggestionItem[] => {
      const all = users();
      const mentioned = new Set(getMentionedIds());
      const q = query.toLowerCase();
      return all
        .filter((user) => !mentioned.has(user.id))
        .filter((user) => !q || user.name.toLowerCase().includes(q) || user.id.toLowerCase().includes(q))
        .slice(0, 8)
        .map((user) => ({ id: user.id, label: user.name, description: user.id }));
    };

    const anchorAtCursor = (): DOMRect => {
      const { from } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);
      return new DOMRect(coords.left, coords.top + 4, 0, 0);
    };

    const syncQuery = () => {
      const { state: pmState } = editor;
      const textBefore = pmState.doc.textBetween(
        Math.max(0, pmState.selection.from - 256),
        pmState.selection.from,
        '\n',
        '\uFFFC',
      );
      const idx = textBefore.lastIndexOf('@');
      if (idx === -1) return false;
      const after = textBefore.slice(idx + 1);
      if (after.length > 64 || /\s/.test(after)) {
        query = '';
        return false;
      }
      query = after;
      return true;
    };

    storage.onOpen = () => {
      syncQuery();
      setState({ items: computeItems(), index: 0, anchor: anchorAtCursor() });
    };
    storage.onClose = () => setState(null);
    storage.onSelect = (item) => {
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, editor.state.selection.from - 256),
        editor.state.selection.from,
        '\n',
        '\uFFFC',
      );
      const idx = textBefore.lastIndexOf('@');
      if (idx === -1) return;
      const from = editor.state.selection.from - (textBefore.length - idx);
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: editor.state.selection.from })
        .insertContent({ type: 'mention', attrs: { id: item.id, name: item.label } })
        .run();
      setState(null);
    };

    const handleSelectionUpdate = () => {
      if (!stateRef.current) return;
      const found = syncQuery();
      if (!found) {
        setState(null);
        return;
      }
      setState((prev) =>
        prev ? { ...prev, items: computeItems(), index: 0, anchor: anchorAtCursor() } : prev,
      );
    };
    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleSelectionUpdate);
      storage.onOpen = null;
      storage.onClose = null;
      storage.onSelect = null;
    };
  }, [editor, users, getMentionedIds]);

  useEffect(() => {
    if (!state || !containerRef.current) return;
    const controller = mountPopup(containerRef.current, {
      placement: 'bottom-start',
      anchor: state.anchor,
      offset: 4,
    });
    return () => controller.destroy();
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setState((prev) =>
          prev ? { ...prev, index: (prev.index + 1) % prev.items.length } : prev,
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setState((prev) =>
          prev
            ? { ...prev, index: (prev.index - 1 + prev.items.length) % prev.items.length }
            : prev,
        );
      } else if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        if (state.items[state.index]) {
          getStorage(editor)?.onSelect?.(state.items[state.index]!);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setState(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state, editor]);

  if (!state) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto z-50 w-60 rounded-lg border border-border bg-popover p-1 shadow-lg"
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
        {t('mention.selectUser')}
      </div>
      {state.items.length === 0 ? (
        <div className="px-2 py-2 text-xs text-muted-foreground">{t('mention.noUsers')}</div>
      ) : (
        <ul className="max-h-56 overflow-y-auto">
          {state.items.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                  index === state.index ? 'bg-accent text-accent-foreground' : 'hover:bg-hover',
                )}
                onMouseEnter={() => setState((prev) => (prev ? { ...prev, index } : prev))}
                onClick={() => {
                  getStorage(editor)?.onSelect?.(item);
                }}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  {item.label.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <Icon name="user" size={13} className="shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};