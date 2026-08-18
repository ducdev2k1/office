import { createDocumentStore } from '@office/storage-adapter';
import { DEFAULT_PAGE_SETUP, type DocRecord } from '@/types/docs.types';

export const STORAGE_KEY = 'onemail-docs-web-documents';

export const withDefaults = (doc: DocRecord): DocRecord => ({
  ...doc,
  kind: 'docs',
  createdAt: doc.createdAt ?? doc.updatedAt,
  lastOpenedAt: doc.lastOpenedAt ?? doc.updatedAt,
  starred: doc.starred ?? false,
  deletedAt: doc.deletedAt ?? null,
  pageSetup: doc.pageSetup ?? DEFAULT_PAGE_SETUP(),
});

const migrateFromLocalStorage = (): DocRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DocRecord[];
    return parsed.map(withDefaults);
  } catch {
    return [];
  }
};

export const starterDocs: DocRecord[] = [
  {
    id: 'doc-roadmap',
    title: 'Roadmap Docs MVP',
    kind: 'docs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
    starred: false,
    deletedAt: null,
    content: `<h1>OneMail Docs MVP</h1><p>Ban web Docs tap trung vao viec soan thao tai lieu truoc: editor nhanh, autosave, toolbar day du va export co ban.</p><h2>Pham vi hien tai</h2><ul><li>Tao va quan ly nhieu tai lieu Docs.</li><li>Dinh dang heading, bold, italic, underline, list, alignment va link.</li><li>Autosave vao trinh duyet de demo luong lam viec truoc khi noi backend.</li></ul>`,
  },
  {
    id: 'doc-spec',
    title: 'Spec tich hop OneMail Auth',
    kind: 'docs',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    lastOpenedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    starred: false,
    deletedAt: null,
    content: `<h1>Spec tich hop Auth</h1><p>Docs se dung chung tai khoan OneMail. Backend can mapping account id sang workspace user id, khong build auth rieng.</p>`,
  },
];

export const documentStore = createDocumentStore<DocRecord>('documents');

export const loadDocs = async (): Promise<DocRecord[]> => {
  try {
    const stored = await documentStore.list();
    const docs = stored.map(withDefaults);
    if (docs.length === 0) {
      const legacy = migrateFromLocalStorage();
      const seeded = legacy.length > 0 ? legacy : starterDocs.map(withDefaults);
      await documentStore.putMany(seeded);
      localStorage.removeItem(STORAGE_KEY);
      return seeded;
    }
    return docs;
  } catch {
    const legacy = migrateFromLocalStorage();
    return legacy.length > 0 ? legacy : starterDocs.map(withDefaults);
  }
};

export const saveDocs = async (docs: DocRecord[]): Promise<void> => {
  await documentStore.putMany(docs.map(withDefaults));
};

export const createBlankDoc = (): DocRecord => {
  const now = new Date().toISOString();
  return {
    id: `doc-${crypto.randomUUID()}`,
    title: 'Tai lieu moi',
    kind: 'docs',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    starred: false,
    deletedAt: null,
    content: '<h1>Tai lieu moi</h1><p></p>',
    pageSetup: DEFAULT_PAGE_SETUP(),
  };
};

export const getStorageUsageBytes = (docs: DocRecord[]): number => JSON.stringify(docs).length;
