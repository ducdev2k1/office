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
  handleInsertTable: (rows?: number, cols?: number) => void;
  handleInsertPageBreak: () => void;
  handleInsertSectionBreak: (type?: 'next-page' | 'continuous') => void;
  handleInsertBookmark: () => void;
  handleInsertMath: (tex: string, isBlock?: boolean) => void;
  handleInsertFootnote: (content?: string) => void;
  handleInsertColumns: (cols?: number) => void;
  handleInsertChart: (attrs?: any) => void;
  handleInsertCallout: (type?: 'info' | 'tip' | 'warning' | 'danger') => void;
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

  const handleInsertTable = (rows = 3, cols = 3): void => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  const handleInsertPageBreak = (): void => {
    editor?.chain().focus().setPageBreak().run();
  };

  const handleInsertSectionBreak = (type: 'next-page' | 'continuous' = 'next-page'): void => {
    (editor?.chain().focus() as unknown as { setSectionBreak: (opts: { type: string }) => { run: () => boolean } })
      ?.setSectionBreak({ type })
      ?.run();
  };

  const handleInsertBookmark = (): void => {
    const name = window.prompt('Nhập tên dấu trang (Bookmark)', 'Dấu trang 1');
    if (name === null) return;
    (editor?.chain().focus() as unknown as { setBookmark: (name?: string) => { run: () => boolean } })
      ?.setBookmark(name)
      ?.run();
  };

  const handleInsertMath = (tex: string, isBlock = false): void => {
    if (isBlock) {
      (editor?.chain().focus() as unknown as { setMathBlock: (opts: { tex: string }) => { run: () => boolean } })
        ?.setMathBlock({ tex })
        ?.run();
    } else {
      (editor?.chain().focus() as unknown as { setMathInline: (opts: { tex: string }) => { run: () => boolean } })
        ?.setMathInline({ tex })
        ?.run();
    }
  };

  const handleInsertFootnote = (content?: string): void => {
    const note = content || window.prompt('Nhập nội dung chú thích cuối trang (Footnote)', 'Chú thích...');
    if (note === null) return;
    (editor?.chain().focus() as unknown as { setFootnote: (opts: { content: string }) => { run: () => boolean } })
      ?.setFootnote({ content: note })
      ?.run();
  };

  const handleInsertColumns = (cols = 2): void => {
    (editor?.chain().focus() as unknown as { setColumns: (opts: { cols: number }) => { run: () => boolean } })
      ?.setColumns({ cols })
      ?.run();
  };

  const handleInsertChart = (attrs?: any): void => {
    (editor?.chain().focus() as unknown as { insertChart: (attrs?: any) => { run: () => boolean } })
      ?.insertChart(attrs)
      ?.run();
  };

  const handleInsertCallout = (type: 'info' | 'tip' | 'warning' | 'danger' = 'info'): void => {
    (editor?.chain().focus() as unknown as { setCallout: (opts: { type: string }) => { run: () => boolean } })
      ?.setCallout({ type })
      ?.run();
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
    handleInsertSectionBreak,
    handleInsertBookmark,
    handleInsertMath,
    handleInsertFootnote,
    handleInsertColumns,
    handleInsertChart,
    handleInsertCallout,
  };
};
