import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FileRecord } from '@office/file-home';
import {
  createBlankDoc,
  deleteDocRecord,
  deleteDocxSource,
  getStorageUsageBytes,
  loadDocs,
  saveDoc,
  saveDocs,
} from '@/services/docs.service';
import { importDocxFile } from '@/services/import.service';
import { DEFAULT_PAGE_SETUP, type DocRecord, type PageSetup } from '@/types/docs.types';

export interface DocsState {
  docs: DocRecord[];
  files: FileRecord[];
  loading: boolean;
  activeId: string;
  activeDoc: DocRecord | undefined;
  saveState: 'loading' | 'saving' | 'saved';
  storageBytes: number;
  setActiveId: (id: string) => void;
  updateContent: (html: string) => void;
  updateTitle: (title: string) => void;
  addDoc: () => string;
  importFile: (file: File) => Promise<string>;
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

export const createTemporaryDoc = (id: string): DocRecord => ({
  id,
  title: 'Tài liệu chia sẻ',
  kind: 'docs',
  content: '',
  createdAt: now(),
  updatedAt: now(),
  lastOpenedAt: now(),
  starred: false,
  deletedAt: null,
  pageSetup: DEFAULT_PAGE_SETUP(),
});

export const useDocs = (): DocsState => {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlId = window.location.pathname.match(/^\/edit\/([^/]+)/)?.[1];
      if (urlId) return urlId;
    }
    return 'doc-roadmap';
  });
  const [saveState, setSaveState] = useState<'loading' | 'saving' | 'saved'>('loading');
  const activeDoc = useMemo(() => {
    if (activeId) {
      const found = docs.find((doc) => doc.id === activeId && !doc.deletedAt);
      if (found) return found;
      return createTemporaryDoc(activeId);
    }
    return docs.find((doc) => !doc.deletedAt);
  }, [docs, activeId]);
  const activeDocRef = useRef(activeDoc);

  useEffect(() => {
    void loadDocs().then((loaded) => {
      const urlId = window.location.pathname.match(/^\/edit\/([^/]+)/)?.[1];
      let docList = [...loaded];
      if (urlId) {
        const existing = loaded.find((doc) => doc.id === urlId && !doc.deletedAt);
        if (!existing) {
          const placeholder = createTemporaryDoc(urlId);
          docList = [placeholder, ...docList];
        }
        setActiveId(urlId);
      } else {
        const first = loaded.find((doc) => !doc.deletedAt);
        setActiveId(first?.id ?? loaded[0]?.id ?? '');
      }
      setDocs(docList);
      setLoading(false);
      setSaveState('saved');
    });
  }, []);

  useEffect(() => {
    activeDocRef.current = activeDoc;
  }, [activeDoc]);

  // Autosave: Chi ghi ban ghi activeDoc qua put() don diem de giam thieu Disk I/O va giam lag
  useEffect(() => {
    if (!activeDoc || loading) return;
    const timeout = window.setTimeout(() => {
      void saveDoc(activeDoc);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [activeDoc, loading]);

  const updateDoc = useCallback((id: string, updater: (doc: DocRecord) => DocRecord): void => {
    setDocs((current) => current.map((doc) => (doc.id === id ? updater(doc) : doc)));
  }, []);

  const updateContent = useCallback(
    (html: string): void => {
      const currentDoc = activeDocRef.current;
      if (!currentDoc) return;
      setSaveState('saving');
      updateDoc(currentDoc.id, (doc) => ({ ...doc, content: html, updatedAt: now() }));
      window.setTimeout(() => setSaveState('saved'), 250);
    },
    [updateDoc],
  );

  const updateTitle = useCallback(
    (title: string): void => {
      const currentDoc = activeDocRef.current;
      if (!currentDoc) return;
      updateDoc(currentDoc.id, (doc) => ({
        ...doc,
        title,
        updatedAt: now(),
      }));
    },
    [updateDoc],
  );

  const addDoc = useCallback((): string => {
    const nextDoc = createBlankDoc();
    setDocs((current) => [nextDoc, ...current]);
    setActiveId(nextDoc.id);
    void saveDoc(nextDoc);
    return nextDoc.id;
  }, []);

  const importFile = useCallback(async (file: File): Promise<string> => {
    const nextDoc = await importDocxFile(file);
    setDocs((current) => [nextDoc, ...current]);
    setActiveId(nextDoc.id);
    void saveDoc(nextDoc);
    return nextDoc.id;
  }, []);

  const star = useCallback(
    (id: string): void => {
      updateDoc(id, (doc) => {
        const updated = { ...doc, starred: !doc.starred };
        void saveDoc(updated);
        return updated;
      });
    },
    [updateDoc],
  );

  const rename = useCallback(
    (id: string, title: string): void => {
      updateDoc(id, (doc) => {
        const updated = {
          ...doc,
          title: title.trim() || 'Chưa có tiêu đề',
          updatedAt: now(),
        };
        void saveDoc(updated);
        return updated;
      });
    },
    [updateDoc],
  );

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
        sourceType: undefined,
      };
      void saveDoc(copy);
      return [copy, ...current];
    });
  }, []);

  const trash = useCallback(
    (id: string): void => {
      updateDoc(id, (doc) => {
        const updated = { ...doc, deletedAt: now() };
        void saveDoc(updated);
        return updated;
      });
    },
    [updateDoc],
  );

  const restore = useCallback(
    (id: string): void => {
      updateDoc(id, (doc) => {
        const updated = { ...doc, deletedAt: null, updatedAt: now() };
        void saveDoc(updated);
        return updated;
      });
    },
    [updateDoc],
  );

  const deleteForever = useCallback((id: string): void => {
    setDocs((current) => current.filter((doc) => doc.id !== id));
    void deleteDocRecord(id);
    void deleteDocxSource(id);
  }, []);

  const markOpened = useCallback(
    (id: string): void => {
      updateDoc(id, (doc) => {
        const updated = { ...doc, lastOpenedAt: now() };
        void saveDoc(updated);
        return updated;
      });
    },
    [updateDoc],
  );

  const deleteDoc = useCallback((): void => {
    const currentDoc = activeDocRef.current;
    if (!currentDoc) return;
    setDocs((current) => {
      const remaining = current.filter((doc) => !doc.deletedAt && doc.id !== currentDoc.id);
      if (remaining.length === 0) return current;
      setActiveId(remaining[0]!.id);
      const updated = current.map((doc) =>
        doc.id === currentDoc.id ? { ...doc, deletedAt: now() } : doc,
      );
      const trashed = updated.find((doc) => doc.id === currentDoc.id);
      if (trashed) void saveDoc(trashed);
      return updated;
    });
  }, []);

  const setActiveDocPageSetup = useCallback(
    (setup: PageSetup): void => {
      const currentDoc = activeDocRef.current;
      if (!currentDoc) return;
      updateDoc(currentDoc.id, (doc) => {
        const updated = { ...doc, pageSetup: setup };
        void saveDoc(updated);
        return updated;
      });
    },
    [updateDoc],
  );

  const handleSetActiveId = useCallback((id: string): void => {
    setActiveId(id);
    setDocs((current) => {
      if (current.some((doc) => doc.id === id && !doc.deletedAt)) {
        return current;
      }
      const placeholder = createTemporaryDoc(id);
      return [placeholder, ...current];
    });
  }, []);

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
    setActiveId: handleSetActiveId,
    updateContent,
    updateTitle,
    addDoc,
    importFile,
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
