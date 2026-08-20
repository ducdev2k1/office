import { XMLParser } from 'fast-xml-parser';
import JSZip from 'jszip';
import type { SlideDeckData, SlideElement, SlideItem } from '../types';
import { parseOoxmlColor } from '../utils/color.utils';

const EMU_PER_INCH = 914400;
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
});

const asArray = <T>(item: T | T[] | undefined): T[] => {
  if (item === undefined) return [];
  return Array.isArray(item) ? item : [item];
};

const extractTextFromTxBody = (
  txBody: any,
): { text: string; fontSize?: number; color?: string; align?: 'left' | 'center' | 'right' } => {
  if (!txBody) return { text: '' };

  const paragraphs = asArray(txBody['a:p']);
  const lines: string[] = [];
  let firstFontSize: number | undefined;
  let firstColor: string | undefined;
  let firstAlign: 'left' | 'center' | 'right' = 'left';

  for (const p of paragraphs) {
    if (!p) continue;
    const pPr = p['a:pPr'];
    if (pPr?.['@_algn']) {
      const algn = pPr['@_algn'];
      if (algn === 'ctr') firstAlign = 'center';
      else if (algn === 'r') firstAlign = 'right';
      else if (algn === 'l') firstAlign = 'left';
    }

    const runs = asArray(p['a:r']);
    const lineParts: string[] = [];

    for (const r of runs) {
      if (!r) continue;
      const t = r['a:t'];
      if (t !== undefined) {
        lineParts.push(String(t));
      }
      if (firstFontSize === undefined && r['a:rPr']?.['@_sz']) {
        const rawSz = parseInt(String(r['a:rPr']['@_sz']), 10);
        if (!isNaN(rawSz)) firstFontSize = Math.round(rawSz / 100);
      }
      if (firstColor === undefined && r['a:rPr']?.['a:solidFill']) {
        firstColor = parseOoxmlColor(r['a:rPr']['a:solidFill']);
      }
    }

    lines.push(lineParts.join(''));
  }

  return {
    text: lines.join('\n').trim(),
    fontSize: firstFontSize,
    color: firstColor,
    align: firstAlign,
  };
};

