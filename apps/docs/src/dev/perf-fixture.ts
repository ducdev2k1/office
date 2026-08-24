import { documentStore } from '@/services/docs.service';
import type { DocRecord } from '@/types/docs.types';

const PARA =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.';

/** ~30 block/trang A4 mặc định — mix heading/list/table để sát thực tế. */
const BLOCKS_PER_PAGE = 30;

export const buildLargeDocHtml = (pages: number): string => {
  const totalBlocks = Math.max(BLOCKS_PER_PAGE, pages * BLOCKS_PER_PAGE);
  const parts: string[] = [`<h1>Tài liệu kiểm thử hiệu năng ${pages} trang</h1>`];

  for (let i = 1; i <= totalBlocks; i += 1) {
    if (i % BLOCKS_PER_PAGE === 1 && i > 1) {
      parts.push(`<h2>Mục lục phần ${Math.ceil(i / BLOCKS_PER_PAGE)}</h2>`);
      continue;
    }
    if (i % (BLOCKS_PER_PAGE * 5) === 10) {
      parts.push(
        '<table><tr><th>Chỉ số</th><th>Giá trị</th></tr>' +
          '<tr><td>I/O</td><td>20 lần nhanh hơn</td></tr>' +
          '<tr><td>Fidelity</td><td>100%</td></tr></table>',
      );
      continue;
    }
    if (i % BLOCKS_PER_PAGE === 15) {
      parts.push('<ul><li>Điểm tối ưu thứ nhất</li><li>Điểm tối ưu thứ hai</li></ul>');
      continue;
    }
    parts.push(`<p>[[${i}]] ${PARA}</p>`);
  }

  return parts.join('');
};

export const seedPerfDoc = async (pages: number): Promise<string> => {
  const now = new Date().toISOString();
  const doc: DocRecord = {
    id: `perf-${pages}p-${Date.now()}`,
    title: `Perf ${pages} trang`,
    kind: 'docs',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    starred: false,
    deletedAt: null,
    content: buildLargeDocHtml(pages),
    pageSetup: {
      paperSize: 'a4',
      orientation: 'portrait',
      margins: { top: 20, right: 15, bottom: 20, left: 15 },
    },
  };
  await documentStore.put(doc);
  const { seedDocYjsState } = await import('@/dev/perf-y-seed.utils');
  await seedDocYjsState(doc.id, doc.content);
  return doc.id;
};

declare global {
  interface Window {
    __seedPerfDoc?: (pages: number) => Promise<string>;
  }
}

// Dev luôn có; prod chỉ bật khi URL chứa ?perfSeed=1 phục vụ benchmark production.
const allowSeed =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('perfSeed'));

if (allowSeed) {
  window.__seedPerfDoc = seedPerfDoc;
}
