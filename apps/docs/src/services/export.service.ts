import { exportDocx, exportMarkdown } from '@office/docx-io';
import { getDocxSource } from '@/services/docs.service';
import type { DocRecord } from '@/types/docs.types';
import { downloadFile } from '@/utils/dom.utils';
import type { Editor } from '@tiptap/core';

export const exportDocxDocument = async (
  doc: DocRecord | undefined,
  editor: Editor | null,
): Promise<void> => {
  if (!doc) return;

  const html = editor?.getHTML() ?? doc.content ?? '<p></p>';
  const docxSource = await getDocxSource(doc.id);
  const originalBuffer = docxSource?.blob;

  const docxBytes = await exportDocx(html, {
    title: doc.title,
    originalDocxBuffer: originalBuffer,
  });

  const blob = new Blob([docxBytes as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${doc.title || 'Tai-lieu'}.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const exportMarkdownDocument = (
  doc: DocRecord | undefined,
  editor: Editor | null,
): void => {
  if (!doc) return;

  const html = editor?.getHTML() ?? doc.content ?? '<p></p>';
  const markdown = exportMarkdown(html);

  downloadFile(`${doc.title || 'Tai-lieu'}.md`, markdown, 'text/markdown;charset=utf-8');
};

export const exportHtmlDocument = (
  doc: DocRecord | undefined,
  editor: Editor | null,
): void => {
  if (!doc) return;

  const html = editor?.getHTML() ?? doc.content ?? '<p></p>';
  const fullHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background-color: #f1f5f9; }
    blockquote { border-left: 4px solid #cbd5e1; margin: 1em 0; padding-left: 1em; color: #64748b; }
    code { background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    pre { background-color: #f1f5f9; padding: 12px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  downloadFile(`${doc.title || 'Tai-lieu'}.html`, fullHtml, 'text/html;charset=utf-8');
};

export const exportTextDocument = (
  doc: DocRecord | undefined,
  editor: Editor | null,
): void => {
  if (!doc) return;
  const text = editor?.state?.doc?.textContent ?? '';
  downloadFile(`${doc.title || 'Tai-lieu'}.txt`, text, 'text/plain;charset=utf-8');
};

export const exportPdfDocument = (onPrint: () => void): void => {
  onPrint();
};