export const parsePptxBuffer = async (buffer: ArrayBuffer | Uint8Array): Promise<SlideDeckData> => {
  const zip = await JSZip.loadAsync(buffer);

  // 1. Read presentation.xml
  let emuWidth = 12192000;
  let emuHeight = 6858000;
  let ratio: '16:9' | '4:3' = '16:9';

  const presXmlStr = await zip.file('ppt/presentation.xml')?.async('string');
  if (presXmlStr) {
    const presData = xmlParser.parse(presXmlStr);
    const sldSz = presData?.['p:presentation']?.['p:sldSz'];
    if (sldSz) {
      const cx = parseInt(sldSz['@_cx'] || '12192000', 10);
      const cy = parseInt(sldSz['@_cy'] || '6858000', 10);
      if (cx > 0 && cy > 0) {
        emuWidth = cx;
        emuHeight = cy;
        ratio = Math.abs(cx / cy - 4 / 3) < 0.1 ? '4:3' : '16:9';
      }
    }
  }

  // 2. Read presentation.xml.rels to find slide paths
  const relsMap = new Map<string, string>();
  const presRelsStr = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
  if (presRelsStr) {
    const relsData = xmlParser.parse(presRelsStr);
    const rels = asArray(relsData?.['Relationships']?.['Relationship']);
    for (const rel of rels) {
      if (rel?.['@_Id'] && rel?.['@_Target']) {
        const target = rel['@_Target'].startsWith('/')
          ? rel['@_Target'].slice(1)
          : `ppt/${rel['@_Target']}`;
        relsMap.set(rel['@_Id'], target.replace('ppt/ppt/', 'ppt/'));
      }
    }
  }

  // 3. Find slide files in order
  const slideFiles: string[] = [];
  if (presXmlStr) {
    const presData = xmlParser.parse(presXmlStr);
    const sldIds = asArray(presData?.['p:presentation']?.['p:sldIdLst']?.['p:sldId']);
    for (const sldId of sldIds) {
      const rId = sldId?.['@_r:id'];
      if (rId && relsMap.has(rId)) {
        slideFiles.push(relsMap.get(rId)!);
      }
    }
  }

  // Fallback if slide list was not found in rels
  if (slideFiles.length === 0) {
    for (const filename of Object.keys(zip.files)) {
      if (/^ppt\/slides\/slide\d+\.xml$/i.test(filename)) {
        slideFiles.push(filename);
      }
    }
    slideFiles.sort();
  }

  const slides: SlideItem[] = [];

  for (let idx = 0; idx < slideFiles.length; idx++) {
    const sldPath = slideFiles[idx]!;
    const sldXmlStr = await zip.file(sldPath)?.async('string');
    if (!sldXmlStr) continue;

    const sldData = xmlParser.parse(sldXmlStr);
    const spTree = sldData?.['p:sld']?.['p:cSld']?.['p:spTree'];
    const elements: SlideElement[] = [];

    if (spTree) {
      // Shapes and text boxes
      const shapes = asArray(spTree['p:sp']);
      for (const sp of shapes) {
        if (!sp) continue;
        const xfrm = sp['p:spPr']?.['a:xfrm'];
        if (!xfrm) continue;

        const offX = parseInt(xfrm['a:off']?.['@_x'] || '0', 10);
        const offY = parseInt(xfrm['a:off']?.['@_y'] || '0', 10);
        const extCx = parseInt(xfrm['a:ext']?.['@_cx'] || '0', 10);
        const extCy = parseInt(xfrm['a:ext']?.['@_cy'] || '0', 10);

        const x = Math.round((offX / emuWidth) * CANVAS_WIDTH);
        const y = Math.round((offY / emuHeight) * CANVAS_HEIGHT);
        const width = Math.max(20, Math.round((extCx / emuWidth) * CANVAS_WIDTH));
        const height = Math.max(20, Math.round((extCy / emuHeight) * CANVAS_HEIGHT));

        const textInfo = extractTextFromTxBody(sp['p:txBody']);
        const solidFill = sp['p:spPr']?.['a:solidFill'];
        const fill = parseOoxmlColor(solidFill);

        if (textInfo.text) {
          elements.push({
            id: `el-${crypto.randomUUID()}`,
            type: 'text',
            x,
            y,
            width,
            height,
            content: textInfo.text,
            fontSize: textInfo.fontSize || (idx === 0 ? 32 : 20),
            color: textInfo.color || '#0f172a',
            align: textInfo.align,
            fill,
          });
        } else if (fill) {
          elements.push({
            id: `el-${crypto.randomUUID()}`,
            type: 'shape',
            x,
            y,
            width,
            height,
            fill,
          });
        }
      }
    }

    slides.push({
      id: `slide-${idx + 1}`,
      title: `Trang ${idx + 1}`,
      background: '#ffffff',
      elements:
        elements.length > 0
          ? elements
          : [
              {
                id: `el-${crypto.randomUUID()}`,
                type: 'text',
                x: 60,
                y: 60,
                width: 840,
                height: 60,
                content: `Trang ${idx + 1}`,
                fontSize: 28,
                color: '#0f172a',
              },
            ],
    });
  }

  return {
    id: `deck-${crypto.randomUUID()}`,
    name: 'Bài trình chiếu đã nhập',
    ratio,
    slides:
      slides.length > 0
        ? slides
        : [
            {
              id: 'slide-1',
              title: 'Trang 1',
              background: '#ffffff',
              elements: [],
            },
          ],
  };
};

export const parsePptxFile = async (file: File): Promise<SlideDeckData> => {
  const buffer = await file.arrayBuffer();
  const deck = await parsePptxBuffer(buffer);
  deck.name = file.name.replace(/\.pptx$/i, '') || deck.name;
  return deck;
};
