import type { Editor } from '@tiptap/core';
import { compressImage, MAX_IMAGE_DATA_URL_LENGTH } from '@/modules/editor/utils/image.utils';
import {
  exportDocxDocument,
  exportHtmlDocument,
  exportMarkdownDocument,
  exportTextDocument,
} from '@/services/export.service';
import type { DocRecord } from '@/types/docs.types';

export interface EditorActions {
  setLink: () => void;
  exportDocx: () => Promise<void>;
  exportMarkdown: () => void;
  exportHtml: () => void;
  exportText: () => void;
  handleImageUpload: (file: File) => void;
  handleInsertTable: () => void;
  handleInsertPageBreak: () => void;
}

export const useEditorActions = (
  editor: Editor | null,
  activeDoc: DocRecord | undefined,
): EditorActions => {
  const setLink = (): void => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Nhập URL', previousUrl ?? 'https://');
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const exportDocx = async (): Promise<void> => {
    await exportDocxDocument(activeDoc, editor);
  };

  const exportMarkdown = (): void => {
    exportMarkdownDocument(activeDoc, editor);
  };

  const exportHtml = (): void => {
    exportHtmlDocument(activeDoc, editor);
  };

  const exportText = (): void => {
    exportTextDocument(activeDoc, editor);
  };

  const handleImageUpload = (file: File): void => {
    if (!file.type.startsWith('image/') || !editor) return;
    const reader = new FileReader();
    reader.onload = async () => {
      let src = reader.result as string;
      if (src.length > MAX_IMAGE_DATA_URL_LENGTH) {
        try {
          src = await compressImage(src);
        } catch {
          /* keep original */
        }
      }
      if (src.length > MAX_IMAGE_DATA_URL_LENGTH) {
        window.alert('Ảnh quá lớn (>1MB) sau khi nén');
        return;
      }
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };

  const handleInsertTable = (): void => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handleInsertPageBreak = (): void => {
    editor?.chain().focus().setPageBreak().run();
  };

  return {
    setLink,
    exportDocx,
    exportMarkdown,
    exportHtml,
    exportText,
    handleImageUpload,
    handleInsertTable,
    handleInsertPageBreak,
  };
};
