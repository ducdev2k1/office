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

const PAIRED_DANGEROUS_TAGS_REGEX =
  /<(iframe|object|form|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const VOID_DANGEROUS_TAGS_REGEX = /<(base|meta|link|embed)\b[^>]*\/?>/gi;
const EVENT_HANDLER_ATTR_REGEX = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const QUOTED_BAD_URL_ATTR_REGEX =
  /(\s(?:href|src|xlink:href))\s*=\s*(["'])\s*(?:javascript:|vbscript:|data:text\/html)[^"']*\2/gi;
const UNQUOTED_BAD_URL_ATTR_REGEX = /(\s(?:href|src))\s*=\s*(?:javascript:|vbscript:)[^\s>]*/gi;

export const importHtml = (html: string): string => {
  let cleaned = html
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(PAIRED_DANGEROUS_TAGS_REGEX, '')
    .replace(VOID_DANGEROUS_TAGS_REGEX, '')
    .replace(EVENT_HANDLER_ATTR_REGEX, '')
    .replace(QUOTED_BAD_URL_ATTR_REGEX, '')
    .replace(UNQUOTED_BAD_URL_ATTR_REGEX, '');

  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    cleaned = bodyMatch[1];
  }

  return cleaned.trim() || '<p></p>';
};
