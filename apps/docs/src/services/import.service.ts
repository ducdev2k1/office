import { convertDocxToHtml } from '@office/docx-io';
import { saveDocxSource } from '@/services/docs.service';
import { DEFAULT_PAGE_SETUP, type DocRecord } from '@/types/docs.types';

const stripExtension = (name: string): string => name.replace(/\.[^/.]+$/, '');

/**
 * Mo file .docx tren may: convert sang HTML (TipTap-compatible), tao DocRecord moi
 * va giu nguyen byte goc trong docxSourceStore de phuc vu export / save cloud sau nay.
 */
export const importDocxFile = async (file: File): Promise<DocRecord> => {
  try {
    const html = await convertDocxToHtml(file);
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
