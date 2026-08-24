import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DEFAULT_PAGE_SETUP, getPaperSizePx, mmToPx, type PageSetup } from '@/types/docs.types';
import type {
  PaginationMetrics,
  PaginationOptions,
  PaginationPluginState,
} from '@/modules/editor/types/pagination.types';
import { resolveContentNodeDom } from '@/modules/editor/utils/pagination-measure.utils';
import { EMPTY_BREAKS, paginationPlugin } from '@/modules/editor/utils/pagination.utils';

export const PAGINATION_PLUGIN_KEY = new PluginKey<PaginationPluginState>('tiptap-pagination');

export const computePaginationMetrics = (setup: PageSetup, gapHeight = 16): PaginationMetrics => {
  const { width: paperW, height: paperH } = getPaperSizePx(setup);
  const marginT = mmToPx(setup.margins.top) || 76;
  const marginR = mmToPx(setup.margins.right) || 57;
  const marginB = mmToPx(setup.margins.bottom) || 76;
  const marginL = mmToPx(setup.margins.left) || 57;
  const headerH = marginT;
  const footerH = marginB;
  const headerPaddingTop = mmToPx(setup.headerMargin ?? 12.5) || 47;
  const footerPaddingBottom = mmToPx(setup.footerMargin ?? 12.5) || 47;
  const usableH = Math.max(100, paperH - headerH - footerH);

  return {
    paperW,
    paperH,
    marginT,
    marginR,
    marginB,
    marginL,
    headerH,
    footerH,
    headerPaddingTop,
    footerPaddingBottom,
    usableH,
    gapH: gapHeight,
  };
};

export const measureDocPageCount = (
  view: { dom: HTMLElement; state: { doc: { content: { size: number }; forEach: (cb: (node: unknown, offset: number) => void) => void } } },
  metrics: PaginationMetrics,
  maxPages = 300,
): number => {
  const root = view.dom as HTMLElement;
  if (!root || !root.offsetHeight) return 1;

  let totalContentH = 0;
  let hasValidBlock = false;

  view.state.doc.forEach((_node, offset) => {
    const el = resolveContentNodeDom(view as any, offset);

    if (el && el.nodeType === Node.ELEMENT_NODE) {
      const style = window.getComputedStyle(el);
      const mt = parseFloat(style.marginTop) || 0;
      const mb = parseFloat(style.marginBottom) || 0;
      totalContentH += el.offsetHeight + Math.max(mt, mb);
      hasValidBlock = true;
    }
  });

  if (!hasValidBlock || totalContentH <= 0) {
    totalContentH = metrics.usableH;
  }

  const calculated = Math.ceil(totalContentH / metrics.usableH);
  return Math.min(maxPages, Math.max(1, calculated));
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pagination: {
      setPageSetup: (setup: PageSetup) => ReturnType;
      setPageCount: (count: number) => ReturnType;
      setDocTitle: (title: string) => ReturnType;
      setPagedMode: (isPaged: boolean) => ReturnType;
      setPaginationData: (data: Partial<PaginationPluginState>) => ReturnType;
    };
  }
}

export const Pagination = Extension.create<PaginationOptions>({
  name: 'pagination',

  addOptions() {
    return {
      pageSetup: DEFAULT_PAGE_SETUP(),
      gapHeight: 16,
      maxPages: 300,
      docTitle: '',
    };
  },

  addStorage() {
    return {
      pageCount: 1,
      metrics: computePaginationMetrics(this.options.pageSetup, this.options.gapHeight),
      isPaged: true,
    };
  },

  addCommands() {
    return {
      setPageSetup:
        (setup) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const metrics = computePaginationMetrics(setup, this.options.gapHeight);
            tr.setMeta(PAGINATION_PLUGIN_KEY, { setup, metrics });
          }
          return true;
        },
      setPageCount:
        (pageCount) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PAGINATION_PLUGIN_KEY, { pageCount });
          }
          return true;
        },
      setDocTitle:
        (docTitle) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PAGINATION_PLUGIN_KEY, { docTitle });
          }
          return true;
        },
      setPagedMode:
        (isPaged) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PAGINATION_PLUGIN_KEY, { isPaged });
            if (!isPaged) {
              tr.setMeta('paginationBreaks', EMPTY_BREAKS);
            }
          }
          return true;
        },
      setPaginationData:
        (data) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const metrics = data.setup
              ? computePaginationMetrics(data.setup, this.options.gapHeight)
              : undefined;
            tr.setMeta(PAGINATION_PLUGIN_KEY, {
              ...data,
              ...(metrics ? { metrics } : {}),
            });
            if (data.breaks) {
              tr.setMeta('paginationBreaks', data.breaks);
            }
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin<PaginationPluginState>({
        key: PAGINATION_PLUGIN_KEY,
        state: {
          init: () => {
            const setup = extension.options.pageSetup;
            const metrics = computePaginationMetrics(setup, extension.options.gapHeight);
            return {
              pageCount: 1,
              metrics,
              setup,
              docTitle: extension.options.docTitle || '',
              isPaged: true,
            };
          },
          apply(tr, prevState) {
            const meta = tr.getMeta(PAGINATION_PLUGIN_KEY);
            if (meta) {
              return { ...prevState, ...meta };
            }
            return prevState;
          },
        },
      }),
      paginationPlugin,
    ];
  },
});
