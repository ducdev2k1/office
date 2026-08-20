import { Node, mergeAttributes } from '@tiptap/core';

export interface ColumnsOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columns: {
      setColumns: (options?: { cols?: number }) => ReturnType;
    };
  }
}

export const Columns = Node.create<ColumnsOptions>({
  name: 'columns',
  group: 'block',
  content: 'column+',
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      cols: {
        default: 2,
        parseHTML: (element) => parseInt(element.getAttribute('data-cols') || '2', 10),
        renderHTML: (attributes) => ({
          'data-cols': attributes.cols,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const cols = node.attrs.cols || 2;
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'columns',
        'data-cols': cols,
        class: `columns-container my-4 grid gap-4 grid-cols-${cols}`,
        style: `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 1rem;`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setColumns:
        (options = {}) =>
        ({ chain }) => {
          const cols = options.cols ?? 2;
          const columnNodes = Array.from({ length: cols }, () => ({
            type: 'column',
            content: [{ type: 'paragraph' }],
          }));

          return chain()
            .insertContent({
              type: this.name,
              attrs: { cols },
              content: columnNodes,
            })
            .run();
        },
    };
  },
});
