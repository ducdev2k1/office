import type { DocumentStore, StoredDocument } from '../types';

interface IndexedDbOptions {
  dbName?: string;
  version?: number;
}

const DEFAULT_DB = 'one-office';
const DEFAULT_STORE = 'documents';
const DEFAULT_VERSION = 1;

const openDb = (dbName: string, storeName: string, version: number): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

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
  private readonly version: number;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(storeName: string, options: IndexedDbOptions = {}) {
    this.name = storeName;
    this.dbName = options.dbName ?? DEFAULT_DB;
    this.storeName = storeName;
    this.version = options.version ?? DEFAULT_VERSION;
  }

  private db(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDb(this.dbName, this.storeName, this.version).catch((error) => {
        this.dbPromise = null;
        throw error;
      });
    }
    return this.dbPromise;
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
