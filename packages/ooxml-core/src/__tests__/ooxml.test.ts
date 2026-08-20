import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import {
  unpackOoxml,
  repackOoxml,
  getPartText,
  setPartText,
  getPartBytes,
  setPartBytes,
  hasPart,
  deletePart,
  listParts,
} from '../index';

describe('ooxml-core', () => {
  it('should unpack and repack zip preserving parts and content', async () => {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
    zip.file('word/document.xml', '<w:document><w:body><w:p><w:r><w:t>Hello</w:t></w:r></w:p></w:body></w:document>');
    zip.file('word/media/image1.png', new Uint8Array([1, 2, 3, 4]));

    const buffer = await zip.generateAsync({ type: 'uint8array' });

    const pkg = await unpackOoxml(buffer);
    expect(listParts(pkg)).toEqual([
      '[Content_Types].xml',
      'word/document.xml',
      'word/media/image1.png',
    ]);
    expect(hasPart(pkg, 'word/document.xml')).toBe(true);
    expect(hasPart(pkg, 'non-existent')).toBe(false);

    const docText = getPartText(pkg, 'word/document.xml');
    expect(docText).toContain('Hello');

    // Modify part
    setPartText(pkg, 'word/document.xml', '<w:document><w:body><w:p><w:r><w:t>World</w:t></w:r></w:p></w:body></w:document>');
    expect(getPartText(pkg, 'word/document.xml')).toContain('World');

    // Add new part
    setPartText(pkg, 'word/footer1.xml', '<w:ftr><w:p><w:r><w:t>Footer</w:t></w:r></w:p></w:ftr>');
    expect(hasPart(pkg, 'word/footer1.xml')).toBe(true);

    // Repack
    const repacked = await repackOoxml(pkg);
    const reloaded = await unpackOoxml(repacked);

    expect(getPartText(reloaded, 'word/document.xml')).toContain('World');
    expect(getPartText(reloaded, 'word/footer1.xml')).toContain('Footer');
    expect(getPartBytes(reloaded, 'word/media/image1.png')).toEqual(new Uint8Array([1, 2, 3, 4]));

    // Delete part
    expect(deletePart(reloaded, 'word/footer1.xml')).toBe(true);
    expect(hasPart(reloaded, 'word/footer1.xml')).toBe(false);
  });
});
