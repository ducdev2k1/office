import { createDocumentStore, type StoredDocument } from '@office/storage-adapter';
import { DEFAULT_PAGE_SETUP, type DocRecord } from '@/types/docs.types';

export const STORAGE_KEY = 'onemail-docs-web-documents';

/** Byte goc cua file .docx duoc mo tu may, giu nguyen de sau nay export/save cloud. */
export interface DocxSourceRecord extends StoredDocument {
  id: string;
  blob: Blob;
  originalName: string;
}

export const withDefaults = (doc: DocRecord): DocRecord => {
  const defaults = DEFAULT_PAGE_SETUP();
  const setup = doc.pageSetup;
  return {
    ...doc,
    kind: 'docs',
    createdAt: doc.createdAt ?? doc.updatedAt,
    lastOpenedAt: doc.lastOpenedAt ?? doc.updatedAt,
    starred: doc.starred ?? false,
    deletedAt: doc.deletedAt ?? null,
    pageSetup: {
      paperSize: setup?.paperSize ?? defaults.paperSize,
      orientation: setup?.orientation ?? defaults.orientation,
      margins: setup?.margins ? { ...defaults.margins, ...setup.margins } : defaults.margins,
      headerMargin: setup?.headerMargin ?? defaults.headerMargin,
      footerMargin: setup?.footerMargin ?? defaults.footerMargin,
      header: setup?.header ? { ...defaults.header!, ...setup.header } : defaults.header,
      footer: setup?.footer ? { ...defaults.footer!, ...setup.footer } : defaults.footer,
      pageNumber: setup?.pageNumber
        ? { ...defaults.pageNumber!, ...setup.pageNumber }
        : defaults.pageNumber,
    },
  };
};

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
  {
    id: 'doc-heavy-benchmark',
    title: 'Báo Cáo Kỹ Thuật Tổng Thể (Tài Liệu Nặng Benchmark)',
    kind: 'docs',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
    starred: true,
    deletedAt: null,
    content: `<h1>BÁO CÁO KIẾN TRÚC TOÀN DIỆN VÀ ĐO LƯỜNG HIỆU NĂNG ONEMAIIL OFFICE</h1>
<p><em>Ngày phát hành: 2026-08-20 | Phiên bản: 1.0.0-PROD | Tác giả: OneOffice Architecture Team</em></p>
<hr />
<h2>1. TỔNG QUAN HỆ THỐNG VÀ CHIẾN LƯỢC OFFLINE-FIRST</h2>
<p>Bộ ứng dụng văn phòng OneOffice được thiết kế theo kiến trúc Offline-First toàn phần, đặt trọng tâm vào trải nghiệm mượt mà, bảo mật dữ liệu doanh nghiệp và khả năng lưu trữ không độ trễ trên trình duyệt.</p>
<ul>
<li><strong>Kiến trúc Độc lập:</strong> Hoạt động mượt mà ngay cả khi không có kết nối mạng nhờ tầng lưu trữ IndexedDB phân vùng.</li>
<li><strong>Tương thích OOXML:</strong> Cơ chế preserve-and-patch bảo toàn 100% byte gốc khi mở và lưu các định dạng Microsoft Word (.docx), Excel (.xlsx) và PowerPoint (.pptx).</li>
<li><strong>Tối ưu hóa I/O Autosave:</strong> Chuyển đổi toàn diện sang single-record transaction <code>put(activeDoc)</code> giúp giảm 95% chi phí ghi đĩa khi soạn thảo liên tục.</li>
</ul>
<h2>2. BẢNG PHÂN TÍCH HIỆU NĂNG THEO QUY MÔ DỮ LIỆU</h2>
<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Quy mô Dữ liệu</th>
      <th>Số lượng Tài liệu</th>
      <th>Dung lượng Ước tính</th>
      <th>Thời gian Autosave (put)</th>
      <th>Thời gian Autosave cũ (putMany)</th>
      <th>Mức Cải Thiện</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Nhỏ (Small)</strong></td>
      <td>1 - 5 files</td>
      <td>&lt; 500 KB</td>
      <td>~1.2 ms</td>
      <td>~4.8 ms</td>
      <td><strong>4x nhanh hơn</strong></td>
    </tr>
    <tr>
      <td><strong>Vừa (Medium)</strong></td>
      <td>10 - 30 files</td>
      <td>5 MB - 20 MB</td>
      <td>~1.8 ms</td>
      <td>~42.5 ms</td>
      <td><strong>23x nhanh hơn</strong></td>
    </tr>
    <tr>
      <td><strong>Lớn (Heavy)</strong></td>
      <td>50 - 200 files</td>
      <td>50 MB - 200 MB</td>
      <td>~2.5 ms</td>
      <td>~310.0 ms</td>
      <td><strong>124x nhanh hơn</strong></td>
    </tr>
  </tbody>
</table>
<h2>3. CHI TIẾT CÁC HẠNG MỤC TỐI ƯU HÓA ĐÃ TRIỂN KHAI</h2>
<h3>3.1. Phân tầng Bộ nhớ và Tránh Rò rỉ Transaction</h3>
<p>Mỗi lần người dùng gõ phím trên editor, TipTap bắn sự kiện qua debounce 400ms. Chỉ tài liệu hiện hành được đồng bộ trực tiếp vào Transaction <code>readwrite</code> độc lập:</p>
<blockquote><p>Quy tắc bất biến: Không bao giờ quét hoặc ghi lại toàn bộ danh mục tài liệu khi chỉ có 1 tài liệu phát sinh thay đổi nội dung.</p></blockquote>
<h3>3.2. Quản lý Bộ sưu tập và Phục hồi Lỗi (Crash Resilience)</h3>
<p>Khi người dùng thực hiện xóa vĩnh viễn, nhân bản, hoặc import file mới, hệ thống kích hoạt transaction đơn điểm kết hợp dọn dẹp các blob phụ thuộc trong store <code>docx-sources</code>.</p>
<h2>4. KẾ HOẠCH PHÁT TRIỂN TIẾP THEO</h2>
<ol>
<li>Tích hợp Web Worker nén dữ liệu OOXML trong luồng nền.</li>
<li>Nâng cấp thuật toán CRDT cho tính năng chỉnh sửa thời gian thực đa người dùng (Realtime Collaboration).</li>
<li>Tối ưu hóa bảng tính Sheets với WebAssembly engine cho các công thức tài chính phức tạp.</li>
</ol>`,
  },
];

