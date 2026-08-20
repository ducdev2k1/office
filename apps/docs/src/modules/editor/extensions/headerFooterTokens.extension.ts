import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const TOKEN_PATTERN = /\{([^}\n]+)\}/g;

export const TOKEN_NAMES = ['page', 'pages', 'title', 'date'] as const;
export type TokenName = (typeof TOKEN_NAMES)[number];

export interface HeaderFooterTokensOptions {
  className: string;
}

export const HeaderFooterTokens = Extension.create<HeaderFooterTokensOptions>({
  name: 'headerFooterTokens',

  addOptions() {
    return { className: 'hf-token' };
  },

  addProseMirrorPlugins() {
    const className = this.options.className;
    return [
      new Plugin({
        key: new PluginKey('headerFooterTokens'),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return false;
              const text = node.text;
              TOKEN_PATTERN.lastIndex = 0;
              let match: RegExpExecArray | null;
              while ((match = TOKEN_PATTERN.exec(text)) !== null) {
                const from = pos + match.index;
                const to = from + match[0].length;
                decorations.push(Decoration.inline(from, to, { class: className }));
              }
              return false;
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
