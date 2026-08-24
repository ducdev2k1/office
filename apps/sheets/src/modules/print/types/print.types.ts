export type PaperSize = 'a4' | 'a3' | 'letter' | 'legal';
export type PaperOrientation = 'portrait' | 'landscape';
export type PrintRangeOption = 'activeSheet' | 'selection' | 'workbook';
export type ScaleOption = 'fitPage' | 'fitWidth' | 'fitHeight' | '100';
export type MarginOption = 'normal' | 'narrow' | 'wide';

export interface PrintMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PrintSettings {
  paperSize: PaperSize;
  orientation: PaperOrientation;
  range: PrintRangeOption;
  scale: ScaleOption;
  margins: MarginOption;
  showGridlines: boolean;
  showHeaders: boolean;
  selectedRange?: string;
}

export interface PaperDimensionMm {
  width: number;
  height: number;
}
