import { Node } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,

  parseHTML: () => [{ tag: 'div[data-type=page-break]' }],

  renderHTML: () => ['div', { 'data-type': 'page-break' }],

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ chain, state }) => {
          const { selection } = state;
          const isAtEndOfBlock = selection.$to.parentOffset === selection.$to.parent.content.size;
          const isLastBlock = selection.$to.after() === state.doc.content.size;

          if (isAtEndOfBlock || isLastBlock) {
            return chain()
              .insertContent({ type: this.name })
              .createParagraphNear()
              .focus()
              .run();
          }

          return chain()
            .insertContent({ type: this.name })
            .focus()
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.setPageBreak(),
      'Ctrl-Enter': () => this.editor.commands.setPageBreak(),
    };
  },
});
