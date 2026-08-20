import type { onLoadDocumentPayload, onStoreDocumentPayload } from '@hocuspocus/server';
import fs from 'fs';
import path from 'path';
import * as Y from 'yjs';
import { SERVER_CONFIG } from '../config/server.config.js';

const getStorageDir = (): string => {
  const dir = path.resolve(process.cwd(), '.data/rooms');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const getDocFilePath = (documentName: string): string => {
  const sanitized = documentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(getStorageDir(), `${sanitized}.bin`);
};

const bootstrapRoadmapDoc = (document: Y.Doc) => {
  const fragment = document.getXmlFragment('default');
  if (fragment.length > 0) return;

  const h1 = new Y.XmlElement('heading');
  h1.setAttribute('level', '1');
  h1.insert(0, [new Y.XmlText('OneMail Docs MVP')]);

  const p1 = new Y.XmlElement('paragraph');
  p1.insert(0, [
    new Y.XmlText(
      'Bản web Docs tập trung vào việc soạn thảo tài liệu trước: editor nhanh, autosave, toolbar đầy đủ và export cơ bản.',
    ),
  ]);

  const h2 = new Y.XmlElement('heading');
  h2.setAttribute('level', '2');
  h2.insert(0, [new Y.XmlText('Phạm vi hiện tại')]);

  const ul = new Y.XmlElement('bulletList');

  const li1 = new Y.XmlElement('listItem');
  const pLi1 = new Y.XmlElement('paragraph');
  pLi1.insert(0, [new Y.XmlText('Tạo và quản lý nhiều tài liệu Docs.')]);
  li1.insert(0, [pLi1]);

  const li2 = new Y.XmlElement('listItem');
  const pLi2 = new Y.XmlElement('paragraph');
  pLi2.insert(0, [
    new Y.XmlText('Định dạng heading, bold, italic, underline, list, alignment và link.'),
  ]);
  li2.insert(0, [pLi2]);

  const li3 = new Y.XmlElement('listItem');
  const pLi3 = new Y.XmlElement('paragraph');
  pLi3.insert(0, [
    new Y.XmlText('Autosave vào trình duyệt để demo luồng làm việc trước khi nối backend.'),
  ]);
  li3.insert(0, [pLi3]);

  ul.insert(0, [li1, li2, li3]);

  fragment.insert(0, [h1, p1, h2, ul]);
};

const bootstrapBlankDoc = (document: Y.Doc) => {
  const fragment = document.getXmlFragment('default');
  if (fragment.length > 0) return;
  const p = new Y.XmlElement('paragraph');
  fragment.insert(0, [p]);
};

export const onLoadDocument = async (data: onLoadDocumentPayload): Promise<Y.Doc> => {
  const { documentName, document } = data;
  const filePath = getDocFilePath(documentName);

  try {
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      if (buffer.length > 0) {
        Y.applyUpdate(document, new Uint8Array(buffer));
        console.log(
          `[CollabPersistence] Loaded document "${documentName}" (${buffer.length} bytes) from storage.`,
        );
        return document;
      }
    }

    if (documentName === 'doc-roadmap') {
      bootstrapRoadmapDoc(document);
    } else {
      bootstrapBlankDoc(document);
    }

    const update = Y.encodeStateAsUpdate(document);
    fs.writeFileSync(filePath, Buffer.from(update));
    console.log(`[CollabPersistence] Bootstrapped and stored new document "${documentName}".`);
  } catch (err) {
    console.error(`[CollabPersistence] Error in onLoadDocument for "${documentName}":`, err);
  }

  return document;
};

export const onStoreDocument = async (data: onStoreDocumentPayload): Promise<void> => {
  const { documentName, document } = data;
  const filePath = getDocFilePath(documentName);

  try {
    const update = Y.encodeStateAsUpdate(document);
    fs.writeFileSync(filePath, Buffer.from(update));
    console.log(
      `[CollabPersistence] Stored document "${documentName}" (${update.byteLength} bytes) to storage.`,
    );
  } catch (err) {
    console.error(`[CollabPersistence] Error in onStoreDocument for "${documentName}":`, err);
  }
};
