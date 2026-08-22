import type { DocxFootnoteItem } from '../types';
import { escapeXml } from './xml.utils';

export const FOOTNOTES_REL_TYPE =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes';

export const FOOTNOTES_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml';

export const buildFootnotesXml = (footnotes: DocxFootnoteItem[]): string => {
  const entries = footnotes
    .map(
      (fn) => `  <w:footnote w:id="${fn.id}">
    <w:p>
      <w:pPr><w:pStyle w:val="FootnoteText"/></w:pPr>
      <w:r><w:rPr><w:rStyle w:val="FootnoteReference"/><w:vertAlign w:val="superscript"/></w:rPr><w:footnoteRef/></w:r>
      <w:r><w:t xml:space="preserve"> ${escapeXml(fn.content)}</w:t></w:r>
    </w:p>
  </w:footnote>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:footnote w:type="separator" w:id="-1">
    <w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:separator/></w:r></w:p>
  </w:footnote>
  <w:footnote w:type="continuationSeparator" w:id="0">
    <w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:continuationSeparator/></w:r></w:p>
  </w:footnote>
${entries}
</w:footnotes>`;
};

export const ensureFootnotesOverride = (contentTypesXml: string): string => {
  if (contentTypesXml.includes('PartName="/word/footnotes.xml"')) return contentTypesXml;
  return contentTypesXml.replace(
    '</Types>',
    `  <Override PartName="/word/footnotes.xml" ContentType="${FOOTNOTES_CONTENT_TYPE}"/>\n</Types>`,
  );
};

export const ensureFootnotesRelationship = (relsXml: string): string => {
  if (relsXml.includes(FOOTNOTES_REL_TYPE)) return relsXml;
  return relsXml.replace(
    '</Relationships>',
    `  <Relationship Id="rIdFootnotes" Type="${FOOTNOTES_REL_TYPE}" Target="footnotes.xml"/>\n</Relationships>`,
  );
};
