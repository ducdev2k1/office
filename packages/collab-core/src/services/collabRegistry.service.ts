import type { CollabRoomConfig, CollabSessionInstance } from '../types/collab.types';
import { sanitizeCollabUser } from '../utils/sanitize.utils';
import { createCollabSession } from './collabSession.service';

const sessions = new Map<string, CollabSessionInstance>();
const TEARDOWN_DELAY_MS = 5000;

export const acquireCollabSession = (config: CollabRoomConfig): CollabSessionInstance => {
  const { docId, user } = config;
  let session = sessions.get(docId);

  if (session) {
    if (session.teardownTimer !== null) {
      clearTimeout(session.teardownTimer);
      session.teardownTimer = null;
    }
    session.refCount++;
    session.provider.setAwarenessField('user', sanitizeCollabUser(user));
    return session;
  }

  session = createCollabSession(config);
  sessions.set(docId, session);
  return session;
};

export const releaseCollabSession = (docId: string): void => {
  const session = sessions.get(docId);
  if (!session) return;

  session.refCount--;
  if (session.refCount <= 0) {
    session.refCount = 0;
    if (session.teardownTimer !== null) {
      clearTimeout(session.teardownTimer);
    }
    session.teardownTimer = setTimeout(() => {
      if (session.refCount === 0) {
        session.destroy();
        sessions.delete(docId);
      }
    }, TEARDOWN_DELAY_MS);
  }
};

export const getCollabSession = (docId: string): CollabSessionInstance | undefined => {
  return sessions.get(docId);
};

export const clearAllCollabSessions = (): void => {
  sessions.forEach((session) => {
    session.destroy();
  });
  sessions.clear();
};
