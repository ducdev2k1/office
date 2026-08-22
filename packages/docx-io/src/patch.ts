import {
  getPartText,
  repackOoxml,
  setPartBytes,
  setPartText,
  unpackOoxml,
} from '@office/ooxml-core';
import {
  buildFootnotesXml,
  ensureFootnotesOverride,
  ensureFootnotesRelationship,
} from './html-to-ooxml/footnotes.utils';
import type { DocxFootnoteItem, DocxMediaItem, DocxRelationship } from './types';

export const patchDocx = async (
  originalBuffer: ArrayBuffer | Uint8Array | Blob,
  bodyXml: string,
  relationships: DocxRelationship[] = [],
  media: DocxMediaItem[] = [],
  footnotes: DocxFootnoteItem[] = [],
): Promise<Uint8Array> => {
  const pkg = await unpackOoxml(originalBuffer);

  const originalDocXml = getPartText(pkg, 'word/document.xml') ?? '';

  // Extract original sectPr to preserve page geometry, margins, headers, footers
  let sectPrXml =
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/><w:cols w:space="720"/></w:sectPr>';
  const sectMatch = originalDocXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
  if (sectMatch) {
    sectPrXml = sectMatch[0];
  }

  // Build patched document.xml
  let patchedDocXml: string;
  const docHeaderMatch = originalDocXml.match(/<w:document[\s\S]*?<w:body>/);
  if (docHeaderMatch) {
    const headerPart = docHeaderMatch[0];
    patchedDocXml = `${headerPart}\n${bodyXml}\n${sectPrXml}\n</w:body></w:document>`;
  } else {
    patchedDocXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXml}
    ${sectPrXml}
  </w:body>
</w:document>`;
  }

  setPartText(pkg, 'word/document.xml', patchedDocXml);

  // Update word/_rels/document.xml.rels
  if (relationships.length > 0) {
    const existingRelsXml = getPartText(pkg, 'word/_rels/document.xml.rels');
    if (existingRelsXml && existingRelsXml.includes('</Relationships>')) {
      const relNodes = relationships
        .map(
          (r) =>
            `<Relationship Id="${r.id}" Type="${r.type}" Target="${r.target}" ${r.targetMode ? `TargetMode="${r.targetMode}"` : ''}/>`,
        )
        .join('\n  ');
      const updatedRelsXml = existingRelsXml.replace(
        '</Relationships>',
        `  ${relNodes}\n</Relationships>`,
      );
      setPartText(pkg, 'word/_rels/document.xml.rels', updatedRelsXml);
    } else {
      const newRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${relationships
    .map(
      (r) =>
        `<Relationship Id="${r.id}" Type="${r.type}" Target="${r.target}" ${r.targetMode ? `TargetMode="${r.targetMode}"` : ''}/>`,
    )
    .join('\n  ')}
</Relationships>`;
      setPartText(pkg, 'word/_rels/document.xml.rels', newRelsXml);
    }
  }

  // Add media parts
  for (const item of media) {
    setPartBytes(pkg, `word/${item.target}`, item.data);
  }

  // Inject footnotes part when the converted body references footnotes
  if (footnotes.length > 0) {
    setPartText(pkg, 'word/footnotes.xml', buildFootnotesXml(footnotes));
    const ct = getPartText(pkg, '[Content_Types].xml');
    if (ct) setPartText(pkg, '[Content_Types].xml', ensureFootnotesOverride(ct));
    const rels = getPartText(pkg, 'word/_rels/document.xml.rels');
    if (rels) setPartText(pkg, 'word/_rels/document.xml.rels', ensureFootnotesRelationship(rels));
  }

  // Update [Content_Types].xml for image overrides if needed
  if (media.length > 0) {
    const existingContentTypes = getPartText(pkg, '[Content_Types].xml');
    if (existingContentTypes && existingContentTypes.includes('</Types>')) {
      const overrides = media
        .map((m) => `<Override PartName="/word/${m.target}" ContentType="${m.contentType}"/>`)
        .join('\n  ');
      const updatedContentTypes = existingContentTypes.replace(
        '</Types>',
        `  ${overrides}\n</Types>`,
      );
      setPartText(pkg, '[Content_Types].xml', updatedContentTypes);
    }
  }

  return repackOoxml(pkg);
};
