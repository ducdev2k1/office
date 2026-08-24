import { generateJSON, getSchema } from '@tiptap/core';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import StarterKit from '@tiptap/starter-kit';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import * as Y from 'yjs';
import { prosemirrorToYXmlFragment } from 'y-prosemirror';

const FIXTURE_EXTENSIONS = [
  StarterKit.configure({ undoRedo: false }),
  Table,
  TableRow,
  TableCell,
  TableHeader,
];

/**
 * Ghi nội dung HTML vào Y.Doc rồi lưu state nhị phân vào IndexedDB đúng định dạng
 * mà y-indexeddb đọc khi mở tài liệu (db tên docId, store 'updates').
 */
export const seedDocYjsState = async (docId: string, html: string): Promise<void> => {
  const schema = getSchema(FIXTURE_EXTENSIONS);
  const json = generateJSON(html, FIXTURE_EXTENSIONS);
  const pmDoc = ProseMirrorNode.fromJSON(schema, json);

  const ydoc = new Y.Doc();
  prosemirrorToYXmlFragment(pmDoc, ydoc.getXmlFragment('default'));
  const state = Y.encodeStateAsUpdate(ydoc);
  ydoc.destroy();

  await new Promise<void>((resolve, reject) => {
    const openReq = indexedDB.open(docId);
    openReq.onupgradeneeded = () => {
      const db = openReq.result;
      if (!db.objectStoreNames.contains('updates')) {
        db.createObjectStore('updates', { autoIncrement: true });
      }
    };
    openReq.onsuccess = () => {
      const db = openReq.result;
      try {
        const tx = db.transaction('updates', 'readwrite');
        tx.objectStore('updates').add(state);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      } catch (error) {
        db.close();
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };
    openReq.onerror = () => reject(openReq.error);
  });
};
