import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FileRecord } from '@office/file-home';
import { createBlankDoc, getStorageUsageBytes, loadDocs, saveDocs } from '@/services/docs.service';
import type { DocRecord, PageSetup } from '@/types/docs.types';

export interface DocsState {
  docs: DocRecord[];
  files: FileRecord[];
  loading: boolean;
  activeId: string;
  activeDoc: DocRecord | undefined;
  saveState: string;
  storageBytes: number;
  setActiveId: (id: string) => void;
  updateContent: (html: string) => void;
  updateTitle: (title: string) => void;
  addDoc: () => string;
  deleteDoc: () => void;
  setActiveDocPageSetup: (setup: PageSetup) => void;
  star: (id: string) => void;
  rename: (id: string, title: string) => void;
  duplicate: (id: string) => void;
  trash: (id: string) => void;
  restore: (id: string) => void;
  deleteForever: (id: string) => void;
  markOpened: (id: string) => void;
}

const now = (): string => new Date().toISOString();

export const useDocs = (): DocsState => {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(() => 'doc-roadmap');
  const [saveState, setSaveState] = useState('Đang tải...');
  const activeDoc =
    docs.find((doc) => doc.id === activeId && !doc.deletedAt) ?? docs.find((doc) => !doc.deletedAt);
  const activeDocRef = useRef(activeDoc);

  useEffect(() => {
    void loadDocs().then((loaded) => {
      setDocs(loaded);
      const first = loaded.find((doc) => !doc.deletedAt);
      setActiveId(first?.id ?? loaded[0]?.id ?? '');
      setLoading(false);
      setSaveState('Đã lưu');
    });
  }, []);

  useEffect(() => {
    activeDocRef.current = activeDoc;
  }, [activeDoc]);

  useEffect(() => {
    if (docs.length === 0) return;
    void saveDocs(docs);
  }, [docs]);

  const updateDoc = useCallback((id: string, updater: (doc: DocRecord) => DocRecord): void => {
    setDocs((current) => current.map((doc) => (doc.id === id ? updater(doc) : doc)));
  }, []);

  const updateContent = useCallback((html: string): void => {
    const currentDoc = activeDocRef.current;
    if (!currentDoc) return;
    setSaveState('Đang lưu...');
    updateDoc(currentDoc.id, (doc) => ({ ...doc, content: html, updatedAt: now() }));
    window.setTimeout(() => setSaveState('Đã lưu'), 250);
  }, [updateDoc]);

  const updateTitle = useCallback((title: string): void => {
    const currentDoc = activeDocRef.current;
    if (!currentDoc) return;
    updateDoc(currentDoc.id, (doc) => ({
      ...doc,
      title: title || 'Chưa có tiêu đề',
      updatedAt: now(),
    }));
  }, [updateDoc]);

  const addDoc = useCallback((): string => {
    const nextDoc = createBlankDoc();
    setDocs((current) => [nextDoc, ...current]);
    setActiveId(nextDoc.id);
    return nextDoc.id;
  }, []);

  const star = useCallback((id: string): void => {
    updateDoc(id, (doc) => ({ ...doc, starred: !doc.starred }));
  }, [updateDoc]);

  const rename = useCallback((id: string, title: string): void => {
    updateDoc(id, (doc) => ({
      ...doc,
      title: title.trim() || 'Chưa có tiêu đề',
      updatedAt: now(),
    }));
  }, [updateDoc]);

  const duplicate = useCallback((id: string): void => {
    setDocs((current) => {
      const source = current.find((doc) => doc.id === id);
      if (!source) return current;
      const copy: DocRecord = {
        ...source,
        id: `doc-${crypto.randomUUID()}`,
        title: `Bản sao của ${source.title}`,
        createdAt: now(),
        updatedAt: now(),
        lastOpenedAt: now(),
        starred: false,
        deletedAt: null,
      };
      return [copy, ...current];
    });
  }, []);

  const trash = useCallback((id: string): void => {
    updateDoc(id, (doc) => ({ ...doc, deletedAt: now() }));
  }, [updateDoc]);

  const restore = useCallback((id: string): void => {
    updateDoc(id, (doc) => ({ ...doc, deletedAt: null, updatedAt: now() }));
  }, [updateDoc]);

  const deleteForever = useCallback((id: string): void => {
    setDocs((current) => current.filter((doc) => doc.id !== id));
  }, []);

  const markOpened = useCallback((id: string): void => {
    updateDoc(id, (doc) => ({ ...doc, lastOpenedAt: now() }));
  }, [updateDoc]);

  const deleteDoc = useCallback((): void => {
    const currentDoc = activeDocRef.current;
    if (!currentDoc) return;
    setDocs((current) => {
      const remaining = current.filter((doc) => !doc.deletedAt && doc.id !== currentDoc.id);
      if (remaining.length === 0) return current;
      setActiveId(remaining[0]!.id);
      return current.map((doc) => (doc.id === currentDoc.id ? { ...doc, deletedAt: now() } : doc));
    });
  }, []);

  const setActiveDocPageSetup = useCallback((setup: PageSetup): void => {
    const currentDoc = activeDocRef.current;
    if (!currentDoc) return;
    updateDoc(currentDoc.id, (doc) => ({ ...doc, pageSetup: setup }));
  }, [updateDoc]);

  const files = useMemo<FileRecord[]>(() => docs, [docs]);
  const storageBytes = useMemo(() => getStorageUsageBytes(docs), [docs]);

  return {
    docs,
    files,
    loading,
    activeId,
    activeDoc,
    saveState,
    storageBytes,
    setActiveId,
    updateContent,
    updateTitle,
    addDoc,
    deleteDoc,
    setActiveDocPageSetup,
    star,
    rename,
    duplicate,
    trash,
    restore,
    deleteForever,
    markOpened,
  };
};
