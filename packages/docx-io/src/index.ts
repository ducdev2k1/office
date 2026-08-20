/// <reference path="./mammoth.d.ts" />
import type { MammothApi } from './mammoth.types';

export type { MammothApi, MammothConvertInput, MammothConvertResult } from './mammoth.types';
export * from './types';
export * from './writer';
export * from './patch';
export * from './markdown';
export * from './import';
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
    const result = await mammoth.convertToHtml({ arrayBuffer: await toArrayBuffer(input) });
    return result.value;
  } catch (error) {
    console.error('[docx-io] convertDocxToHtml failed:', error);
    throw error;
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
