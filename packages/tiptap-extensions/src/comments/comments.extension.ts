import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { CommentsStore } from './comments-store';
import type { CommentThread } from './types';
import { decodeAnchor } from '../shared/yjs-anchor.utils';

export interface CommentsOptions {
  store?: CommentsStore;
  onSelectThread?: (threadId: string) => void;
}

export const commentsPluginKey = new PluginKey('comments');

export const Comments = Extension.create<CommentsOptions>({
  name: 'comments',

  addOptions() {
    return {
      store: new CommentsStore(),
      onSelectThread: undefined,
    };
  },

  addStorage() {
    return {
      store: this.options.store ?? new CommentsStore(),
    };
  },

  addProseMirrorPlugins() {
    const store: CommentsStore = this.options.store ?? this.storage.store;
    const onSelectThread = this.options.onSelectThread;

    return [
      new Plugin({
        key: commentsPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet, oldState, newState) {
            const threads: CommentThread[] = store.getThreads().filter((t: CommentThread) => !t.resolved);
            if (threads.length === 0) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const docSize = newState.doc.content.size;

            for (const thread of threads) {
              let from = thread.fromIndex;
              let to = thread.toIndex;

              if (from === undefined || to === undefined) {
                const fromAnchor = decodeAnchor(thread.fromAnchor);
                const toAnchor = decodeAnchor(thread.toAnchor);
                from = fromAnchor?.index;
                to = toAnchor?.index;
              }

              if (
                typeof from === 'number' &&
                typeof to === 'number' &&
                from >= 0 &&
                to <= docSize &&
                from < to
              ) {
                decorations.push(
                  Decoration.inline(from, to, {
                    class:
                      'comment-highlight bg-amber-200/50 dark:bg-amber-900/40 border-b-2 border-amber-500/80 cursor-pointer rounded-xs px-0.5 transition-colors hover:bg-amber-300/60',
                    'data-thread-id': thread.id,
                  }),
                );
              }
            }

            return DecorationSet.create(newState.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement | null;
            const threadEl = target?.closest('[data-thread-id]');
            if (threadEl) {
              const threadId = threadEl.getAttribute('data-thread-id');
              if (threadId && onSelectThread) {
                onSelectThread(threadId);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
