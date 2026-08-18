import type { DocumentStore, StoredDocument } from '../types';

interface IndexedDbOptions {
  dbName?: string;
}

const DEFAULT_DB = 'one-office';
const DEFAULT_STORE = 'documents';

/**
 * Mo 1 connection duy nhat cho moi database (chia se giua cac store cung dbName).
 * IndexedDB chi cho tao object store trong onupgradeneeded (can tang version), va
 * versionchange se bi block neu con connection khac dang mo — nen ta dong connection
 * cu truoc khi bump version.
 */
const connections = new Map<string, Promise<IDBDatabase>>();

const closeConnection = async (dbName: string): Promise<void> => {
  const p = connections.get(dbName);
  if (p) {
    connections.delete(dbName);
    const db = await p.catch(() => null);
    db?.close();
  }
};

const openWithStore = (dbName: string, storeName: string): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName);
    req.onsuccess = () => {
      const db = req.result;
      if (db.objectStoreNames.contains(storeName)) {
        resolve(db);
        return;
      }
      db.close();
      const bump = indexedDB.open(dbName, db.version + 1);
      bump.onupgradeneeded = () => {
        const target = bump.result;
        if (!target.objectStoreNames.contains(storeName)) {
          target.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
      bump.onsuccess = () => resolve(bump.result);
      bump.onerror = () => reject(bump.error);
    };
    req.onerror = () => reject(req.error);
  });

const getDb = (dbName: string, storeName: string): Promise<IDBDatabase> => {
  const existing = connections.get(dbName);
  if (!existing) {
    const p = openWithStore(dbName, storeName);
    connections.set(dbName, p);
    return p;
  }
  return existing.then(async (db) => {
    if (db.objectStoreNames.contains(storeName)) return db;
    await closeConnection(dbName);
    const fresh = await openWithStore(dbName, storeName);
    connections.set(dbName, Promise.resolve(fresh));
    return fresh;
  });
};

const withStore = <T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = fn(tx.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

/** Driver IndexedDB — nguon du lieu goc cho offline-first. */
export class IndexedDbStore<T extends StoredDocument = StoredDocument> implements DocumentStore<T> {
  readonly name: string;
  private readonly dbName: string;
  private readonly storeName: string;

  constructor(storeName: string, options: IndexedDbOptions = {}) {
    this.name = storeName;
    this.dbName = options.dbName ?? DEFAULT_DB;
    this.storeName = storeName;
  }

  private db(): Promise<IDBDatabase> {
    return getDb(this.dbName, this.storeName);
  }

  async list(): Promise<T[]> {
    const db = await this.db();
    const all = await withStore<T[]>(db, this.storeName, 'readonly', (store) => store.getAll());
    return all as T[];
  }

  async get(id: string): Promise<T | undefined> {
    const db = await this.db();
    const record = await withStore<T | undefined>(db, this.storeName, 'readonly', (store) =>
      store.get(id),
    );
    return record;
  }

  async put(doc: T): Promise<void> {
    const db = await this.db();
    await withStore(db, this.storeName, 'readwrite', (store) => store.put(doc));
  }

  async putMany(docs: T[]): Promise<void> {
    const db = await this.db();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      docs.forEach((doc) => store.put(doc));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async delete(id: string): Promise<void> {
    const db = await this.db();
    await withStore(db, this.storeName, 'readwrite', (store) => store.delete(id));
  }

  async clear(): Promise<void> {
    const db = await this.db();
    await withStore(db, this.storeName, 'readwrite', (store) => store.clear());
  }
}

/** Factory giup ca app docs/sheets/slides tao store nhat quan. */
export const createDocumentStore = <T extends StoredDocument = StoredDocument>(
  storeName: string,
  options?: IndexedDbOptions,
): DocumentStore<T> => new IndexedDbStore<T>(storeName, options);
