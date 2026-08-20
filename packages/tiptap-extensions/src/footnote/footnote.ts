import { Node, mergeAttributes } from '@tiptap/core';

export interface FootnoteOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnote: {
      setFootnote: (options: { content: string }) => ReturnType;
    };
  }
}

export const Footnote = Node.create<FootnoteOptions>({
  name: 'footnote',
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
        default: () => `fn-${Math.random().toString(36).slice(2, 8)}`,
        parseHTML: (element) => element.getAttribute('data-footnote-id'),
        renderHTML: (attributes) => ({
          'data-footnote-id': attributes.id,
        }),
      },
      content: {
        default: 'Chú thích...',
        parseHTML: (element) => element.getAttribute('data-footnote-content') || 'Chú thích...',
        renderHTML: (attributes) => ({
          'data-footnote-content': attributes.content,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'sup[data-type="footnote"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'sup',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'footnote',
        'data-footnote-id': node.attrs.id,
        'data-footnote-content': node.attrs.content,
        class:
          'footnote-ref inline-flex items-center justify-center font-semibold text-primary cursor-pointer px-1 py-0.5 rounded hover:bg-primary/20 transition-colors select-none text-[11px]',
        title: `Chú thích: ${node.attrs.content}`,
      }),
      ['span', { class: 'footnote-marker' }, '¹'],
    ];
  },

  addCommands() {
    return {
      setFootnote:
        (options) =>
        ({ chain }) => {
          const id = `fn-${Math.random().toString(36).slice(2, 8)}`;
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                id,
                content: options.content || 'Nội dung chú thích...',
              },
            })
            .run();
        },
    };
  },
});
