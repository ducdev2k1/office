import { repackOoxml, setPartBytes, setPartText } from '@office/ooxml-core';
import { OoxmlMapper } from './html-to-ooxml/mapper';
import { patchDocx } from './patch';
import {
  getContentTypesXml,
  getDocumentRelsXml,
  getDocumentXml,
  getFontTableXml,
  getNumberingXml,
  getRelsXml,
  getSettingsXml,
  getStylesXml,
} from './templates/default-parts';
import type { DocxExportOptions } from './types';

export const exportDocx = async (
  html: string,
  options: DocxExportOptions = {},
): Promise<Uint8Array> => {
  const mapper = new OoxmlMapper();
  const { bodyXml, relationships, media } = mapper.convert(html);

  if (options.originalDocxBuffer) {
    return patchDocx(options.originalDocxBuffer, bodyXml, relationships, media);
  }

  // Generate clean standalone .docx package
  const pkg = {
    parts: new Map<string, Uint8Array>(),
    partOrder: [
      '[Content_Types].xml',
      '_rels/.rels',
      'word/_rels/document.xml.rels',
      'word/document.xml',
      'word/styles.xml',
      'word/numbering.xml',
      'word/settings.xml',
      'word/fontTable.xml',
    ],
  };

  setPartText(pkg, '[Content_Types].xml', getContentTypesXml(media));
  setPartText(pkg, '_rels/.rels', getRelsXml());
  setPartText(pkg, 'word/_rels/document.xml.rels', getDocumentRelsXml(relationships));
  setPartText(pkg, 'word/document.xml', getDocumentXml(bodyXml));
  setPartText(pkg, 'word/styles.xml', getStylesXml());
  setPartText(pkg, 'word/numbering.xml', getNumberingXml());
  setPartText(pkg, 'word/settings.xml', getSettingsXml());
  setPartText(pkg, 'word/fontTable.xml', getFontTableXml());

  for (const item of media) {
    setPartBytes(pkg, `word/${item.target}`, item.data);
  }

  return repackOoxml(pkg);
};
