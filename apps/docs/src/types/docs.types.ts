export type PaperSize = 'a4' | 'a5' | 'letter';
export type Orientation = 'portrait' | 'landscape';
export type HFAlign = 'left' | 'center' | 'right';

export interface HeaderFooterSlot {
  left: string;
  center: string;
  right: string;
}

export interface PageNumberSetup {
  enabled: boolean;
  position: 'header' | 'footer';
  align: HFAlign;
  format: string;
  startAt: number;
  skipFirstPage: boolean;
}

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageSetup {
  paperSize: PaperSize;
  orientation: Orientation;
  margins: PageMargins;
  header?: HeaderFooterSlot;
  footer?: HeaderFooterSlot;
  headerMargin?: number;
  footerMargin?: number;
  pageNumber?: PageNumberSetup;
}

export type DocSourceType = 'docx';

export interface DocRecord {
  id: string;
  title: string;
  kind: 'docs';
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  starred: boolean;
  deletedAt: string | null;
  content: string;
  pageSetup?: PageSetup;
  /** Danh dau doc duoc mo tu file (luu byte goc o docxSourceStore). */
  sourceType?: DocSourceType;
}

export const PAPER_SIZES: Record<PaperSize, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  letter: { width: 216, height: 279 },
};

export const DEFAULT_PAGE_NUMBER_SETUP = (): PageNumberSetup => ({
  enabled: false,
  position: 'footer',
  align: 'center',
  format: '{page}',
  startAt: 1,
  skipFirstPage: false,
});

export const DEFAULT_HEADER_FOOTER_SLOT = (): HeaderFooterSlot => ({
  left: '',
  center: '',
  right: '',
});

export const DEFAULT_PAGE_SETUP = (): PageSetup => ({
  paperSize: 'a4',
  orientation: 'portrait',
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
  header: DEFAULT_HEADER_FOOTER_SLOT(),
  footer: DEFAULT_HEADER_FOOTER_SLOT(),
  headerMargin: 10,
  footerMargin: 10,
  pageNumber: DEFAULT_PAGE_NUMBER_SETUP(),
});

export const mmToPx = (mm: number | undefined | null): number =>
  typeof mm === 'number' && Number.isFinite(mm) ? Math.round((mm * 96) / 25.4) : 0;

export const getPaperSizePx = (setup: PageSetup): { width: number; height: number } => {
  const { width, height } = PAPER_SIZES[setup.paperSize] ?? PAPER_SIZES.a4;
  return setup.orientation === 'landscape'
    ? { width: mmToPx(height), height: mmToPx(width) }
    : { width: mmToPx(width), height: mmToPx(height) };
};
