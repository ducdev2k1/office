import { Node, mergeAttributes } from '@tiptap/core';

export interface SectionBreakOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sectionBreak: {
      setSectionBreak: (options?: { type?: 'next-page' | 'continuous' }) => ReturnType;
    };
  }
}

export const SectionBreak = Node.create<SectionBreakOptions>({
  name: 'sectionBreak',
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
      type: {
        default: 'next-page',
        parseHTML: (element) => element.getAttribute('data-section-type') || 'next-page',
        renderHTML: (attributes) => ({
          'data-section-type': attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="section-break"]',
      },
      {
        tag: 'hr[data-section-type]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const type = node.attrs.type === 'continuous' ? 'Liên tục' : 'Trang tiếp theo';
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'section-break',
        'data-section-type': node.attrs.type,
        class: 'section-break-divider my-4 flex items-center gap-2 select-none text-xs text-muted-foreground border-t border-dashed border-primary/40 pt-1',
      }),
      ['span', { class: 'bg-muted px-2 py-0.5 rounded text-[10px] font-mono' }, `Ngắt phần (${type})`],
    ];
  },

  addCommands() {
    return {
      setSectionBreak:
        (options = {}) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                type: options.type ?? 'next-page',
              },
            })
            .run();
        },
    };
  },
});
