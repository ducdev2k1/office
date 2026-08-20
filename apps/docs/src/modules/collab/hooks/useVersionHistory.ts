import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { encodeState, isStateChanged } from '@office/tiptap-extensions';
import type { DocRecord } from '@/types/docs.types';
import {
  clearDocHistory,
  deleteDocHistory,
  listDocHistory,
  saveDocHistory,
  type DocHistoryRecord,
} from '@/services/docs.service';

const MAX_HISTORY = 50;
const AUTO_SAVE_INTERVAL_MS = 10 * 60 * 1000;

export interface VersionHistoryState {
  versions: DocHistoryRecord[];
  loading: boolean;
  saveCheckpoint: () => Promise<void>;
  restoreVersion: (record: DocHistoryRecord) => void;
  removeVersion: (id: string) => Promise<void>;
  clearVersions: () => Promise<void>;
  previewVersion: (record: DocHistoryRecord) => string;
}

export const useVersionHistory = (
  activeDoc: DocRecord | undefined,
  ydoc: Y.Doc | null,
): VersionHistoryState => {
  const [versions, setVersions] = useState<DocHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const lastSavedRef = useRef<Uint8Array | null>(null);

  const refreshList = useCallback(async (docId: string) => {
    const records = await listDocHistory(docId);
    setVersions(records);
  }, []);

  useEffect(() => {
    if (!activeDoc) return;
    void refreshList(activeDoc.id);
  }, [activeDoc?.id, refreshList]);

  useEffect(() => {
    if (!activeDoc || !ydoc) return;
    void refreshList(activeDoc.id);
  }, [activeDoc, ydoc, refreshList]);

  const saveCheckpoint = useCallback(async (): Promise<void> => {
    if (!activeDoc || !ydoc) return;
    const current = encodeState(ydoc);
    if (!isStateChanged(ydoc, lastSavedRef.current)) return;
    lastSavedRef.current = current;
    const existing = await listDocHistory(activeDoc.id);
    const record: DocHistoryRecord = {
      id: `hist-${crypto.randomUUID()}`,
      docId: activeDoc.id,
      title: activeDoc.title,
      updatedAt: new Date().toISOString(),
      time: new Date().toISOString(),
      update: current,
      author: 'Tôi',
    };
    await saveDocHistory(record);
    const sorted = [...existing, record].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
    if (sorted.length > MAX_HISTORY) {
      await Promise.all(sorted.slice(MAX_HISTORY).map((r) => deleteDocHistory(r.id)));
    }
    await refreshList(activeDoc.id);
  }, [activeDoc, ydoc, refreshList]);

  useEffect(() => {
    if (!activeDoc || !ydoc) return;
    const interval = window.setInterval(() => {
      void saveCheckpoint();
    }, AUTO_SAVE_INTERVAL_MS);
    const handleBeforeUnload = () => {
      void saveCheckpoint();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeDoc, ydoc, saveCheckpoint]);

  const previewVersion = useCallback((record: DocHistoryRecord): string => {
    try {
      const previewDoc = new Y.Doc();
      Y.applyUpdate(previewDoc, record.update);
      const xml = previewDoc.getXmlFragment('default');
      const texts: string[] = [];
      const walk = (node: unknown): void => {
        if (node instanceof Y.XmlText) {
          texts.push(node.toString());
        } else if (node instanceof Y.XmlElement) {
          node.toArray().forEach(walk);
        } else if (Array.isArray(node)) {
          node.forEach(walk);
        }
      };
      walk(xml.toArray());
      const text = texts.join(' ').replace(/\s+/g, ' ').trim();
      return text.length > 280 ? `${text.slice(0, 280)}…` : text;
    } catch {
      return 'Không thể xem trước nội dung phiên bản này';
    }
  }, []);

  const restoreVersion = useCallback((record: DocHistoryRecord): void => {
    if (!ydoc) return;
    const target = new Y.Doc();
    Y.applyUpdate(target, record.update);
    const delta = Y.encodeStateAsUpdate(target, Y.encodeStateVector(ydoc));
    ydoc.transact(() => {
      Y.applyUpdate(ydoc, delta);
    });
    target.destroy();
  }, [ydoc]);

  const removeVersion = useCallback(async (id: string): Promise<void> => {
    await deleteDocHistory(id);
    if (activeDoc) await refreshList(activeDoc.id);
  }, [activeDoc, refreshList]);

  const clearVersions = useCallback(async (): Promise<void> => {
    if (!activeDoc) return;
    await clearDocHistory(activeDoc.id);
    await refreshList(activeDoc.id);
  }, [activeDoc, refreshList]);

  return {
    versions,
    loading,
    saveCheckpoint,
    restoreVersion,
    removeVersion,
    clearVersions,
    previewVersion,
  };
};