import { importHtml, importText } from '@office/docx-io';
import { saveDocxSource } from '@/services/docs.service';
import { convertDocxInWorker } from '@/services/docxConvert.service';
import { DEFAULT_PAGE_SETUP, type DocRecord } from '@/types/docs.types';

const stripExtension = (name: string): string => name.replace(/\.[^/.]+$/, '');

/**
 * Mo file .docx tren may: convert sang HTML (TipTap-compatible), tao DocRecord moi
 * va giu nguyen byte goc trong docxSourceStore de phuc vu export / save cloud sau nay.
 */
export const importDocxFile = async (file: File): Promise<DocRecord> => {
  try {
    const html = await convertDocxInWorker(file);
    const content = html.trim() ? html : '<p></p>';
    const now = new Date().toISOString();
    const doc: DocRecord = {
      id: `doc-${crypto.randomUUID()}`,
      title: stripExtension(file.name) || 'Tai lieu tu file',
      kind: 'docs',
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      starred: false,
      deletedAt: null,
      content,
      pageSetup: DEFAULT_PAGE_SETUP(),
      sourceType: 'docx',
    };
    await saveDocxSource(doc.id, file, file.name);
    return doc;
  } catch (error) {
    console.error('[import] importDocxFile failed:', error);
    throw error;
  }
};

/**
 * Mo file van ban thuan (.txt): wrap tung dong thanh paragraph.
 */
export const importTextFile = async (file: File): Promise<DocRecord> => {
  try {
    const text = await file.text();
    const content = importText(text);
    const now = new Date().toISOString();
    return {
      id: `doc-${crypto.randomUUID()}`,
      title: stripExtension(file.name) || 'Tai lieu van ban',
      kind: 'docs',
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      starred: false,
      deletedAt: null,
      content,
      pageSetup: DEFAULT_PAGE_SETUP(),
      sourceType: 'text',
    };
  } catch (error) {
    console.error('[import] importTextFile failed:', error);
    throw error;
  }
};

/**
 * Mo file HTML (.html / .htm): lam sach va nhung vao editor.
 */
export const importHtmlFile = async (file: File): Promise<DocRecord> => {
  try {
    const rawHtml = await file.text();
    const content = importHtml(rawHtml);
    const now = new Date().toISOString();
    return {
      id: `doc-${crypto.randomUUID()}`,
      title: stripExtension(file.name) || 'Tai lieu HTML',
      kind: 'docs',
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      starred: false,
      deletedAt: null,
      content,
      pageSetup: DEFAULT_PAGE_SETUP(),
      sourceType: 'html',
    };
  } catch (error) {
    console.error('[import] importHtmlFile failed:', error);
    throw error;
  }
};

/**
 * Tu dong nhan dien duoi file va goi ham import tuong ung.
 */
export const importAnySupportedFile = async (file: File): Promise<DocRecord> => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.docx')) {
    return importDocxFile(file);
  }
  if (name.endsWith('.html') || name.endsWith('.htm')) {
    return importHtmlFile(file);
  }
  return importTextFile(file);
};
