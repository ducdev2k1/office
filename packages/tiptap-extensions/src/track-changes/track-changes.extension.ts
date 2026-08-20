import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { SuggestionStore } from './suggestion-store';
import type { TrackSuggestion } from './types';
import { decodeAnchor } from '../shared/yjs-anchor.utils';

export interface TrackChangesOptions {
  store?: SuggestionStore;
  enabled?: boolean;
  onSelectSuggestion?: (suggestionId: string) => void;
}

export const trackChangesPluginKey = new PluginKey('trackChanges');

export const TrackChanges = Extension.create<TrackChangesOptions>({
  name: 'trackChanges',

  addOptions() {
    return {
      store: new SuggestionStore(),
      enabled: false,
      onSelectSuggestion: undefined,
    };
  },

  addStorage() {
    return {
      store: this.options.store ?? new SuggestionStore(),
      enabled: this.options.enabled ?? false,
    };
  },

  addProseMirrorPlugins() {
    const store: SuggestionStore = this.options.store ?? this.storage.store;
    const onSelectSuggestion = this.options.onSelectSuggestion;

    return [
      new Plugin({
        key: trackChangesPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet, oldState, newState) {
            const pending: TrackSuggestion[] = store.getPendingSuggestions();
            if (pending.length === 0) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const docSize = newState.doc.content.size;

            for (const item of pending) {
              let from: number | undefined = item.fromIndex;
              let to: number | undefined = item.toIndex;

              if (from === undefined || to === undefined) {
                const fromAnchor = decodeAnchor(item.fromAnchor);
                const toAnchor = decodeAnchor(item.toAnchor);
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
                let decorationClass =
                  'suggestion-highlight cursor-pointer rounded-xs px-0.5 transition-colors ';
                if (item.type === 'insert') {
                  decorationClass +=
                    'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 underline decoration-green-500 decoration-2';
                } else if (item.type === 'delete') {
                  decorationClass +=
                    'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 line-through decoration-red-500 decoration-2';
                } else {
                  decorationClass +=
                    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 underline decoration-blue-500';
                }

                decorations.push(
                  Decoration.inline(from, to, {
                    class: decorationClass,
                    'data-suggestion-id': item.id,
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
            const itemEl = target?.closest('[data-suggestion-id]');
            if (itemEl) {
              const suggestionId = itemEl.getAttribute('data-suggestion-id');
              if (suggestionId && onSelectSuggestion) {
                onSelectSuggestion(suggestionId);
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
