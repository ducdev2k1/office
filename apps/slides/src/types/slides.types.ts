import type { FileRecord } from '@office/file-home';
import type { StoredDocument } from '@office/storage-adapter';

export type SlideElementType = 'text' | 'shape' | 'image' | 'table' | 'line';

export type SlideShapeKind =
  | 'rect'
  | 'rounded'
  | 'circle'
  | 'triangle'
  | 'right-triangle'
  | 'diamond'
  | 'parallelogram'
  | 'trapezoid'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'star-6'
  | 'arrow'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'callout'
  | 'cloud'
  | 'heart';

export type SlideLineKind = 'straight' | 'arrow' | 'double-arrow' | 'elbow' | 'curved';

export type SlideLineDash = 'solid' | 'dashed' | 'dotted';

export type SlideTransitionType =
  'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'zoom' | 'flip-3d' | 'cube-3d';

export type SlideAnimationType =
  | 'none'
  | 'fade-in'
  | 'fly-in-left'
  | 'fly-in-right'
  | 'fly-in-up'
  | 'fly-in-down'
  | 'zoom-in'
  | 'spin';

export type SlideLayoutType =
  | 'title'
  | 'title-body'
  | 'section-header'
  | 'two-column'
  | 'title-only'
  | 'one-column'
  | 'comparison'
  | 'blank';

export interface SlideTableData {
  rows: number;
  cols: number;
  cells: string[][];
  headerRow?: boolean;
  cellFills?: string[][];
}

export interface SlideElement {
  id: string;
  type: SlideElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  content?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  shapeKind?: SlideShapeKind;
  lineKind?: SlideLineKind;
  lineDash?: SlideLineDash;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  color?: string;
  highlightColor?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  listType?: 'none' | 'bullet' | 'number';
  url?: string;
  opacity?: number;
  flipH?: boolean;
  flipV?: boolean;
  tableData?: SlideTableData;
  animation?: SlideAnimationType;
  animationOrder?: number;
  animationDuration?: number;
  animationDelay?: number;
}

export interface SlideItem {
  id: string;
  title?: string;
  background?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  layout?: SlideLayoutType;
  transition?: SlideTransitionType;
  transitionDuration?: number;
  notes?: string;
  elements: SlideElement[];
}

export interface SlideDeckData {
  id: string;
  name?: string;
  ratio?: '16:9' | '4:3';
  slides: SlideItem[];
}

export interface SlideDocRecord extends FileRecord, StoredDocument {
  data?: SlideDeckData;
}
