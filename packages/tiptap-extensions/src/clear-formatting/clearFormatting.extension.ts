import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearFormatting: {
      clearFormatting: () => ReturnType;
    };
    setParagraph: {
      setParagraph: () => ReturnType;
    };
  }
}

export const ClearFormatting = Extension.create({
  name: 'clearFormatting',

  addCommands() {
    return {
      clearFormatting:
        () =>
        ({ chain }) =>
          chain()
            .command(({ tr, state }) => {
              const { schema, selection, doc } = state;
              const paragraphType = schema.nodes.paragraph;
              const { from, to } = selection;
              if (paragraphType) {
                tr.setBlockType(from, to, paragraphType);
              }
              tr.storedMarks = [];
              const textStyleMark = schema.marks.textStyle;
              if (textStyleMark) {
                doc.nodesBetween(from, to, (node, pos) => {
                  if (node.isText && node.text && node.marks.some((mark) => mark.type.name === 'textStyle')) {
                    tr.removeMark(pos, pos + node.text.length, textStyleMark);
                  }
                });
              }
              return true;
            })
            .unsetAllMarks()
            .run(),
    };
  },
});