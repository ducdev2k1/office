import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { getPaperSizePx, mmToPx, type PageSetup } from '@/types/docs.types';
import {
  bumpBlockCache,
  getCachedBlockMetrics,
  measureBlockDom,
  measureLines,
  resolveContentNodeDom,
  setCachedBlockLines,
} from '@/modules/editor/utils/pagination-measure.utils';
import {
  EMPTY_DIRTY,
  isBlockDirty,
  type DirtyRange,
} from '@/modules/editor/utils/pagination-dirty.utils';

export { bumpBlockCache } from '@/modules/editor/utils/pagination-measure.utils';
export {
  collectTrDirtyRanges,
  isBlockDirty,
  type DirtyRange,
} from '@/modules/editor/utils/pagination-dirty.utils';

export const PAGE_GAP = 16;
export const MAX_PAGES = 300;

const key = new PluginKey<PageBreaks>('pagination');

export interface PageBreakInfo {
  from: number;
  to: number;
}

export interface LineMeasurement {
  top: number;
  bottom: number;
  pos: number;
}

export interface PageBreaks {
  breaks: number[];
  spacers: number[];
  forced: boolean[];
  /** One entry per laid-out page: the flow offset of each page's content top. */
  contentOffsets: number[];
}

export interface PageMetrics {
  paperW: number;
  paperH: number;
  usable: number;
  marginT: number;
  marginB: number;
}

export const EMPTY_BREAKS: PageBreaks = {
  breaks: [],
  spacers: [],
  forced: [],
  contentOffsets: [0],
};

export interface BlockMeasurement {
  type: string;
  offset: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  /** Real offsetTop relative to view.dom, for contentOffsets. */
  domTop: number;
  lines?: LineMeasurement[];
}

export const computeMetrics = (setup: PageSetup): PageMetrics => {
  const { width: paperW, height: paperH } = getPaperSizePx(setup);
  const marginT = mmToPx(setup.margins.top);
  const marginB = mmToPx(setup.margins.bottom);
  return { paperW, paperH, usable: paperH - marginT - marginB, marginT, marginB };
};

/**
 * Pure pagination calculation. Supports both block-level and line-level breaks.
 * `contentOffsets` tracks the top flow offset for each page.
 */
export const computeBreaksFromMeasurements = (
  blocks: BlockMeasurement[],
  metrics: PageMetrics,
): PageBreaks => {
  const { paperH, usable } = metrics;
  const breaks: number[] = [];
  const spacers: number[] = [];
  const forced: boolean[] = [];
  const contentOffsets: number[] = [0];
  let y = 0;
  let pageTop = 0;
  let prevMb = 0;
  let hasPrev = false;

  for (const block of blocks) {
    if (breaks.length >= MAX_PAGES - 1) break;
    const { height, marginTop: mt, marginBottom: mb, lines } = block;

    if (block.type === 'pageBreak') {
      breaks.push(block.offset);
      spacers.push(hasPrev ? pageTop + paperH + PAGE_GAP - y - prevMb : 0);
      forced.push(true);
      y = pageTop + paperH + PAGE_GAP;
      pageTop = y;
      contentOffsets.push(pageTop);
      prevMb = 0;
      hasPrev = false;
      continue;
    }

    const gap = hasPrev ? Math.max(prevMb, mt) : mt;
    const bottom = y + gap + height;

    // Check if block overflows current page
    if (bottom - pageTop > usable) {
      if (lines && lines.length > 1) {
        let currentSectionBaseTop = 0;
        let lineIdx = 0;

        while (lineIdx < lines.length && breaks.length < MAX_PAGES - 1) {
          const line = lines[lineIdx];
          if (!line) break;

          const lineTop = y + gap + (line.top - currentSectionBaseTop);
          const lineBottom = y + gap + (line.bottom - currentSectionBaseTop);

          if (lineBottom - pageTop > usable) {
            if (lineIdx === 0 && currentSectionBaseTop === 0) {
              // First line overflows -> push entire block to next page
              breaks.push(block.offset);
              spacers.push(Math.max(0, pageTop + paperH + PAGE_GAP - y - prevMb));
              forced.push(false);
              pageTop += paperH + PAGE_GAP;
              contentOffsets.push(pageTop);
              y = pageTop + mt;
              currentSectionBaseTop = line.top;
              lineIdx += 1;
            } else {
              // Break inside block at this line
              const spacer = pageTop + paperH + PAGE_GAP - lineTop;
              breaks.push(line.pos);
              spacers.push(Math.max(0, spacer));
              forced.push(false);
              pageTop += paperH + PAGE_GAP;
              contentOffsets.push(pageTop);
              y = pageTop;
              currentSectionBaseTop = line.top;
              lineIdx += 1;
            }
          } else {
            lineIdx += 1;
          }
        }

        const lastLine = lines[lines.length - 1];
        if (lastLine) {
          y = pageTop + (lastLine.bottom - currentSectionBaseTop);
        } else {
          y = pageTop + height;
        }
        prevMb = mb;
        hasPrev = true;
      } else {
        // Standard block-level break
        breaks.push(block.offset);
        spacers.push(Math.max(0, pageTop + paperH + PAGE_GAP - y - prevMb));
        forced.push(false);
        pageTop += paperH + PAGE_GAP;
        contentOffsets.push(pageTop);
        y = pageTop + mt + height;
        while (y > pageTop + usable && contentOffsets.length < MAX_PAGES) {
          pageTop += paperH + PAGE_GAP;
          contentOffsets.push(pageTop);
        }
        prevMb = mb;
        hasPrev = true;
      }
    } else {
      y = bottom;
      prevMb = mb;
      hasPrev = true;
    }
  }

  return { breaks, spacers, forced, contentOffsets };
};

