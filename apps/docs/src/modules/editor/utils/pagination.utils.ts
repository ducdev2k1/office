import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { getPaperSizePx, mmToPx, type PageSetup } from '@/types/docs.types';

export const PAGE_GAP = 24;
export const MAX_PAGES = 50;

const key = new PluginKey<PageBreaks>('pagination');

export interface PageBreakInfo {
  from: number;
  to: number;
}

export interface PageBreaks {
  breaks: number[];
  spacers: number[];
  forced: boolean[];
}

export interface PageMetrics {
  paperW: number;
  paperH: number;
  usable: number;
  marginT: number;
  marginB: number;
}

export const computeMetrics = (setup: PageSetup): PageMetrics => {
  const { width: paperW, height: paperH } = getPaperSizePx(setup);
  const marginT = mmToPx(setup.margins.top);
  const marginB = mmToPx(setup.margins.bottom);
  return { paperW, paperH, usable: paperH - marginT - marginB, marginT, marginB };
};

export const computePageBreaks = (view: EditorView, setup: PageSetup): PageBreaks => {
  const doc = view.state.doc;
  const root = view.dom as HTMLElement;
  if (!root.offsetHeight) return { breaks: [], spacers: [], forced: [] };

  const { paperH, usable } = computeMetrics(setup);
  const breaks: number[] = [];
  const spacers: number[] = [];
  const forced: boolean[] = [];
  let y = 0;
  let pageTop = 0;
  let prevMb = 0;
  let hasPrev = false;

  const readBox = (dom: Node | null) => {
    const el = dom as HTMLElement | null;
    if (!el) return { height: 0, marginTop: 0, marginBottom: 0 };
    const style = getComputedStyle(el);
    return {
      height: el.offsetHeight,
      marginTop: parseFloat(style.marginTop) || 0,
      marginBottom: parseFloat(style.marginBottom) || 0,
    };
  };

  doc.forEach((node, offset) => {
    if (breaks.length >= MAX_PAGES - 1) return;
    const { height, marginTop: mt, marginBottom: mb } = readBox(view.nodeDOM(offset));

    if (node.type.name === 'pageBreak') {
      breaks.push(offset);
      spacers.push(hasPrev ? pageTop + paperH + PAGE_GAP - y - prevMb : 0);
      forced.push(true);
      y = pageTop + paperH + PAGE_GAP;
      pageTop = y;
      prevMb = 0;
      hasPrev = false;
      return;
    }

    const gap = hasPrev ? Math.max(prevMb, mt) : mt;
    const bottom = y + gap + height;

    if (bottom - pageTop > usable) {
      breaks.push(offset);
      spacers.push(Math.max(0, pageTop + paperH + PAGE_GAP - y - prevMb));
      pageTop += paperH + PAGE_GAP;
      y = pageTop + mt + height;
      while (y > pageTop + usable) pageTop += paperH + PAGE_GAP;
      prevMb = mb;
      hasPrev = true;
    } else {
      y = bottom;
      prevMb = mb;
      hasPrev = true;
    }
  });

  return { breaks, spacers, forced };
};

const paginationPlugin = new Plugin<PageBreaks>({
  key,
  state: {
    init: (): PageBreaks => ({ breaks: [], spacers: [], forced: [] }),
    apply(tr, value) {
      const meta = tr.getMeta('paginationBreaks');
      return meta ? (meta as PageBreaks) : value;
    },
  },
  props: {
    decorations(state) {
      const value = key.getState(state) ?? { breaks: [], spacers: [], forced: [] };
      if (!value.breaks.length) return null;
      const size = state.doc.content.size;
      const decos = value.breaks
        .filter((pos) => pos >= 0 && pos < size)
        .map((pos, i) =>
          Decoration.widget(
            pos,
            () => {
              const el = document.createElement('div');
              el.className = value.forced[i] ? 'page-break-marker' : 'page-break-spacer';
              el.style.height = `${value.spacers[i] ?? 0}px`;
              return el;
            },
            {
              key: `page-break-${pos}:${value.spacers[i] ?? 0}`,
            },
          ),
        );
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
