import { useEffect, useMemo, useRef, useState } from 'react';
import type { FileRecord } from '@office/file-home';
import { createBlankDoc, getStorageUsageBytes, loadDocs, saveDocs } from '@/storage';
import type { DocRecord, PageSetup } from '@/types';

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
  const [saveState, setSaveState] = useState('Dang tai...');
  const activeDoc =
    docs.find((doc) => doc.id === activeId && !doc.deletedAt) ?? docs.find((doc) => !doc.deletedAt);
  const activeDocRef = useRef(activeDoc);

  useEffect(() => {
    void loadDocs().then((loaded) => {
      setDocs(loaded);
      const first = loaded.find((doc) => !doc.deletedAt);
      setActiveId(first?.id ?? loaded[0]?.id ?? '');
      setLoading(false);
      setSaveState('Da luu');
    });
  }, []);
  useEffect(() => {
    activeDocRef.current = activeDoc;
  }, [activeDoc]);
  useEffect(() => {
    if (docs.length === 0) return;
    void saveDocs(docs);
  }, [docs]);

  const updateDoc = (id: string, updater: (doc: DocRecord) => DocRecord): void => {
    setDocs((current) => current.map((doc) => (doc.id === id ? updater(doc) : doc)));
  };

  const updateContent = (html: string): void => {
    const currentDoc = activeDocRef.current;
    if (!currentDoc) return;
    setSaveState('Dang luu...');
    updateDoc(currentDoc.id, (doc) => ({ ...doc, content: html, updatedAt: now() }));
    window.setTimeout(() => setSaveState('Da luu'), 250);
  };

  const updateTitle = (title: string): void => {
    const currentDoc = activeDocRef.current;
    if (!currentDoc) return;
    updateDoc(currentDoc.id, (doc) => ({
      ...doc,
      title: title || 'Chua co tieu de',
      updatedAt: now(),
    }));
  };

  const addDoc = (): string => {
    const nextDoc = createBlankDoc();
    setDocs((current) => [nextDoc, ...current]);
    setActiveId(nextDoc.id);
    return nextDoc.id;
  };

  const deleteDoc = (): void => {
    if (!activeDoc) return;
    const remaining = docs.filter((doc) => !doc.deletedAt && doc.id !== activeDoc.id);
    if (remaining.length === 0) return;
    trash(activeDoc.id);
    setActiveId(remaining[0]!.id);
  };

  const setActiveDocPageSetup = (setup: PageSetup): void => {
    if (!activeDoc) return;
    updateDoc(activeDoc.id, (doc) => ({ ...doc, pageSetup: setup }));
  };

  const star = (id: string): void => {
    updateDoc(id, (doc) => ({ ...doc, starred: !doc.starred }));
  };

  const rename = (id: string, title: string): void => {
    updateDoc(id, (doc) => ({
      ...doc,
      title: title.trim() || 'Chua co tieu de',
      updatedAt: now(),
    }));
  };

  const duplicate = (id: string): void => {
    const source = docs.find((doc) => doc.id === id);
    if (!source) return;
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
    setDocs((current) => [copy, ...current]);
  };

  const trash = (id: string): void => {
    updateDoc(id, (doc) => ({ ...doc, deletedAt: now() }));
  };

  const restore = (id: string): void => {
    updateDoc(id, (doc) => ({ ...doc, deletedAt: null, updatedAt: now() }));
  };

  const deleteForever = (id: string): void => {
    setDocs((current) => current.filter((doc) => doc.id !== id));
  };

  const markOpened = (id: string): void => {
    updateDoc(id, (doc) => ({ ...doc, lastOpenedAt: now() }));
  };

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
