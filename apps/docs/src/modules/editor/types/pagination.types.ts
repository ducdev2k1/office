import type { PageSetup, HeaderFooterSlot } from '@/types/docs.types';
import type { PageBreaks } from '@/modules/editor/utils/pagination.utils';

export interface PaginationOptions {
  pageSetup: PageSetup;
  gapHeight?: number;
  maxPages?: number;
  docTitle?: string;
  onPageCountChange?: (pageCount: number) => void;
  onEditBand?: (
    band: 'header' | 'footer',
    pageIndex: number,
    slot: keyof HeaderFooterSlot,
    rect: DOMRect,
  ) => void;
}

export interface PaginationMetrics {
  paperW: number;
  paperH: number;
  marginT: number;
  marginR: number;
  marginB: number;
  marginL: number;
  headerH: number;
  footerH: number;
  headerPaddingTop: number;
  footerPaddingBottom: number;
  usableH: number;
  gapH: number;
}

export interface PaginationPluginState {
  pageCount: number;
  metrics: PaginationMetrics;
  setup: PageSetup;
  docTitle: string;
  isPaged: boolean;
  breaks?: PageBreaks;
}
