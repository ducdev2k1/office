export type PaperSize = 'a4' | 'a5' | 'letter';
export type Orientation = 'portrait' | 'landscape';

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
}

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
}

export const PAPER_SIZES: Record<PaperSize, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  letter: { width: 216, height: 279 },
};

export const DEFAULT_PAGE_SETUP = (): PageSetup => ({
  paperSize: 'a4',
  orientation: 'portrait',
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
});

export const mmToPx = (mm: number): number => Math.round((mm * 96) / 25.4);

export const getPaperSizePx = (setup: PageSetup): { width: number; height: number } => {
  const { width, height } = PAPER_SIZES[setup.paperSize];
  return setup.orientation === 'landscape'
    ? { width: mmToPx(height), height: mmToPx(width) }
    : { width: mmToPx(width), height: mmToPx(height) };
};
