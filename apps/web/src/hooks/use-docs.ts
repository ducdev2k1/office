import { useEffect, useMemo, useRef, useState } from 'react';
import { createBlankDoc, getStorageUsageBytes, loadDocs, saveDocs, starterDocs } from '../storage';
import type { DocRecord, PageSetup } from '../types';

export interface DocsState {
  docs: DocRecord[];
  activeId: string;
  activeDoc: DocRecord | undefined;
  saveState: string;
  storageBytes: number;
  setActiveId: (id: string) => void;
  updateContent: (html: string) => void;
  updateTitle: (title: string) => void;
  addDoc: () => void;
  deleteDoc: () => void;
  setActiveDocPageSetup: (setup: PageSetup) => void;
}

export const useDocs = (): DocsState => {
  const [docs, setDocs] = useState<DocRecord[]>(loadDocs);
  const [activeId, setActiveId] = useState(
    () => docs[0]?.id ?? starterDocs[0]?.id ?? 'doc-roadmap',
  );
  const [saveState, setSaveState] = useState('Da luu');
  const activeDoc = docs.find((doc) => doc.id === activeId) ?? docs[0];
  const activeDocRef = useRef(activeDoc);

  useEffect(() => {
    activeDocRef.current = activeDoc;
  }, [activeDoc]);
  useEffect(() => {
    saveDocs(docs);
  }, [docs]);

  const updateContent = (html: string): void => {
    const currentDoc = activeDocRef.current;
    if (!currentDoc) return;
    const now = new Date().toISOString();
    setSaveState('Dang luu...');
    setDocs((currentDocs) =>
      currentDocs.map((doc) =>
        doc.id === currentDoc.id ? { ...doc, content: html, updatedAt: now } : doc,
      ),
    );
    window.setTimeout(() => setSaveState('Da luu'), 250);
  };

  const updateTitle = (title: string): void => {
    if (!activeDoc) return;
    const now = new Date().toISOString();
    setDocs((currentDocs) =>
      currentDocs.map((doc) =>
        doc.id === activeDoc.id
          ? { ...doc, title: title || 'Khong co tieu de', updatedAt: now }
          : doc,
      ),
    );
  };

  const addDoc = (): void => {
    const nextDoc = createBlankDoc();
    setDocs((currentDocs) => [nextDoc, ...currentDocs]);
    setActiveId(nextDoc.id);
  };

  const deleteDoc = (): void => {
    if (!activeDoc || docs.length === 1 || !window.confirm(`Xoa "${activeDoc.title}"?`)) return;
    const nextDocs = docs.filter((doc) => doc.id !== activeDoc.id);
    setDocs(nextDocs);
    setActiveId(nextDocs[0]?.id ?? '');
  };

  const setActiveDocPageSetup = (setup: PageSetup): void => {
    if (!activeDoc) return;
    setDocs((currentDocs) =>
      currentDocs.map((doc) => (doc.id === activeDoc.id ? { ...doc, pageSetup: setup } : doc)),
    );
  };

  const storageBytes = useMemo(() => getStorageUsageBytes(docs), [docs]);

  return {
    docs,
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
  };
};
