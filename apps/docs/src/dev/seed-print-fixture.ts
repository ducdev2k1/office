import { documentStore } from '@/services/docs.service';
import type { DocRecord, Orientation, PageMargins, PaperSize } from '@/types/docs.types';

export interface SeedDocSpec {
  /** Số paragraph tự động sinh. Mỗi paragraph mở đầu bằng `[[N]]`. */
  blocks: number;
  paperSize?: PaperSize;
  orientation?: Orientation;
  margins?: Partial<PageMargins>;
  /** Chèn page break sau các block index liệt kê (1-based). */
  pageBreaks?: number[];
  /** Chèn ảnh cao (SVG data URI) tại các block index liệt kê (1-based). */
  tallImages?: number[];
}

const DEFAULT_CONTENT = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
].join(' ');

const PAGE_BREAK_HTML = '<div data-type="page-break"></div>';

const TALL_IMAGE_HTML =
  '<img src="data:image/svg+xml;charset=utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="2400">' +
      '<rect width="100%" height="100%" fill="#e8eaed"/>' +
      '<text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#5f6368">tall</text>' +
      '</svg>',
  ) +
  '" alt="tall-block" />';

export const seedPrintFixture = async (spec: SeedDocSpec): Promise<string> => {
  const {
    blocks,
    paperSize = 'a4',
    orientation = 'portrait',
    margins,
    pageBreaks = [],
    tallImages = [],
  } = spec;
  const now = new Date().toISOString();
  const parts: string[] = ['<h1>Print Fidelity Fixture</h1>'];

  for (let i = 1; i <= blocks; i += 1) {
    if (tallImages.includes(i)) {
      parts.push(`<p>[[${i}]] tall block</p>${TALL_IMAGE_HTML}`);
      continue;
    }
    parts.push(`<p>[[${i}]] ${DEFAULT_CONTENT}</p>`);
    if (pageBreaks.includes(i)) parts.push(PAGE_BREAK_HTML);
  }

  const doc: DocRecord = {
    id: `fixture-${Date.now()}`,
    title: `Fixture ${blocks} blocks`,
    kind: 'docs',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    starred: false,
    deletedAt: null,
    content: parts.join(''),
    pageSetup: {
      paperSize,
      orientation,
      margins: {
        top: 20,
        right: 15,
        bottom: 20,
        left: 15,
        ...margins,
      },
    },
  };

  await documentStore.put(doc);
  return doc.id;
};

declare global {
  interface Window {
    __seedDoc?: (spec: SeedDocSpec) => Promise<string>;
  }
}

if (import.meta.env.DEV) {
  window.__seedDoc = seedPrintFixture;
}