import { Node, mergeAttributes } from '@tiptap/core';
import { type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { useTranslation } from '@office/i18n';
import { escapeHtml } from '../shared/html.utils';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mention: {
      insertMention: (attrs: { id: string; name: string }) => ReturnType;
    };
  }

  interface Storage {
    mention: {
      onMentionClick: ((userId: string, name: string, anchor: DOMRect) => void) | null;
    };
  }
}

export interface MentionStorage {
  onMentionClick: ((userId: string, name: string, anchor: DOMRect) => void) | null;
}

export const mentionPluginKey = new PluginKey('mentionClick');

export const Mention = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addStorage(): MentionStorage {
    return { onMentionClick: null };
  },

  addAttributes() {
    return {
      id: { default: null },
      name: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-mention][data-user-id]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { id, name } = node.attrs as { id: string; name: string };
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-mention': '',
        'data-user-id': id,
        class: 'mention',
      }),
      `@${escapeHtml(name)}`,
    ];
  },

  addCommands() {
    return {
      insertMention:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: 'mention', attrs }),
    };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;
    return [
      new Plugin({
        key: mentionPluginKey,
        props: {
          handleClick(view, pos) {
            const node = view.state.doc.nodeAt(pos);
            if (node?.type.name !== 'mention') return false;
            const attrs = node.attrs as { id: string; name: string };
            const coords = view.coordsAtPos(pos);
            const rect = new DOMRect(coords.left, coords.top, 0, 0);
            storage.onMentionClick?.(attrs.id, attrs.name, rect);
            return true;
          },
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MentionView);
  },
});

const MentionView = ({ node }: NodeViewProps) => {
  const { t } = useTranslation('docs');
  const attrs = node.attrs as { id: string; name: string };
  const displayName = attrs.name || t('mention.unknownUser');

  return (
    <NodeViewWrapper
      as="span"
      className="mention rounded-md bg-primary/10 px-1 py-0.5 text-primary cursor-pointer align-baseline"
      data-mention=""
      data-user-id={attrs.id}
      contentEditable={false}
    >
      @{escapeHtml(displayName)}
    </NodeViewWrapper>
  );
};