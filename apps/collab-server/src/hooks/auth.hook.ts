import type { onAuthenticatePayload } from '@hocuspocus/server';
import { SERVER_CONFIG } from '../config/server.config.js';

export interface CollabAuthUser {
  id: string;
  name: string;
  role: 'editor' | 'viewer';
}

export const validateRoomName = (roomName: string): boolean => {
  return SERVER_CONFIG.roomRegex.test(roomName);
};

export const onAuthenticate = async (
  data: onAuthenticatePayload,
): Promise<{ user: CollabAuthUser }> => {
  const { documentName, token, requestParameters, connection } = data;

  if (!validateRoomName(documentName)) {
    console.warn(`[CollabAuth] Rejected connection: invalid room name "${documentName}"`);
    throw new Error(`Forbidden: Room name "${documentName}" does not match required format.`);
  }

  // Token authentication check (allows guest access or validated token)
  if (token && token.trim().length > 0 && token !== SERVER_CONFIG.authSecret) {
    // In strict production, invalid token is rejected
    // In dev mode, we support standard bearer token or guest fallback
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[CollabAuth] Invalid token provided for room "${documentName}"`);
      throw new Error('Forbidden: Invalid authentication token.');
    }
  }

  const accessParam = requestParameters?.get('access') ?? requestParameters?.get('role');
  const isReadOnly = accessParam === 'view' || accessParam === 'viewer';

  if (isReadOnly && connection) {
    connection.readOnly = true;
    console.log(`[CollabAuth] Room "${documentName}": connection configured as readOnly.`);
  }

  const userId = `user-${Math.random().toString(36).slice(2, 9)}`;
  const user: CollabAuthUser = {
    id: userId,
    name: 'Collaborator',
    role: isReadOnly ? 'viewer' : 'editor',
  };

  return { user };
};
