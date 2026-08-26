export interface RunSegment {
  start: number;
  end: number;
  underline: boolean;
  strike: boolean;
  color?: string;
  highlight?: string;
  inHyperlink: boolean;
}

export interface ParagraphFormatInfo {
  align?: 'center' | 'right' | 'justify';
  textLength: number;
  segments: RunSegment[];
  shading?: string;
  borderLeftColor?: string;
}

export interface PageBreakPosition {
  nextBlockIndex: number | null;
  count: number;
}

export interface BodyFormatPlan {
  blocks: ParagraphFormatInfo[];
  breaks: PageBreakPosition[];
}

const unescapeXml = (text: string): string =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, '&');

const PARAGRAPH_REGEX = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
const RUN_REGEX = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
const TEXT_REGEX = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;

const readRunMarks = (runXml: string) => {
  const rPrMatch = /<w:rPr>([\s\S]*?)<\/w:rPr>/.exec(runXml);
  const rPr = rPrMatch?.[1] ?? '';
  const colorMatch = /<w:color w:val="([0-9A-Fa-f]{6})"\s*\/>/.exec(rPr);
  const highlightMatch = /<w:shd [^>]*w:fill="([0-9A-Fa-f]{6})"/.exec(rPr);
  const highlightRaw = highlightMatch?.[1]?.toUpperCase();
  const highlight =
    highlightRaw && highlightRaw !== 'FFFFFF' && highlightRaw !== 'F1F5F9'
      ? highlightRaw
      : undefined;
  return {
    underline: /<w:u\s+w:val="(?!none)[^"]+"\s*\/>/.test(rPr),
    strike: /<w:(strike|dstrike)\s*\/>/.test(rPr),
    color: (colorMatch?.[1] ?? '').toUpperCase() || undefined,
    highlight,
  };
};

const runText = (runXml: string): string => {
  let text = '';
  let match: RegExpExecArray | null;
  const regex = new RegExp(TEXT_REGEX.source, 'g');
  while ((match = regex.exec(runXml)) !== null) {
    text += unescapeXml(match[1] ?? '');
  }
  return text;
};

const findHyperlinkRanges = (paragraphXml: string): { start: number; end: number }[] => {
  const ranges: { start: number; end: number }[] = [];
  const regex = /<w:hyperlink\b[^>]*>[\s\S]*?<\/w:hyperlink>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(paragraphXml)) !== null) {
    if (match.index !== undefined) {
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }
  }
  return ranges;
};

const isInHyperlink = (
  ranges: { start: number; end: number }[],
  position: number,
): boolean => ranges.some((r) => position >= r.start && position < r.end);

const mergeSegment = (segments: RunSegment[], segment: RunSegment): void => {
  const last = segments[segments.length - 1];
  if (
    last &&
    last.end === segment.start &&
    last.underline === segment.underline &&
    last.strike === segment.strike &&
    last.color === segment.color &&
    last.highlight === segment.highlight &&
    last.inHyperlink === segment.inHyperlink
  ) {
    last.end = segment.end;
    return;
  }
  segments.push(segment);
};

export const IGNORABLE_SHD_FILLS = new Set(['FFFFFF', 'F1F5F9']);

const readParagraphBox = (paragraphXml: string): { shading?: string; borderLeftColor?: string } => {
  const pPrMatch = /<w:pPr>([\s\S]*?)<\/w:pPr>/.exec(paragraphXml);
  const pPr = pPrMatch?.[1] ?? '';
  const shdMatch = /<w:shd [^>]*w:fill="([0-9A-Fa-f]{6})"/.exec(pPr);
  const shadingRaw = shdMatch?.[1]?.toUpperCase();
  const shading =
    shadingRaw && !IGNORABLE_SHD_FILLS.has(shadingRaw) ? shadingRaw : undefined;
  const borderMatch = /<w:left [^>]*w:color="([0-9A-Fa-f]{6})"/.exec(pPr);
  return {
    shading,
    borderLeftColor: borderMatch?.[1]?.toUpperCase() || undefined,
  };
};

const parseParagraph = (
  paragraphXml: string,
): { info: ParagraphFormatInfo; pageBreaks: number } => {
  const alignMatch = /<w:jc w:val="(center|right|both|left)"\s*\/>/.exec(paragraphXml);
  const rawAlign = alignMatch?.[1];
  const align =
    rawAlign === 'both' ? 'justify' : rawAlign === 'left' ? undefined : (rawAlign as ParagraphFormatInfo['align']);

  const hyperlinkRanges = findHyperlinkRanges(paragraphXml);
  const segments: RunSegment[] = [];
  let cursor = 0;
  let pageBreaks = 0;

  let match: RegExpExecArray | null;
  const runRegex = new RegExp(RUN_REGEX.source, 'g');
  while ((match = runRegex.exec(paragraphXml)) !== null) {
    const runXml = match[0];
    if (/w:type="page"/.test(runXml)) pageBreaks += 1;
    const text = runText(runXml);
    if (!text) continue;
    const marks = readRunMarks(runXml);
    mergeSegment(segments, {
      start: cursor,
      end: cursor + text.length,
      ...marks,
      inHyperlink: isInHyperlink(hyperlinkRanges, match.index ?? 0),
    });
    cursor += text.length;
  }

  return {
    info: {
      align,
      textLength: cursor,
      segments,
      ...readParagraphBox(paragraphXml),
    },
    pageBreaks,
  };
};

/** Đọc direct formatting (align, u/strike/color/highlight, page break) theo thứ tự đoạn trong document.xml.
 * Chỉ tính các đoạn có ít nhất 1 ký tự text — bất đồng bộ với collectBlocks phía HTML (cùng quy tắc lọc). */
export const extractBodyFormatPlan = (documentXml: string): BodyFormatPlan => {
  const blocks: ParagraphFormatInfo[] = [];
  const breaks: PageBreakPosition[] = [];
  let pendingBreakCount = 0;

  let match: RegExpExecArray | null;
  const paragraphRegex = new RegExp(PARAGRAPH_REGEX.source, 'g');
  while ((match = paragraphRegex.exec(documentXml)) !== null) {
    const { info, pageBreaks } = parseParagraph(match[0]);
    pendingBreakCount += pageBreaks;
    if (info.textLength > 0) {
      blocks.push(info);
      if (pendingBreakCount > 0) {
        breaks.push({ nextBlockIndex: blocks.length - 1, count: pendingBreakCount });
        pendingBreakCount = 0;
      }
    }
  }

  if (pendingBreakCount > 0) {
    breaks.push({ nextBlockIndex: null, count: pendingBreakCount });
  }

  return { blocks, breaks };
};
