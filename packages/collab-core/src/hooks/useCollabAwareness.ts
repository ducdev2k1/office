import type { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect, useState } from 'react';
import type { CollaboratorPresence, CollabUser } from '../types/collab.types';
import { sanitizeCollabUser } from '../utils/sanitize.utils';

export interface CollabAwarenessResult {
  collaborators: CollabUser[];
  presences: CollaboratorPresence[];
}

export const useCollabAwareness = (
  provider: HocuspocusProvider | null | undefined,
): CollabAwarenessResult => {
  const [result, setResult] = useState<CollabAwarenessResult>({
    collaborators: [],
    presences: [],
  });

  useEffect(() => {
    if (!provider || !provider.awareness) {
      setResult({ collaborators: [], presences: [] });
      return;
    }

    const awareness = provider.awareness;
    const localClientId = awareness.clientID;

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const nextCollaborators: CollabUser[] = [];
      const nextPresences: CollaboratorPresence[] = [];

      states.forEach((state, clientId) => {
        if (!state || typeof state !== 'object') return;
        const rawUser = (state as { user?: Partial<CollabUser> }).user;
        if (!rawUser) return;

        const cleanUser = sanitizeCollabUser(rawUser);
        const cursor = (state as { cursor?: { anchor: number; head: number } }).cursor ?? null;

        nextPresences.push({
          clientId,
          user: cleanUser,
          cursor,
        });

        // Include all remote clients (distinguished by unique Yjs clientId per tab/session)
        if (clientId !== localClientId) {
          nextCollaborators.push({
            ...cleanUser,
            clientId,
          });
        }
      });

      setResult({
        collaborators: nextCollaborators,
        presences: nextPresences,
      });
    };

    handleAwarenessChange();
    awareness.on('change', handleAwarenessChange);

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [provider]);

  return result;
};
