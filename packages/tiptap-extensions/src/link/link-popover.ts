import { Extension, type Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { Node as PMNode } from '@tiptap/pm/model';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    linkPopover: {
      openLinkPopover: () => ReturnType;
    };
  }

  interface Storage {
    linkPopover: {
      onOpen: ((editor: Editor, url: string, anchor: DOMRect | null) => void) | null;
    };
  }
}

export const linkPopoverPluginKey = new PluginKey('linkPopover');

export interface LinkPopoverStorage {
  onOpen: ((editor: Editor, url: string, anchor: DOMRect | null) => void) | null;
}

const findLinkHref = (doc: PMNode, from: number, to: number): string => {
  let href = '';
  doc.nodesBetween(from, to, (node) => {
    if (node.isText && !href) {
      const mark = node.marks.find((m) => m.type.name === 'link');
      if (mark?.attrs.href) href = String(mark.attrs.href);
    }
  });
  return href;
};

export const LinkPopover = Extension.create({
  name: 'linkPopover',

  addStorage(): LinkPopoverStorage {
    return { onOpen: null };
  },

  addCommands() {
    return {
      openLinkPopover:
        () =>
        ({ state, editor }) => {
          const { from, to } = state.selection;
          if (from === to) return false;
          const href = findLinkHref(state.doc, from, to);
          if (!href) return false;
          const coords = editor.view.coordsAtPos(from);
          const rect = new DOMRect(coords.left, coords.top, 0, 0);
          this.storage.onOpen?.(editor, href, rect);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;
    return [
      new Plugin({
        key: linkPopoverPluginKey,
        props: {
          handleClick(view, pos) {
            const mark = view.state.doc.nodeAt(pos)?.marks.find((m) => m.type.name === 'link');
            const href = mark?.attrs.href as string | undefined;
            if (href) {
              const coords = view.coordsAtPos(pos);
              const rect = new DOMRect(coords.left, coords.top, 0, 0);
              storage.onOpen?.(view as unknown as Editor, href, rect);
            }
            return false;
          },
        },
      }),
    ];
  },
});