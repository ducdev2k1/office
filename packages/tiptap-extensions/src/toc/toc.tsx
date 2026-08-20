import { Node, mergeAttributes } from '@tiptap/core';
import { type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer, useEditorState } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { useTranslation } from '@office/i18n';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toc: {
      insertToc: () => ReturnType;
    };
  }

  interface Storage {
    toc: {
      entries: TocEntry[];
      onJump: ((pos: number) => void) | null;
    };
  }
}

export interface TocEntry {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export const tocPluginKey = new PluginKey<TocEntry[]>('tocEntries');

export const Toc = Node.create({
  name: 'toc',
  group: 'block',
  atom: true,

  addStorage() {
    return { entries: [] as TocEntry[], onJump: null };
  },

  parseHTML() {
    return [{ tag: 'nav[data-toc]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['nav', mergeAttributes({ 'data-toc': '' }, HTMLAttributes)];
  },

  addCommands() {
    return {
      insertToc:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: 'toc' }),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<TocEntry[]>({
        key: tocPluginKey,
        state: {
          init: (_, state) => collectHeadings(state.doc),
          apply: (tr, prev) => {
            if (!tr.docChanged) return prev;
            return collectHeadings(tr.doc);
          },
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TocView);
  },
});

const collectHeadings = (doc: {
  descendants?: (
    f: (
      node: { type: { name: string }; attrs: Record<string, unknown>; textContent?: string },
      pos: number,
    ) => void,
  ) => void;
  nodesBetween?: (
    from: number,
    to: number,
    f: (
      node: { type: { name: string }; attrs: Record<string, unknown>; textContent?: string },
      pos: number,
    ) => void,
  ) => void;
  content?: { size: number };
}): TocEntry[] => {
  const entries: TocEntry[] = [];
  if (!doc) return entries;
  if (typeof doc.descendants === 'function') {
    doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const level = Number(node.attrs.level ?? 1);
        const id = (node.attrs.id as string) || `h-${pos}`;
        entries.push({ id, level, text: node.textContent ?? '', pos });
      }
    });
  } else if (typeof doc.nodesBetween === 'function' && doc.content?.size !== undefined) {
    doc.nodesBetween(0, doc.content.size, (node, pos) => {
      if (node.type.name === 'heading') {
        const level = Number(node.attrs.level ?? 1);
        const id = (node.attrs.id as string) || `h-${pos}`;
        entries.push({ id, level, text: node.textContent ?? '', pos });
      }
    });
  }
  return entries;
};

const TocView = ({ editor }: NodeViewProps) => {
  const { t } = useTranslation('docs');
  const entries = useEditorState({
    editor,
    selector: ({ editor: stateEditor }) => {
      const state = stateEditor.state as { plugins: readonly { spec: { key?: { key?: string } } }[] };
      const plugin = state.plugins.find((p) => p.spec.key?.key === 'tocEntries') as
        | { getState: (state: unknown) => TocEntry[] }
        | undefined;
      const pluginEntries = plugin?.getState(stateEditor.state) ?? [];
      if (pluginEntries.length > 0) return pluginEntries;
      return collectHeadings(stateEditor.state.doc);
    },
  });

  const handleJump = (pos: number) => {
    editor.storage.toc?.onJump?.(pos);
  };

  return (
    <NodeViewWrapper className="toc my-4 p-4 rounded-lg border border-border bg-muted/30 select-none">
      <div className="text-[13px] font-semibold text-foreground mb-2">{t('sidebar.outlineTitle')}</div>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('sidebar.emptyOutline')}</p>
      ) : (
        <ul className="space-y-0.5">
          {entries.map((entry) => (
            <li
              key={`${entry.id}-${entry.pos}`}
              style={{ paddingLeft: `${(entry.level - 1) * 14}px` }}
              className="text-[13px] text-foreground/90 hover:text-primary cursor-pointer truncate"
              onClick={() => handleJump(entry.pos)}
            >
              {escapeHtml(entry.text)}
            </li>
          ))}
        </ul>
      )}
    </NodeViewWrapper>
  );
};

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);