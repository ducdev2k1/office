import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { getPaperSizePx, mmToPx, type PageSetup } from '../types';

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

  const { usable, marginT, marginB } = computeMetrics(setup);
  let remaining = usable;
  const breaks: number[] = [];
  const spacers: number[] = [];
  const forced: boolean[] = [];
  const spacerAt = (pos: number) => (pos === 0 ? 0 : remaining + marginT + marginB + PAGE_GAP);

  doc.forEach((node, offset) => {
    if (breaks.length >= MAX_PAGES - 1) return;
    const dom = view.nodeDOM(offset);
    const height = dom ? (dom as HTMLElement).offsetHeight : 0;

    if (node.type.name === 'pageBreak') {
      breaks.push(offset);
      spacers.push(spacerAt(offset));
      forced.push(true);
      remaining = usable;
      return;
    }

    if (height > usable) {
      breaks.push(offset);
      spacers.push(spacerAt(offset));
      forced.push(false);
      remaining = 0;
      return;
    }

    if (height > remaining) {
      breaks.push(offset);
      spacers.push(spacerAt(offset));
      forced.push(false);
      remaining = usable - height;
    } else {
      remaining -= height;
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
            { key: `page-break-${pos}` },
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
