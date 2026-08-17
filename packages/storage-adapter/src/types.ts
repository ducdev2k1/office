/**
 * storage-adapter — tang luu tru truu tuong.
 *
 * Roadmap: giao dien `DocumentStore`, driver first = IndexedDB,
 * sau nay them FileSystemAccess va Drive. Dam bao trao doi duoc driver.
 */

/** Ban ghi toi thieu ma moi document phai co. */
export interface StoredDocument {
  id: string;
  title: string;
  updatedAt: string;
}

export interface DocumentStore<T extends StoredDocument = StoredDocument> {
  readonly name: string;
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  put(doc: T): Promise<void>;
  putMany(docs: T[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}