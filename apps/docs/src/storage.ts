import { DEFAULT_PAGE_SETUP, type DocRecord } from './types';

export const STORAGE_KEY = 'onemail-docs-web-documents';
export const IMAGE_QUOTA_BYTES = 5 * 1024 * 1024;

export const starterDocs: DocRecord[] = [
  {
    id: 'doc-roadmap',
    title: 'Roadmap Docs MVP',
    updatedAt: new Date().toISOString(),
    content: `<h1>OneMail Docs MVP</h1><p>Ban web Docs tap trung vao viec soan thao tai lieu truoc: editor nhanh, autosave, toolbar day du va export co ban.</p><h2>Pham vi hien tai</h2><ul><li>Tao va quan ly nhieu tai lieu Docs.</li><li>Dinh dang heading, bold, italic, underline, list, alignment va link.</li><li>Autosave vao trinh duyet de demo luong lam viec truoc khi noi backend.</li></ul>`,
  },
  {
    id: 'doc-spec',
    title: 'Spec tich hop OneMail Auth',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    content: `<h1>Spec tich hop Auth</h1><p>Docs se dung chung tai khoan OneMail. Backend can mapping account id sang workspace user id, khong build auth rieng.</p>`,
  },
];

export const loadDocs = (): DocRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return starterDocs;
    const parsed = JSON.parse(raw) as DocRecord[];
    if (!parsed.length) return starterDocs;
    return parsed.map((doc) => ({
      ...doc,
      pageSetup: doc.pageSetup ?? DEFAULT_PAGE_SETUP(),
    }));
  } catch {
    return starterDocs;
  }
};

export const saveDocs = (docs: DocRecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

export const createBlankDoc = (): DocRecord => {
  const now = new Date().toISOString();
  return {
    id: `doc-${crypto.randomUUID()}`,
    title: 'Tai lieu moi',
    updatedAt: now,
    content: '<h1>Tai lieu moi</h1><p></p>',
    pageSetup: DEFAULT_PAGE_SETUP(),
  };
};

export const getStorageUsageBytes = (docs: DocRecord[]): number => JSON.stringify(docs).length;
