import { escapeXml } from './html-to-ooxml/xml.utils';

export const importText = (text: string): string => {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const paragraphs = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return '<p></p>';
    }
    return `<p>${escapeXml(line)}</p>`;
  });

  return paragraphs.join('') || '<p></p>';
};

export const importHtml = (html: string): string => {
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    cleaned = bodyMatch[1];
  }

  return cleaned.trim() || '<p></p>';
};