/**
 * Replace simulated contentOffsets with real DOM positions.
 */
export const resolveContentOffsets = (
  breaks: number[],
  simulated: number[],
  domTopOf: (offset: number) => number | null,
  paperH: number,
): number[] => {
  const out: number[] = [0];
  let lastBase = 0;
  for (let i = 1; i < simulated.length; i += 1) {
    const breakIndex = i - 1;
    const simTop = simulated[i];
    if (breakIndex < breaks.length) {
      const off = breaks[breakIndex];
      const domTop = off === undefined ? null : domTopOf(off);
      lastBase = domTop ?? simTop ?? lastBase + paperH + PAGE_GAP;
      out.push(lastBase);
    } else {
      out.push(lastBase + (i - breaks.length) * (paperH + PAGE_GAP));
    }
  }
  return out;
};

const measureBlocks = (
  view: EditorView,
  metrics: PageMetrics,
  dirty: DirtyRange[] = EMPTY_DIRTY,
): BlockMeasurement[] => {
  const out: BlockMeasurement[] = [];
  let simulatedY = 0;
  let prevMb = 0;
  let pageTop = 0;

  view.state.doc.forEach((node, offset) => {
    const el = resolveContentNodeDom(view, offset);
    let height = 0;
    let marginTop = 0;
    let marginBottom = 0;
    let domTop = 0;
    let lines: LineMeasurement[] | undefined;

    if (el) {
      const cached = isBlockDirty(offset, node.nodeSize, dirty) ? null : getCachedBlockMetrics(el);
      if (cached) {
        height = cached.height;
        marginTop = cached.marginTop;
        marginBottom = cached.marginBottom;
        // line.pos được cache dạng tương đối so với đầu block — quy đổi về toạ độ hiện tại.
        lines = cached.lines?.map((line) => ({ ...line, pos: line.pos + offset }));
      } else {
        const measured = measureBlockDom(el);
        height = measured.height;
        marginTop = measured.marginTop;
        marginBottom = measured.marginBottom;
      }
      domTop = el.offsetTop;

      const gap = out.length > 0 ? Math.max(prevMb, marginTop) : marginTop;
      const bottom = simulatedY + gap + height;

      // Only measure lines when block crosses a page boundary
      if (!lines && bottom - pageTop > metrics.usable && node.isTextblock && node.childCount > 0) {
        lines = measureLines(view, el);
        setCachedBlockLines(
          el,
          lines.map((line) => ({ ...line, pos: line.pos - offset })),
        );
      }

      simulatedY = bottom;
      prevMb = marginBottom;
      if (simulatedY - pageTop > metrics.usable) {
        pageTop += metrics.paperH + PAGE_GAP;
      }
    }

    out.push({ type: node.type.name, offset, height, marginTop, marginBottom, domTop, lines });
  });
  return out;
};

/**
 * Single-pass analysis: đo toàn bộ block một lần duy nhất rồi vừa tính page breaks
 * vừa suy ra tổng chiều cao nội dung (dùng cho pageCount) — thay vì quét DOM 2 lần.
 * Block nằm ngoài `dirtyRanges` và đã có cache sẽ được tái dùng, bỏ qua đo lại.
 */
