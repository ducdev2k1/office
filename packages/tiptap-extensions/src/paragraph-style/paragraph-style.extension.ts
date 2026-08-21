import { Extension } from '@tiptap/core';

export type ParagraphBorderType = 'none' | 'top' | 'bottom' | 'left' | 'right' | 'box';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphStyle: {
      setParagraphBorder: (attrs: { border: ParagraphBorderType; color?: string }) => ReturnType;
      setParagraphShading: (color: string | null) => ReturnType;
      resetParagraphStyle: () => ReturnType;
    };
  }
}

export const ParagraphStyle = Extension.create({
  name: 'paragraphStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          border: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-border') || null,
            renderHTML: (attributes) => (attributes.border ? { 'data-border': attributes.border } : {}),
          },
          borderColor: {
            default: '#94a3b8',
            parseHTML: (element) => element.getAttribute('data-border-color') || '#94a3b8',
            renderHTML: (attributes) =>
              attributes.borderColor && attributes.border ? { 'data-border-color': attributes.borderColor } : {},
          },
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-bg-color') || element.style.backgroundColor || null,
            renderHTML: (attributes) => (attributes.backgroundColor ? { 'data-bg-color': attributes.backgroundColor } : {}),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphBorder:
        ({ border, color = '#94a3b8' }) =>
        ({ commands }) =>
          commands.updateAttributes('paragraph', { border: border === 'none' ? null : border, borderColor: color }),
      setParagraphShading:
        (color) =>
        ({ commands }) =>
          commands.updateAttributes('paragraph', { backgroundColor: color }),
      resetParagraphStyle:
        () =>
        ({ commands }) =>
          commands.updateAttributes('paragraph', { border: null, borderColor: null, backgroundColor: null }),
    };
  },
});
