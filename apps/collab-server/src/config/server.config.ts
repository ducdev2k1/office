import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const SERVER_CONFIG = {
  port: Number(process.env.COLLAB_PORT ?? process.env.PORT ?? 1234),
  dbPath: process.env.COLLAB_DB_PATH ?? path.resolve(process.cwd(), '.data/collab.sqlite'),
  maxPayloadSize: 5 * 1024 * 1024, // 5MB limit
  roomRegex: /^(doc|sheet)-[a-zA-Z0-9_-]{1,64}$/,
  authSecret: process.env.COLLAB_AUTH_SECRET ?? 'onemail-collab-local-secret',
  debounce: 2000,
  maxDebounce: 10000,
} as const;
