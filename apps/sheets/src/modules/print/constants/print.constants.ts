import type {
  MarginOption,
  PaperDimensionMm,
  PaperSize,
  PrintMargins,
  PrintSettings,
} from '@/modules/print/types/print.types';

export const PAPER_DIMENSIONS_MM: Record<PaperSize, PaperDimensionMm> = {
  a4: { width: 210, height: 297 },
  a3: { width: 297, height: 420 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
};

export const PRINT_MARGINS_MM: Record<MarginOption, PrintMargins> = {
  normal: { top: 15, bottom: 15, left: 15, right: 15 },
  narrow: { top: 8, bottom: 8, left: 8, right: 8 },
  wide: { top: 25, bottom: 25, left: 25, right: 25 },
};

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  paperSize: 'a4',
  orientation: 'portrait',
  range: 'activeSheet',
  scale: 'fitWidth',
  margins: 'normal',
  showGridlines: true,
  showHeaders: true,
};
