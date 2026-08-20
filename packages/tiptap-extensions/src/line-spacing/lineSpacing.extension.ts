import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineSpacing: {
      setLineSpacing: (lineHeight: string) => ReturnType;
      unsetLineSpacing: () => ReturnType;
    };
    paragraphSpacing: {
      setParagraphSpacing: (attrs: { before?: string; after?: string }) => ReturnType;
      unsetParagraphSpacing: () => ReturnType;
    };
  }
}

export interface LineSpacingOptions {
  types: string[];
}

export const LineSpacing = Extension.create<LineSpacingOptions>({
  name: 'lineSpacing',

  addOptions() {
    return { types: ['textStyle'] as string[] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.lineHeight ? { style: `line-height: ${attributes.lineHeight}` } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineSpacing:
        (lineHeight: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { lineHeight }).run(),
      unsetLineSpacing:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { lineHeight: null }).run(),
    };
  },
});

export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',

  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          spacingBefore: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.marginTop || null,
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.spacingBefore ? { style: `margin-top: ${attributes.spacingBefore}` } : {},
          },
          spacingAfter: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.marginBottom || null,
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.spacingAfter ? { style: `margin-bottom: ${attributes.spacingAfter}` } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphSpacing:
        (attrs: { before?: string; after?: string }) =>
        ({ chain }) =>
          chain()
            .command(({ tr }) => {
              const { from, to } = tr.selection;
              tr.doc.nodesBetween(from, to, (node, pos) => {
                if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                  const next: Record<string, unknown> = {};
                  if (attrs.before !== undefined) next.spacingBefore = attrs.before;
                  if (attrs.after !== undefined) next.spacingAfter = attrs.after;
                  tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...next });
                }
              });
              return true;
            })
            .run(),
      unsetParagraphSpacing:
        () =>
        ({ chain }) =>
          chain()
            .command(({ tr }) => {
              const { from, to } = tr.selection;
              tr.doc.nodesBetween(from, to, (node, pos) => {
                if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                  const next: Record<string, unknown> = {};
                  if (node.attrs.spacingBefore) next.spacingBefore = null;
                  if (node.attrs.spacingAfter) next.spacingAfter = null;
                  tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...next });
                }
              });
              return true;
            })
            .run(),
    };
  },
});