export const documentStore = createDocumentStore<DocRecord>('documents');

export const docxSourceStore = createDocumentStore<DocxSourceRecord>('docx-sources');

export interface DocHistoryRecord extends StoredDocument {
  id: string;
  docId: string;
  time: string;
  update: Uint8Array;
  author?: string;
}

export const docHistoryStore = createDocumentStore<DocHistoryRecord>('doc-history');

export const listDocHistory = async (docId: string): Promise<DocHistoryRecord[]> => {
  const all = await docHistoryStore.list();
  return all
    .filter((record) => record.docId === docId)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

export const saveDocHistory = async (record: DocHistoryRecord): Promise<void> => {
  await docHistoryStore.put(record);
};

export const deleteDocHistory = async (id: string): Promise<void> => {
  await docHistoryStore.delete(id);
};

export const clearDocHistory = async (docId: string): Promise<void> => {
  const records = await listDocHistory(docId);
  await Promise.all(records.map((record) => docHistoryStore.delete(record.id)));
};

export const saveDocxSource = async (
  docId: string,
  blob: Blob,
  originalName: string,
): Promise<void> => {
  await docxSourceStore.put({
    id: docId,
    blob,
    originalName,
    title: originalName,
    updatedAt: new Date().toISOString(),
  });
};

export const getDocxSource = async (docId: string): Promise<DocxSourceRecord | undefined> =>
  docxSourceStore.get(docId);

export const deleteDocxSource = async (docId: string): Promise<void> => {
  await docxSourceStore.delete(docId);
};

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

export const saveDoc = async (doc: DocRecord): Promise<void> => {
  await documentStore.put(withDefaults(doc));
};

export const saveDocs = async (docs: DocRecord[]): Promise<void> => {
  await documentStore.putMany(docs.map(withDefaults));
};

export const deleteDocRecord = async (id: string): Promise<void> => {
  await documentStore.delete(id);
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
