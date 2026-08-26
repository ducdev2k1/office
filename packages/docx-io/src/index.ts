/// <reference path="./mammoth.d.ts" />
import type { MammothApi } from './mammoth.types';
import { getPartText, unpackOoxml } from '@office/ooxml-core';
import { extractBodyFormatPlan } from './ooxml-to-html/document-formatting.utils';
import {
  injectDirectFormatting,
  injectTableCellShading,
} from './ooxml-to-html/inject-formatting.utils';

export type { MammothApi, MammothConvertInput, MammothConvertResult } from './mammoth.types';
export * from './types';
export * from './writer';
export * from './patch';
export * from './markdown';
export * from './import';
export * from './ooxml-to-html/document-formatting.utils';
export * from './ooxml-to-html/inject-formatting.utils';
export * from './html-to-ooxml/mapper';
export * from './html-to-ooxml/xml.utils';
export * from './html-to-ooxml/media.utils';

const toArrayBuffer = async (input: Blob | ArrayBuffer | Uint8Array): Promise<ArrayBuffer> => {
  if (input instanceof Blob) return input.arrayBuffer();
  if (input instanceof Uint8Array) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  }
  return input;
};

let apiPromise: Promise<MammothApi> | null = null;

const getMammoth = (): Promise<MammothApi> => {
  if (!apiPromise) {
    apiPromise = import('mammoth/mammoth.browser.js')
      .then((mod) => mod.default ?? mod)
      .catch((error) => {
        console.error('[docx-io] failed to load mammoth:', error);
        throw error;
      });
  }
  return apiPromise;
};

/** Convert file .docx sang HTML (TipTap-compatible) — engine dang dung la mammoth. */
export const convertDocxToHtml = async (
  input: Blob | ArrayBuffer | Uint8Array,
): Promise<string> => {
  const mammoth = await getMammoth();
  try {
    const arrayBuffer = await toArrayBuffer(input);
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return withDirectFormatting(result.value, arrayBuffer);
  } catch (error) {
    console.error('[docx-io] convertDocxToHtml failed:', error);
    throw error;
  }
};

const withDirectFormatting = async (html: string, arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    const pkg = await unpackOoxml(new Uint8Array(arrayBuffer));
    const documentXml = getPartText(pkg, 'word/document.xml') ?? '';
    if (!documentXml) return html;
    const withBlocks = injectDirectFormatting(html, extractBodyFormatPlan(documentXml));
    return injectTableCellShading(withBlocks, documentXml);
  } catch {
    return html;
  }
};

/** Trich xuat van ban thuan (khong dinh dang) tu file .docx. */
export const convertDocxToText = async (
  input: Blob | ArrayBuffer | Uint8Array,
): Promise<string> => {
  const mammoth = await getMammoth();
  const result = await mammoth.extractRawText({ arrayBuffer: await toArrayBuffer(input) });
  return result.value;
};
