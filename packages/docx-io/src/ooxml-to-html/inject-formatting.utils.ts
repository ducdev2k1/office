import { parseHtmlToTree, type HtmlNode } from '../html-to-ooxml/html-parser';
import { IGNORABLE_SHD_FILLS } from './document-formatting.utils';
import type { BodyFormatPlan, ParagraphFormatInfo, RunSegment } from './document-formatting.utils';

interface TextSlot {
  parent: HtmlNode;
  index: number;
  node: HtmlNode;
  start: number;
}

interface BlockMatch {
  node: HtmlNode;
  parent: HtmlNode;
  index: number;
  slots: TextSlot[];
  length: number;
}

const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']);

const isBlockTag = (tag: string): boolean => BLOCK_TAGS.has(tag);

const collectTextSlots = (
  node: HtmlNode,
  base: number,
  skipNestedLists: boolean,
): { slots: TextSlot[]; length: number } => {
  const slots: TextSlot[] = [];
  let cursor = base;
  const walk = (current: HtmlNode, parent: HtmlNode): void => {
    current.children.forEach((child, index) => {
      if (child.type === 'text') {
        slots.push({ parent: current, index, node: child, start: cursor });
        cursor += child.textContent.length;
        return;
      }
      if (skipNestedLists && (child.tagName === 'ul' || child.tagName === 'ol')) return;
      walk(child, current);
    });
  };
  walk(node, node);
  return { slots, length: cursor - base };
};

const collectBlocks = (nodes: HtmlNode[], out: BlockMatch[]): void => {
  const visit = (container: HtmlNode): void => {
    container.children.forEach((child, index) => {
      if (child.type !== 'element') return;
      if (isBlockTag(child.tagName)) {
        const isListItem = child.tagName === 'li';
        const { slots, length } = collectTextSlots(child, 0, isListItem);
        if (length > 0) {
          out.push({ node: child, parent: container, index, slots, length });
        }
        if (isListItem) {
          child.children.forEach((nested) => {
            if (nested.type === 'element' && (nested.tagName === 'ul' || nested.tagName === 'ol')) {
              visit(nested);
            }
          });
        }
        return;
      }
      visit(child);
    });
  };
  const rootNode: HtmlNode = { type: 'element', tagName: 'root', attributes: {}, textContent: '', children: nodes };
  visit(rootNode);
};

const makePageBreakNode = (): HtmlNode => ({
  type: 'element',
  tagName: 'div',
  attributes: { 'data-type': 'page-break' },
  textContent: '',
  children: [],
});

const wrapFragment = (text: string, segment: RunSegment): HtmlNode | null => {
  let inner: HtmlNode | null = null;
  const buildWrap = (tagName: string, attributes: Record<string, string>): void => {
    const wrapper: HtmlNode = {
      type: 'element',
      tagName,
      attributes,
      textContent: '',
      children: [],
    };
    if (inner) {
      wrapper.children.push(inner);
    } else {
      wrapper.children.push({
        type: 'text',
        tagName: '',
        attributes: {},
        textContent: text,
        children: [],
      });
    }
    inner = wrapper;
  };

  if (!segment.inHyperlink && segment.underline) buildWrap('u', {});
  if (!segment.inHyperlink && segment.color) {
    buildWrap('span', { style: `color: #${segment.color}` });
  }
  if (segment.highlight) buildWrap('mark', {});
  return inner;
};

const findSegmentAt = (
  segments: RunSegment[],
  offset: number,
): RunSegment | null => segments.find((s) => offset >= s.start && offset < s.end) ?? null;

const applySegmentsToBlock = (block: BlockMatch, info: ParagraphFormatInfo): void => {
  let changed = false;
  const pending: { slot: TextSlot; replacements: HtmlNode[] }[] = [];

  for (let i = block.slots.length - 1; i >= 0; i--) {
    const slot = block.slots[i];
    if (!slot) continue;
    const text = slot.node.textContent;
    const boundaries = new Set<number>([0, text.length]);
    for (const segment of info.segments) {
      if (segment.end <= slot.start || segment.start >= slot.start + text.length) continue;
      boundaries.add(Math.max(0, Math.min(text.length, segment.start - slot.start)));
      boundaries.add(Math.max(0, Math.min(text.length, segment.end - slot.start)));
    }
    const cuts = [...boundaries].sort((a, b) => a - b);

    const replacements: HtmlNode[] = [];
    let wrappedAny = false;
    for (let c = 0; c < cuts.length - 1; c++) {
      const from = cuts[c] ?? 0;
      const to = cuts[c + 1] ?? text.length;
      const piece = text.slice(from, to);
      if (!piece) continue;
      const segment = findSegmentAt(info.segments, slot.start + from);
      const wrapped = segment ? wrapFragment(piece, segment) : null;
      if (wrapped) wrappedAny = true;
      replacements.push(
        wrapped ?? { type: 'text', tagName: '', attributes: {}, textContent: piece, children: [] },
      );
    }
    if (wrappedAny) {
      changed = true;
      pending.push({ slot, replacements });
    }
  }

  if (!changed) return;
  for (const { slot, replacements } of pending) {
    slot.parent.children.splice(slot.index, 1, ...replacements);
  }
};

