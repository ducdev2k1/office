import * as Y from 'yjs';

/** Chỉ gộp khi log updates đủ dài — tránh ghi đè vô ích mỗi lần mở doc nhỏ. */
const MIN_ENTRIES_TO_COMPACT = 50;

const openUpdatesDb = (docId: string): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(docId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('updates')) {
        req.result.createObjectStore('updates', { autoIncrement: true });
      }
    };
  });

/**
 * Gộp toàn bộ update log của y-indexeddb thành một state duy nhất.
 *
 * y-indexeddb chỉ tự trim khi MỘT PHIÊN gõ đủ ~500 updates; tài liệu được chỉnh
 * sửa đều đặn với số lượng nhỏ mỗi phiên sẽ tích luỹ hàng nghìn entries, khiến
 * mỗi lần mở phải merge lại toàn bộ lịch sử (treo main thread nhiều giây).
 *
 * An toàn: chạy sau khi local sync hoàn tất (doc đã chứa đủ dữ liệu), snapshot
 * state trong một transaction IDB atomic; các update đến sau vẫn được ghi tiếp
 * như bình thường. Không ảnh hưởng dữ liệu trên collab server.
 */
export const compactYjsUpdateLog = async (docId: string, doc: Y.Doc): Promise<number> => {
  if (typeof indexedDB === 'undefined') return 0;

  let db: IDBDatabase;
  try {
    db = await openUpdatesDb(docId);
  } catch {
    return 0;
  }

  try {
    if (!db.objectStoreNames.contains('updates')) {
      db.close();
      return 0;
    }

    const entryCount = await new Promise<number>((resolve, reject) => {
      const tx = db.transaction('updates', 'readonly');
      const req = tx.objectStore('updates').count();
      req.onsuccess = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
    });

    if (entryCount < MIN_ENTRIES_TO_COMPACT) {
      db.close();
      return 0;
    }

    const state = Y.encodeStateAsUpdate(doc);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('updates', 'readwrite');
      const store = tx.objectStore('updates');
      store.clear();
      store.add(state);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });

    db.close();
    return entryCount;
  } catch {
    try {
      db.close();
    } catch {
      /* ignore */
    }
    return 0;
  }
};
