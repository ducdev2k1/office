import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';
import type { CollabRoomConfig, CollabSessionInstance, CollabStatus } from '../types/collab.types';
import { sanitizeCollabUser } from '../utils/sanitize.utils';

export const createCollabSession = (config: CollabRoomConfig): CollabSessionInstance => {
  const { docId, user, serverUrl, token, enableIndexedDB = true } = config;
  const sanitizedUser = sanitizeCollabUser(user);

  const doc = new Y.Doc();
  let status: CollabStatus = 'connecting';
  let isSynced = false;
  let isLocalLoaded = false;
  const listeners = new Set<(session: CollabSessionInstance) => void>();

  const notify = () => {
    listeners.forEach((listener) => listener(session));
  };

  let indexeddbProvider: IndexeddbPersistence | null = null;
  if (enableIndexedDB && typeof window !== 'undefined' && 'indexedDB' in window) {
    try {
      indexeddbProvider = new IndexeddbPersistence(docId, doc);
      indexeddbProvider.on('synced', () => {
        isLocalLoaded = true;
        notify();
      });
    } catch (err) {
      console.warn('[CollabSession] IndexedDB persistence failed to initialize:', err);
      isLocalLoaded = true;
    }
  } else {
    isLocalLoaded = true;
  }

  const defaultUrl =
    typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:1234`
      : 'ws://localhost:1234';

  const wsUrl = serverUrl ?? defaultUrl;

  const provider = new HocuspocusProvider({
    url: wsUrl,
    name: docId,
    document: doc,
    token: token ?? 'onemail-collab-local-secret',
    onStatus: ({ status: nextStatus }) => {
      if (nextStatus === 'connected') {
        status = 'connected';
      } else if (nextStatus === 'connecting') {
        status = 'connecting';
      } else {
        status = 'disconnected';
      }
      notify();
    },
    onSynced: () => {
      isSynced = true;
      notify();
    },
  });

  provider.on('synced', () => {
    isSynced = true;
    notify();
  });

  // Set local user state in awareness
  provider.setAwarenessField('user', sanitizedUser);

  const session: CollabSessionInstance = {
    docId,
    doc,
    provider,
    indexeddbProvider,
    refCount: 1,
    teardownTimer: null,
    get status() {
      return status;
    },
    set status(val: CollabStatus) {
      status = val;
    },
    get isSynced() {
      return isSynced;
    },
    set isSynced(val: boolean) {
      isSynced = val;
    },
    get isLocalLoaded() {
      return isLocalLoaded;
    },
    set isLocalLoaded(val: boolean) {
      isLocalLoaded = val;
    },
    listeners,
    destroy: () => {
      if (session.teardownTimer) {
        clearTimeout(session.teardownTimer);
        session.teardownTimer = null;
      }
      listeners.clear();
      try {
        provider.destroy();
      } catch (e) {
        console.warn('[CollabSession] Error destroying provider:', e);
      }
      if (indexeddbProvider) {
        try {
          indexeddbProvider.destroy();
        } catch (e) {
          console.warn('[CollabSession] Error destroying indexeddb:', e);
        }
      }
      try {
        doc.destroy();
      } catch (e) {
        console.warn('[CollabSession] Error destroying Y.Doc:', e);
      }
    },
  };

  return session;
};