const applyAlignToBlock = (node: HtmlNode, align: NonNullable<ParagraphFormatInfo['align']>): void => {
  const existing = node.attributes.style ?? '';
  const cleaned = existing.replace(/text-align\s*:\s*[^;]+;?/gi, '').trim();
  const merged = cleaned ? `${cleaned.replace(/;$/, '')}; text-align: ${align}` : `text-align: ${align}`;
  node.attributes.style = merged;
};

const applyBoxToBlock = (node: HtmlNode, info: ParagraphFormatInfo): void => {
  if (info.shading) {
    node.attributes['data-bg-color'] = `#${info.shading}`;
  }
  if (info.borderLeftColor) {
    node.attributes['data-border'] = 'left';
    node.attributes['data-border-color'] = `#${info.borderLeftColor}`;
  }
};

const escapeHtmlText = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const VOID_TAGS = new Set(['br', 'img', 'hr']);

const nodeToHtml = (node: HtmlNode): string => {
  if (node.type === 'text') return escapeHtmlText(node.textContent);
  const attrs = Object.entries(node.attributes)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join('');
  if (VOID_TAGS.has(node.tagName)) return `<${node.tagName}${attrs}/>`;
  const inner = node.children.map(nodeToHtml).join('');
  return `<${node.tagName}${attrs}>${inner}</${node.tagName}>`;
};

/** Bù direct formatting (align/u/color/highlight/strike/page-break) mà mammoth bỏ qua vào HTML đầu ra. */
export const injectDirectFormatting = (html: string, plan: BodyFormatPlan): string => {
  if (plan.blocks.length === 0 && plan.breaks.length === 0) return html;
  const tree = parseHtmlToTree(html);
  const blocks: BlockMatch[] = [];
  collectBlocks(tree, blocks);

  if (blocks.length !== plan.blocks.length) return html;

  blocks.forEach((block, i) => {
    const info = plan.blocks[i];
    if (!info) return;
    if (info.align) applyAlignToBlock(block.node, info.align);
    applyBoxToBlock(block.node, info);
    if (block.length === info.textLength) applySegmentsToBlock(block, info);
  });

  for (let i = plan.breaks.length - 1; i >= 0; i--) {
    const breakPos = plan.breaks[i];
    if (!breakPos) continue;
    const inserts = Array.from({ length: breakPos.count }, makePageBreakNode);
    const target = breakPos.nextBlockIndex !== null ? blocks[breakPos.nextBlockIndex] : null;
    if (target) {
      target.parent.children.splice(target.index, 0, ...inserts);
    } else {
      tree.push(...inserts);
    }
  }

  return tree.map(nodeToHtml).join('');
};

const extractTableCellFills = (documentXml: string): (string | null)[] => {
  const fills: (string | null)[] = [];
  const cellRegex = /<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/g;
  let match: RegExpExecArray | null;
  while ((match = cellRegex.exec(documentXml)) !== null) {
    const tcPrMatch = /<w:tcPr>([\s\S]*?)<\/w:tcPr>/.exec(match[1] ?? '');
    const shdMatch = /<w:shd [^>]*w:fill="([0-9A-Fa-f]{6})"/.exec(tcPrMatch?.[1] ?? '');
    const fill = shdMatch?.[1]?.toUpperCase() ?? null;
    fills.push(fill && !IGNORABLE_SHD_FILLS.has(fill) ? fill : null);
  }
  return fills;
};

const collectTableCells = (nodes: HtmlNode[], out: HtmlNode[]): void => {
  const visit = (node: HtmlNode): void => {
    if (node.type !== 'element') return;
    if (node.tagName === 'td' || node.tagName === 'th') {
      out.push(node);
      return;
    }
    node.children.forEach(visit);
  };
  nodes.forEach(visit);
};

export const injectTableCellShading = (html: string, documentXml: string): string => {
  if (!documentXml.includes('<w:tbl>')) return html;
  const fills = extractTableCellFills(documentXml);
  if (!fills.some(Boolean)) return html;
  const tree = parseHtmlToTree(html);
  const cells: HtmlNode[] = [];
  collectTableCells(tree, cells);
  if (cells.length !== fills.length) return html;
  cells.forEach((cell, i) => {
    const fill = fills[i];
    if (!fill) return;
    const existing = cell.attributes.style ?? '';
    const cleaned = existing.replace(/background-color\s*:\s*[^;]+;?/gi, '').trim();
    cell.attributes.style = cleaned
      ? `${cleaned.replace(/;$/, '')}; background-color: #${fill}`
      : `background-color: #${fill}`;
  });
  return tree.map(nodeToHtml).join('');
};
