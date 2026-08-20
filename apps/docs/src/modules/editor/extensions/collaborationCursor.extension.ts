import { Extension } from '@tiptap/core';
import type { DecorationAttrs } from '@tiptap/pm/view';
import { defaultSelectionBuilder, yCursorPlugin } from '@tiptap/y-tiptap';

export interface CollaborationCursorOptions {
  provider: any;
  user: Record<string, any>;
  render?: (user: Record<string, any>) => HTMLElement;
  selectionRender?: (user: Record<string, any>) => DecorationAttrs;
}

export interface CollaborationCursorStorage {
  users: { clientId: number; [key: string]: any }[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collaborationCursor: {
      updateUser: (attributes: Record<string, any>) => ReturnType;
    };
  }
}

const awarenessStatesToArray = (states: Map<number, Record<string, any>>) => {
  return Array.from(states.entries()).map(([key, value]) => ({
    clientId: key,
    ...value.user,
  }));
};

const defaultRender = (user: Record<string, any>): HTMLElement => {
  const cursor = document.createElement('span');
  cursor.classList.add('collaboration-cursor__caret');
  if (user.clientId) {
    cursor.setAttribute('data-client-id', String(user.clientId));
  }
  if (user.id) {
    cursor.setAttribute('data-user-id', String(user.id));
  }
  cursor.setAttribute('style', `border-color: ${user.color ?? '#2563eb'}`);

  const label = document.createElement('div');
  label.classList.add('collaboration-cursor__label');
  label.setAttribute('style', `background-color: ${user.color ?? '#2563eb'}`);
  label.insertBefore(document.createTextNode(user.name ?? 'Guest'), null);
  cursor.insertBefore(label, null);

  return cursor;
};

export const CollaborationCursor = Extension.create<
  CollaborationCursorOptions,
  CollaborationCursorStorage
>({
  name: 'collaborationCursor',

  addOptions() {
    return {
      provider: null,
      user: {
        name: null,
        color: null,
      },
      render: defaultRender,
      selectionRender: defaultSelectionBuilder,
    };
  },

  addStorage() {
    return {
      users: [],
    };
  },

  addCommands() {
    return {
      updateUser: (attributes: Record<string, any>) => () => {
        const localClientId = this.options.provider?.awareness?.clientID;
        this.options.user = {
          ...attributes,
          clientId: localClientId,
        };
        this.options.provider?.awareness?.setLocalStateField('user', this.options.user);
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    if (!this.options.provider?.awareness) {
      return [];
    }

    return [
      yCursorPlugin(
        (() => {
          const localClientId = this.options.provider.awareness.clientID;
          const userWithClientId = {
            ...this.options.user,
            clientId: localClientId,
          };
          this.options.provider.awareness.setLocalStateField('user', userWithClientId);

          this.storage.users = awarenessStatesToArray(this.options.provider.awareness.states);

          this.options.provider.awareness.on('update', () => {
            this.storage.users = awarenessStatesToArray(this.options.provider.awareness.states);
          });

          return this.options.provider.awareness;
        })(),
        {
          cursorBuilder: this.options.render ?? defaultRender,
          selectionBuilder: this.options.selectionRender ?? defaultSelectionBuilder,
        },
      ),
    ];
  },
});
