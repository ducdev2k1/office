import { Plugin, PluginKey } from '@tiptap/pm/state';
import { type EditorView } from '@tiptap/pm/view';

export interface SuggestionItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface SuggestionRenderState {
  items: SuggestionItem[];
  query: string;
  rect: DOMRect | null;
  close: () => void;
}

export interface SuggestionOptions {
  char?: string;
  triggerChars?: string;
  minChars?: number;
  items: (query: string) => SuggestionItem[];
  onSelect: (item: SuggestionItem, query: string) => void;
  render: (state: SuggestionRenderState) => void;
}

export interface SuggestionState {
  active: boolean;
  query: string;
  range: { from: number; to: number } | null;
  rect: DOMRect | null;
}

export const suggestionPluginKey = new PluginKey<SuggestionState>('suggestion');

const textBefore = (view: EditorView, pos: number, char: string): string => {
  const { doc } = view.state;
  const start = Math.max(0, pos - 256);
  return doc.textBetween(start, pos, '\n', '\uFFFC');
};

export const SuggestionPlugin = ({
  char = '@',
  triggerChars = '@',
  minChars = 0,
  items,
  onSelect,
  render,
}: SuggestionOptions): Plugin<SuggestionState> =>
  new Plugin<SuggestionState>({
    key: suggestionPluginKey,

    props: {
      handleTextInput(view, from, to, text) {
        if (to - from !== 1 || !triggerChars.includes(text)) return false;
        const before = textBefore(view, from, text);
        const idx = before.lastIndexOf(text);
        if (idx === -1 || idx !== before.length - 1) return false;

        const state: SuggestionState = {
          active: true,
          query: '',
          range: { from: idx, to: from },
          rect: null,
        };
        render({ items: items(''), query: '', rect: null, close: () => {} });
        return false;
      },
    },

    state: {
      init: (): SuggestionState => ({ active: false, query: '', range: null, rect: null }),

      apply(tr, prev) {
        const meta = tr.getMeta(suggestionPluginKey);
        if (meta) return meta;

        if (!prev.active) return prev;

        const range = prev.range;
        if (!range) return { active: false, query: '', range: null, rect: null };

        const end = Math.min(range.to, tr.doc.content.size);
        const text = tr.doc.textBetween(range.from, end, '\n', '\uFFFC');

        if (!text.startsWith(char) || text.length > 64 || /\s/.test(text.slice(1))) {
          return { active: false, query: '', range: null, rect: null };
        }

        const query = text.slice(char.length);
        if (query.length < minChars) return prev;

        return { ...prev, query, range: { from: range.from, to: range.from + text.length } };
      },
    },
  });
