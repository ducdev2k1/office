import { Server } from '@hocuspocus/server';
import { SERVER_CONFIG } from './config/server.config.js';
import { onAuthenticate } from './hooks/auth.hook.js';
import { onLoadDocument, onStoreDocument } from './hooks/persistence.hook.js';

export const server = Server.configure({
  port: SERVER_CONFIG.port,
  debounce: SERVER_CONFIG.debounce,
  maxDebounce: SERVER_CONFIG.maxDebounce,

  onAuthenticate: async (data) => {
    return onAuthenticate(data);
  },

  onLoadDocument: async (data) => {
    return onLoadDocument(data);
  },

  onStoreDocument: async (data) => {
    return onStoreDocument(data);
  },

  beforeHandleMessage: async (data) => {
    if (data.update && data.update.byteLength > SERVER_CONFIG.maxPayloadSize) {
      console.warn(
        `[CollabServer] Rejected payload exceeding max size (${data.update.byteLength} bytes)`,
      );
      throw new Error(
        `Payload exceeds maximum allowed size of ${SERVER_CONFIG.maxPayloadSize} bytes`,
      );
    }
  },

  onConnect: async (data) => {
    console.log(`[CollabServer] Client connected to room: ${data.documentName}`);
  },

  onDisconnect: async (data) => {
    console.log(`[CollabServer] Client disconnected from room: ${data.documentName}`);
  },

  onDestroy: async () => {
    console.log('[CollabServer] Server destroyed.');
  },
});

export const startServer = async (): Promise<void> => {
  await server.listen();
  console.log(
    `🚀 [CollabServer] Hocuspocus WebSocket server running at ws://localhost:${SERVER_CONFIG.port}`,
  );
};

void startServer();
