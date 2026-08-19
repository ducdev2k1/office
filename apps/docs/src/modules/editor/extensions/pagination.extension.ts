import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { DEFAULT_PAGE_SETUP, getPaperSizePx, mmToPx, type PageSetup } from '@/types/docs.types';
import type {
  PaginationMetrics,
  PaginationOptions,
  PaginationPluginState,
} from '@/modules/editor/types/pagination.types';
import { buildPagesWidget } from '@/modules/editor/utils/pagination.dom';

export const PAGINATION_PLUGIN_KEY = new PluginKey<PaginationPluginState>('tiptap-pagination');

export const computePaginationMetrics = (
  setup: PageSetup,
  gapHeight = 16,
): PaginationMetrics => {
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
  view: EditorView,
  metrics: PaginationMetrics,
  maxPages = 50,
): number => {
  const root = view.dom as HTMLElement;
  if (!root || !root.offsetHeight) return 1;

  let totalContentH = 0;
  view.state.doc.forEach((node, offset) => {
    const el = view.nodeDOM(offset) as HTMLElement | null;
    if (el && el.nodeType === Node.ELEMENT_NODE) {
      const style = window.getComputedStyle(el);
      const mt = parseFloat(style.marginTop) || 0;
      const mb = parseFloat(style.marginBottom) || 0;
      totalContentH += el.offsetHeight + Math.max(mt, mb);
    }
  });

  if (totalContentH <= 0) {
    totalContentH = root.scrollHeight;
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
      maxPages: 50,
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
        props: {
          decorations(state) {
            const pluginState = PAGINATION_PLUGIN_KEY.getState(state);
            if (!pluginState || !pluginState.isPaged) return null;

            const { pageCount, metrics, setup, docTitle } = pluginState;
            const setupKey = `${pageCount}_${docTitle}_${setup.paperSize}_${setup.orientation}_${setup.headerMargin}_${setup.footerMargin}_${JSON.stringify(setup.margins)}_${JSON.stringify(setup.header)}_${JSON.stringify(setup.footer)}_${JSON.stringify(setup.pageNumber)}`;

            const widget = Decoration.widget(
              0,
              () =>
                buildPagesWidget({
                  pageCount,
                  metrics,
                  setup,
                  docTitle,
                  onEditBand: extension.options.onEditBand,
                }),
              {
                side: -1,
                key: `tiptap-pages-${setupKey}`,
              },
            );

            return DecorationSet.create(state.doc, [widget]);
          },
        },
      }),
    ];
  },
});
