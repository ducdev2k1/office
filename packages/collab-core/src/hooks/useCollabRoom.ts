import { useEffect, useState } from 'react';
import {
  acquireCollabSession,
  getCollabSession,
  releaseCollabSession,
} from '../services/collabRegistry.service';
import type { CollabRoomConfig, CollabRoomState } from '../types/collab.types';

export const useCollabRoom = (config: CollabRoomConfig | null | undefined): CollabRoomState => {
  const [state, setState] = useState<CollabRoomState>(() => {
    if (!config?.docId) {
      return {
        doc: null,
        provider: null,
        status: 'disconnected',
        isSynced: false,
        isLocalLoaded: false,
        error: null,
      };
    }
    const session = getCollabSession(config.docId) ?? acquireCollabSession(config);
    return {
      doc: session.doc,
      provider: session.provider,
      status: session.status,
      isSynced: session.isSynced,
      isLocalLoaded: session.isLocalLoaded,
      error: null,
    };
  });

  useEffect(() => {
    if (!config || !config.docId) {
      setState({
        doc: null,
        provider: null,
        status: 'disconnected',
        isSynced: false,
        isLocalLoaded: false,
        error: null,
      });
      return;
    }

    try {
      const session = acquireCollabSession(config);

      const updateState = () => {
        setState({
          doc: session.doc,
          provider: session.provider,
          status: session.status,
          isSynced: session.isSynced,
          isLocalLoaded: session.isLocalLoaded,
          error: null,
        });
      };

      updateState();
      session.listeners.add(updateState);

      return () => {
        session.listeners.delete(updateState);
        releaseCollabSession(config.docId);
      };
    } catch (err) {
      console.error('[useCollabRoom] Error acquiring session:', err);
      setState({
        doc: null,
        provider: null,
        status: 'disconnected',
        isSynced: false,
        isLocalLoaded: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [config?.docId, config?.user?.id, config?.serverUrl]);

  return state;
};
