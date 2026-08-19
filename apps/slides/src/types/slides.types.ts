import type { FileRecord } from '@office/file-home';
import type { StoredDocument } from '@office/storage-adapter';

export type SlideElementType = 'text' | 'shape' | 'image' | 'table';

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
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  url?: string;
}

export interface SlideItem {
  id: string;
  title?: string;
  background?: string;
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
