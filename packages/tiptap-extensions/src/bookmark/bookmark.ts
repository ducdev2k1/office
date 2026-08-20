import { Node, mergeAttributes } from '@tiptap/core';

export interface BookmarkOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bookmark: {
      setBookmark: (id?: string) => ReturnType;
    };
  }
}

export const Bookmark = Node.create<BookmarkOptions>({
  name: 'bookmark',
  group: 'inline',
  inline: true,
  selectable: true,
  draggable: false,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: () => `bm-${Math.random().toString(36).slice(2, 8)}`,
        parseHTML: (element) => element.getAttribute('id') || element.getAttribute('data-bookmark-id'),
        renderHTML: (attributes) => ({
          id: attributes.id,
          'data-bookmark-id': attributes.id,
        }),
      },
      name: {
        default: 'Bookmark',
        parseHTML: (element) => element.getAttribute('data-bookmark-name') || 'Bookmark',
        renderHTML: (attributes) => ({
          'data-bookmark-name': attributes.name,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-bookmark-id]',
      },
      {
        tag: 'a[name]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'bookmark-anchor inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs select-none font-mono cursor-pointer',
        title: `Dấu trang: #${node.attrs.id}`,
      }),
      '🔖',
      ['span', { class: 'text-[11px] opacity-80' }, node.attrs.name || node.attrs.id],
    ];
  },

  addCommands() {
    return {
      setBookmark:
        (name?: string) =>
        ({ chain }) => {
          const id = `bm-${Math.random().toString(36).slice(2, 8)}`;
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                id,
                name: name || `Dấu trang ${id.slice(-4)}`,
              },
            })
            .run();
        },
    };
  },
});
