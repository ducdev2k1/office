import type { BorderStyleTypes, BorderType, FUniver } from '@univerjs/presets';

export type TextWrapMode = 'overflow' | 'wrap' | 'clip';
export type TextRotationAngle = 0 | 45 | -45 | 90 | -90 | 270;

export interface CopiedFormat {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textColor?: string;
  fillColor?: string;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  wrap?: boolean;
  numberFormat?: string;
}

export interface ToolbarState {
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  textColor: string;
  fillColor: string;
  horizontalAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  wrap: boolean;
  wrapMode: TextWrapMode;
  textRotation: TextRotationAngle;
  isMerged: boolean;
  numberFormat: string;
  zoom: number;
  isPaintingFormat: boolean;
  borderColor: string;
  borderStyle: BorderStyleTypes;
  borderType?: BorderType;
}

export interface SheetsToolbarActions {
  undo: () => void;
  redo: () => void;
  onPrint?: () => void;
  togglePaintFormat: () => void;
  setZoom: (zoom: number) => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleStrikethrough: () => void;
  setTextColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setHorizontalAlign: (align: 'left' | 'center' | 'right') => void;
  setVerticalAlign: (align: 'top' | 'middle' | 'bottom') => void;
  toggleWrap: () => void;
  setWrapMode: (mode: TextWrapMode) => void;
  setTextRotation: (angle: TextRotationAngle) => void;
  toggleMerge: () => void;
  mergeAll: () => void;
  mergeHorizontal: () => void;
  mergeVertical: () => void;
  unmerge: () => void;
  setNumberFormat: (pattern: string) => void;
  adjustDecimals: (delta: number) => void;
  setBorderColor: (color: string) => void;
  setBorderStyle: (style: BorderStyleTypes) => void;
  applyBorder: (type: BorderType, style?: BorderStyleTypes, color?: string) => void;
  insertFormula: (formula: string) => void;
  insertLink: (url?: string, text?: string) => void;
  insertCheckbox: () => void;
  createFilter: () => void;
  insertChart?: () => void;
  clearFormatting: () => void;
  openFindReplace: () => void;
}

export interface SheetsToolbarProps {
  univerAPI: FUniver | null;
  onPrint?: () => void;
  onInsertChart?: () => void;
  onInsertImage?: () => void;
  onAddComment?: () => void;
  onOpenCommentsSidebar?: () => void;
}
