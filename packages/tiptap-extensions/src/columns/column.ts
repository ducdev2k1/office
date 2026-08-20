import { Node, mergeAttributes } from '@tiptap/core';

export const Column = Node.create({
  name: 'column',
  content: 'block+',
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'column',
        class: 'column-box flex-1 min-w-0 p-2 border border-dashed border-border/60 rounded-md',
      }),
      0,
    ];
  },
});
