import JSZip from 'jszip';
import type { SlideDeckData, SlideElement, SlideItem } from '../types';
import { formatToOoxmlHex } from '../utils/color.utils';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const EMU_WIDTH_16_9 = 12192000;
const EMU_HEIGHT_16_9 = 6858000;

const escapeXml = (str = ''): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toEmuX = (x: number): number => Math.round((x / CANVAS_WIDTH) * EMU_WIDTH_16_9);
const toEmuY = (y: number): number => Math.round((y / CANVAS_HEIGHT) * EMU_HEIGHT_16_9);
const toEmuCx = (w: number): number => Math.round((w / CANVAS_WIDTH) * EMU_WIDTH_16_9);
const toEmuCy = (h: number): number => Math.round((h / CANVAS_HEIGHT) * EMU_HEIGHT_16_9);

const mapGeomPrst = (kind?: string): string => {
  switch (kind) {
    case 'circle':
      return 'ellipse';
    case 'rounded':
      return 'roundRect';
    case 'triangle':
      return 'triangle';
    case 'arrow':
      return 'rightArrow';
    case 'star':
      return 'star5';
    default:
      return 'rect';
  }
};

const renderElementXml = (el: SlideElement, idNum: number): string => {
  const x = toEmuX(el.x);
  const y = toEmuY(el.y);
  const cx = toEmuCx(el.width);
  const cy = toEmuCy(el.height);
  const hexColor = formatToOoxmlHex(el.color, '0F172A');
  const hexFill = el.fill ? formatToOoxmlHex(el.fill, 'FFFFFF') : undefined;
  const fontSizeHundredths = el.fontSize ? Math.round(el.fontSize * 100) : 2000;
  const alignAttr = el.align === 'center' ? ' algn="ctr"' : el.align === 'right' ? ' algn="r"' : '';
  const isBold = el.fontWeight === 'bold' ? '1' : '0';
  const isItalic = el.fontStyle === 'italic' ? '1' : '0';
  const underlineAttr = el.textDecoration === 'underline' ? 'sng' : 'none';
  const geom = mapGeomPrst(el.shapeKind);

  const paragraphs = (el.content || '')
    .split('\n')
    .map(
      (line) => `
        <a:p>
          <a:pPr${alignAttr}/>
          <a:r>
            <a:rPr lang="vi-VN" sz="${fontSizeHundredths}" b="${isBold}" i="${isItalic}" u="${underlineAttr}">
              <a:solidFill>
                <a:srgbClr val="${hexColor}"/>
              </a:solidFill>
            </a:rPr>
            <a:t>${escapeXml(line)}</a:t>
          </a:r>
        </a:p>`,
    )
    .join('');

  return `
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="${idNum}" name="Element ${idNum}"/>
        <p:cNvSpPr txBox="${el.type === 'text' ? '1' : '0'}"/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="${x}" y="${y}"/>
          <a:ext cx="${cx}" cy="${cy}"/>
        </a:xfrm>
        <a:prstGeom prst="${geom}">
          <a:avLst/>
        </a:prstGeom>
        ${hexFill ? `<a:solidFill><a:srgbClr val="${hexFill}"/></a:solidFill>` : '<a:noFill/>'}
      </p:spPr>
      <p:txBody>
        <a:bodyPr wrap="square" rtlCol="0">
          <a:spAutoFit/>
        </a:bodyPr>
        <a:lstStyle/>
        ${paragraphs || '<a:p><a:endParaRPr lang="vi-VN"/></a:p>'}
      </p:txBody>
    </p:sp>`;
};

const renderSlideXml = (slide: SlideItem): string => {
  const elementsXml = slide.elements
    .map((el, idx) => renderElementXml(el, idx + 2))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      ${elementsXml}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`;
};

export const generatePptxBuffer = async (deck: SlideDeckData): Promise<Uint8Array> => {
  const zip = new JSZip();
  const slides = deck.slides.length > 0 ? deck.slides : [{ id: 's1', elements: [] }];

  // [Content_Types].xml
  const slideOverrides = slides
    .map(
      (_, i) =>
        `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
    )
    .join('');

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slideOverrides}
</Types>`,
  );

  // _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`,
  );

  // ppt/_rels/presentation.xml.rels
  const presRels = slides
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`,
    )
    .join('');

  zip.file(
    'ppt/_rels/presentation.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRels}
</Relationships>`,
  );

  // ppt/presentation.xml
  const sldIds = slides
    .map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`)
    .join('');

  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
    ${sldIds}
  </p:sldIdLst>
  <p:sldSz cx="${EMU_WIDTH_16_9}" cy="${EMU_HEIGHT_16_9}" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`,
  );

  // ppt/slides/slide{N}.xml
  for (let i = 0; i < slides.length; i++) {
    zip.file(`ppt/slides/slide${i + 1}.xml`, renderSlideXml(slides[i]!));
  }

  const generated = await zip.generateAsync({ type: 'uint8array' });
  return generated;
};

export const generatePptxBlob = async (deck: SlideDeckData): Promise<Blob> => {
  const buffer = await generatePptxBuffer(deck);
  return new Blob([buffer as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
};
