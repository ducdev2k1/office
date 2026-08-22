export interface DocxExportOptions {
  title?: string;
  author?: string;
  originalDocxBuffer?: ArrayBuffer | Uint8Array | Blob;
}

export interface DocxMediaItem {
  id: string;
  target: string;
  data: Uint8Array;
  contentType: string;
  widthPx: number;
  heightPx: number;
}

export interface DocxRelationship {
  id: string;
  type: string;
  target: string;
  targetMode?: 'External';
}

export interface DocxFootnoteItem {
  id: number;
  content: string;
}

export interface OoxmlConversionResult {
  bodyXml: string;
  relationships: DocxRelationship[];
  media: DocxMediaItem[];
  footnotes: DocxFootnoteItem[];
}
