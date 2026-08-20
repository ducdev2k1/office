import type { HocuspocusProvider } from '@hocuspocus/provider';
import type { IndexeddbPersistence } from 'y-indexeddb';
import type * as Y from 'yjs';

export interface CollabUser {
  id: string;
  name: string;
  color: string;
  avatarUrl?: string;
  initials?: string;
  clientId?: number;
}

export type CollabStatus = 'connecting' | 'connected' | 'disconnected';

export interface CollabRoomConfig {
  docId: string;
  user: CollabUser;
  serverUrl?: string;
  token?: string;
  enableIndexedDB?: boolean;
  readOnly?: boolean;
  parameters?: Record<string, any>;
}

export interface CollabSessionInstance {
  docId: string;
  doc: Y.Doc;
  provider: HocuspocusProvider;
  indexeddbProvider: IndexeddbPersistence | null;
  refCount: number;
  teardownTimer: ReturnType<typeof setTimeout> | null;
  status: CollabStatus;
  isSynced: boolean;
  isLocalLoaded: boolean;
  listeners: Set<(session: CollabSessionInstance) => void>;
  destroy: () => void;
}

export interface CollabRoomState {
  doc: Y.Doc | null;
  provider: HocuspocusProvider | null;
  status: CollabStatus;
  isSynced: boolean;
  isLocalLoaded: boolean;
  error: Error | null;
}

export interface CollaboratorPresence {
  clientId: number;
  user: CollabUser;
  cursor?: {
    anchor: number;
    head: number;
  } | null;
}
