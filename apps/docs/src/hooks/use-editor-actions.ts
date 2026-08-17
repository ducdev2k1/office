import type { Editor } from '@tiptap/core';
import { compressImage, MAX_IMAGE_DATA_URL_LENGTH } from '@/editor/image-utils';
import { downloadFile } from '@/lib/utils';
import type { DocRecord } from '@/types';

export interface EditorActions {
  setLink: () => void;
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
    const url = window.prompt('Nhap URL', previousUrl ?? 'https://');
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const exportHtml = (): void => {
    if (!activeDoc || !editor) return;
    downloadFile(
      `${activeDoc.title}.html`,
      `<!doctype html><html><head><meta charset="utf-8"><title>${activeDoc.title}</title></head><body>${editor.getHTML()}</body></html>`,
      'text/html;charset=utf-8',
    );
  };

  const exportText = (): void => {
    if (activeDoc && editor)
      downloadFile(
        `${activeDoc.title}.txt`,
        editor.state.doc.textContent,
        'text/plain;charset=utf-8',
      );
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
          /* giu anh goc */
        }
      }
      if (src.length > MAX_IMAGE_DATA_URL_LENGTH) {
        window.alert('Anh qua lon (>1MB) sau khi nen');
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
    exportHtml,
    exportText,
    handleImageUpload,
    handleInsertTable,
    handleInsertPageBreak,
  };
};
