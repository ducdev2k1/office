import { Extension } from '@tiptap/core';
import { type Editor } from '@tiptap/core';
import { mountPopup, type SuggestionItem } from '../shared';
import { SuggestionPlugin } from '../shared/suggestion.plugin';

export interface MentionUser {
  id: string;
  name: string;
}

export interface MentionSuggestionOptions {
  users: () => MentionUser[];
  getMentionedIds: () => string[];
}

export interface MentionSuggestionStorage {
  onOpen: (() => void) | null;
  onClose: (() => void) | null;
  onSelect: ((item: SuggestionItem) => void) | null;
}

declare module '@tiptap/core' {
  interface Storage {
    mentionSuggestion: MentionSuggestionStorage;
  }
}

export const MentionSuggestion = Extension.create<MentionSuggestionOptions, MentionSuggestionStorage>({
  name: 'mentionSuggestion',

  addOptions() {
    return {
      users: () => [],
      getMentionedIds: () => [],
    };
  },

  addStorage(): MentionSuggestionStorage {
    return { onOpen: null, onClose: null, onSelect: null };
  },

  addProseMirrorPlugins() {
    const options = this.options;
    const storage = this.storage;

    return [
      SuggestionPlugin({
        char: '@',
        items: (query: string) => {
          const users = options.users();
          const mentioned = new Set(options.getMentionedIds());
          const q = query.toLowerCase();
          return users
            .filter((user) => !mentioned.has(user.id))
            .filter((user) => !q || user.name.toLowerCase().includes(q) || user.id.toLowerCase().includes(q))
            .slice(0, 8)
            .map((user) => ({ id: user.id, label: user.name, description: user.id }));
        },
        onSelect: (item) => {
          storage.onSelect?.(item);
        },
        render: (state) => {
          if (state.items.length === 0) {
            storage.onClose?.();
            return;
          }
          storage.onOpen?.();
        },
      }),
    ];
  },
});