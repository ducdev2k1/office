import { Node, mergeAttributes } from '@tiptap/core';
import katex from 'katex';

export interface MathOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      setMathInline: (options: { tex: string }) => ReturnType;
      setMathBlock: (options: { tex: string }) => ReturnType;
    };
  }
}

export const MathInline = Node.create<MathOptions>({
  name: 'mathInline',
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
      tex: {
        default: 'E = mc^2',
        parseHTML: (element) => element.getAttribute('data-tex') || 'E = mc^2',
        renderHTML: (attributes) => ({
          'data-tex': attributes.tex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-inline"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const tex = node.attrs.tex || 'E = mc^2';
    let rendered = tex;
    try {
      rendered = katex.renderToString(tex, { throwOnError: false, displayMode: false });
    } catch {
      rendered = `<span class="katex-error">${tex}</span>`;
    }

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'math-inline',
        'data-tex': tex,
        class: 'math-node math-inline inline-block px-1 py-0.5 rounded hover:bg-muted/60 transition-colors cursor-pointer select-all font-serif',
      }),
      ['span', { innerHTML: rendered }],
    ];
  },

  addCommands() {
    return {
      setMathInline:
        (options) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                tex: options.tex,
              },
            })
            .run();
        },
    };
  },
});

export const MathBlock = Node.create<MathOptions>({
  name: 'mathBlock',
  group: 'block',
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
      tex: {
        default: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
        parseHTML: (element) =>
          element.getAttribute('data-tex') || '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
        renderHTML: (attributes) => ({
          'data-tex': attributes.tex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const tex = node.attrs.tex || '';
    let rendered = tex;
    try {
      rendered = katex.renderToString(tex, { throwOnError: false, displayMode: true });
    } catch {
      rendered = `<div class="katex-error">${tex}</div>`;
    }

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'math-block',
        'data-tex': tex,
        class: 'math-node math-block my-4 p-3 bg-muted/20 border border-border rounded-lg text-center overflow-x-auto hover:bg-muted/40 transition-colors cursor-pointer select-all font-serif',
      }),
      ['div', { innerHTML: rendered }],
    ];
  },

  addCommands() {
    return {
      setMathBlock:
        (options) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                tex: options.tex,
              },
            })
            .run();
        },
    };
  },
});
