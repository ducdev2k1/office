import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

export interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  category: 'text' | 'lists' | 'media' | 'callouts' | 'advanced';
  icon: string;
  badge?: string;
  command: (params: { editor: any; range: { from: number; to: number } }) => void;
}

export interface SlashCommandStorage {
  onOpen: ((params: { query: string; anchor: DOMRect }) => void) | null;
  onClose: (() => void) | null;
  onSelect: ((item: SlashCommandItem) => void) | null;
}

declare module '@tiptap/core' {
  interface Storage {
    slashCommand: SlashCommandStorage;
  }
}

export const slashPluginKey = new PluginKey('slashCommandPlugin');

const textBefore = (view: EditorView, pos: number): string => {
  const { doc } = view.state;
  const start = Math.max(0, pos - 128);
  return doc.textBetween(start, pos, '\n', '\uFFFC');
};

export const SlashCommand = Extension.create<Record<string, never>, SlashCommandStorage>({
  name: 'slashCommand',

  addStorage(): SlashCommandStorage {
    return {
      onOpen: null,
      onClose: null,
      onSelect: null,
    };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;

    return [
      new Plugin({
        key: slashPluginKey,
        props: {
          handleKeyDown(view, event) {
            if (event.key === 'Escape') {
              storage.onClose?.();
            }
            return false;
          },

          handleTextInput(view, from, to, text) {
            if (text === '/') {
              const before = textBefore(view, from);
              // Only trigger if at start of block or preceded by whitespace
              if (before === '' || /\s$/.test(before)) {
                setTimeout(() => {
                  const { selection } = view.state;
                  const coords = view.coordsAtPos(selection.from);
                  const anchor = new DOMRect(coords.left, coords.bottom + 4, 0, Math.max(16, coords.bottom - coords.top));
                  storage.onOpen?.({ query: '', anchor });
                }, 10);
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