export const analyzePagination = (
  view: EditorView,
  setup: PageSetup,
  dirtyRanges: DirtyRange[] = EMPTY_DIRTY,
): { breaks: PageBreaks; measuredCount: number } => {
  const root = view.dom as HTMLElement;
  if (!root.offsetHeight) return { breaks: EMPTY_BREAKS, measuredCount: 1 };

  const metrics = computeMetrics(setup);
  const blocks = measureBlocks(view, metrics, dirtyRanges);
  const result = computeBreaksFromMeasurements(blocks, metrics);
  const size = view.state.doc.content.size;
  const rootTop = root.getBoundingClientRect().top;
  const widgetEls = Array.from(root.querySelectorAll('.page-break-spacer, .page-break-marker'));
  let widgetIdx = 0;
  const domTopOf = (offset: number): number | null => {
    if (offset === undefined || offset < 0 || offset > size) return null;
    const el = widgetEls[widgetIdx];
    if (!el) return null;
    widgetIdx += 1;
    return el.getBoundingClientRect().bottom - rootTop;
  };

  return {
    breaks: {
      ...result,
      contentOffsets: resolveContentOffsets(
        result.breaks,
        result.contentOffsets,
        domTopOf,
        metrics.paperH,
      ),
    },
    measuredCount: Math.min(
      MAX_PAGES,
      Math.max(result.contentOffsets.length, derivePageCount(blocks, metrics.usable)),
    ),
  };
};

/** Suy ra pageCount từ phép đo block đã có (cùng công thức với measureDocPageCount cũ). */
export const derivePageCount = (
  blocks: BlockMeasurement[],
  usableH: number,
  maxPages: number = MAX_PAGES,
): number => {
  let totalContentH = 0;
  let hasValidBlock = false;

  for (const block of blocks) {
    if (block.height > 0) hasValidBlock = true;
    totalContentH += block.height + Math.max(block.marginTop, block.marginBottom);
  }

  if (!hasValidBlock || totalContentH <= 0) return 1;

  const calculated = Math.ceil(totalContentH / usableH);
  return Math.min(maxPages, Math.max(1, calculated));
};

export const computePageBreaks = (
  view: EditorView,
  setup: PageSetup,
  dirtyRanges: DirtyRange[] = EMPTY_DIRTY,
): PageBreaks => analyzePagination(view, setup, dirtyRanges).breaks;

export const paginationPlugin = new Plugin<PageBreaks>({
  key,
  state: {
    init: (): PageBreaks => EMPTY_BREAKS,
    apply(tr, value) {
      const meta = tr.getMeta('paginationBreaks');
      if (meta) return meta as PageBreaks;
      if (!tr.docChanged || !value.breaks.length) return value;
      const mappedBreaks = value.breaks.map((pos) => tr.mapping.map(pos));
      return {
        ...value,
        breaks: mappedBreaks,
      };
    },
  },
  props: {
    decorations(state) {
      const value = key.getState(state) ?? EMPTY_BREAKS;
      if (!value.breaks.length) return null;
      const size = state.doc.content.size;
      const decos = value.breaks
        .map((pos, i) => {
          if (pos < 0 || pos > size) return null;
          const spacerHeight = value.spacers[i] ?? 0;
          return Decoration.widget(
            pos,
            () => {
              const el = document.createElement('div');
              el.className = value.forced[i]
                ? 'page-break-marker'
                : 'page-break-spacer page-break-spacer-inline';
              el.style.height = `${spacerHeight}px`;
              el.contentEditable = 'false';
              return el;
            },
            {
              side: -1,
              // Key theo ordinal + variant + chiều cao: giữa các lần repagination
              // (positions được map, spacers giữ nguyên) key bất biến -> PM dời node
              // thay vì xoá/tạo lại; khi nội dung đổi thì chỉ đúng widget đó recreate.
              key: `pb-${i}:${value.forced[i] ? 'f' : 's'}:${Math.round(spacerHeight)}`,
            },
          );
        })
        .filter((d): d is Decoration => d !== null);
      return decos.length ? DecorationSet.create(state.doc, decos) : null;
    },
  },
});

export const pagination = Extension.create({
  name: 'pagination',
  addProseMirrorPlugins() {
    return [paginationPlugin];
  },
});
