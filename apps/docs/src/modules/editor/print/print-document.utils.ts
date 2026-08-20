import type { EditorView } from '@tiptap/pm/view';
import { PAPER_SIZES, type HeaderFooterSlot, type PageSetup } from '@/types/docs.types';
import { resolveSlot } from '@/modules/editor/print/page-tokens.utils';
import { computeMetrics, type PageBreaks } from '@/modules/editor/utils/pagination.utils';

export const PRINT_ROOT_ID = 'print-root';
export const PRINT_STYLE_ID = 'office-print-page';

export const teardownPrintRoot = (): void => {
  document.body.classList.remove('printing');
  const printRoot = document.getElementById(PRINT_ROOT_ID);
  if (printRoot) {
    printRoot.replaceChildren();
  }
  document.getElementById(PRINT_STYLE_ID)?.remove();
};

export const applyPrintPageRule = (setup: PageSetup): void => {
  const paper = PAPER_SIZES[setup.paperSize] ?? PAPER_SIZES.a4;
  const { width, height } =
    setup.orientation === 'landscape' ? { width: paper.height, height: paper.width } : paper;

  let style = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = PRINT_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `@page { size: ${width}mm ${height}mm; margin: 0; }`;
};

const getEffectiveSlot = (
  setup: PageSetup,
  band: 'header' | 'footer',
  pageIndex: number,
): HeaderFooterSlot | undefined => {
  const isFirstPage = pageIndex === 0;
  const isEvenPage = pageIndex % 2 === 1;

  if (band === 'header') {
    if (isFirstPage && setup.differentFirst) {
      return setup.firstHeader || setup.header;
    }
    if (isEvenPage && setup.differentOddEven) {
      return setup.evenHeader || setup.header;
    }
    return setup.header;
  }

  if (isFirstPage && setup.differentFirst) {
    return setup.firstFooter || setup.footer;
  }
  if (isEvenPage && setup.differentOddEven) {
    return setup.evenFooter || setup.footer;
  }
  return setup.footer;
};

export const buildPrintRoot = (
  view: EditorView,
  breaks: PageBreaks,
  setup: PageSetup,
  docTitle: string,
): void => {
  teardownPrintRoot();
  applyPrintPageRule(setup);

  const printRoot = document.getElementById(PRINT_ROOT_ID);
  if (!printRoot) throw new Error('Missing #print-root container');

  const editorDom = view.dom as HTMLElement;
  if (!editorDom) throw new Error('Missing editor DOM');

  const paper = PAPER_SIZES[setup.paperSize] ?? PAPER_SIZES.a4;
  const paperWMm = setup.orientation === 'landscape' ? paper.height : paper.width;
  const paperHMm = setup.orientation === 'landscape' ? paper.width : paper.height;

  const { top: mtMm, right: mrMm, bottom: mbMm, left: mlMm } = setup.margins;
  const headerMarginMm = setup.headerMargin ?? 12.5;
  const footerMarginMm = setup.footerMargin ?? 12.5;
  const metrics = computeMetrics(setup);

  printRoot.style.setProperty('--paper-w-mm', `${paperWMm}mm`);
  printRoot.style.setProperty('--paper-h-mm', `${paperHMm}mm`);
  printRoot.style.setProperty('--margin-t-mm', `${mtMm}mm`);
  printRoot.style.setProperty('--margin-r-mm', `${mrMm}mm`);
  printRoot.style.setProperty('--margin-b-mm', `${mbMm}mm`);
  printRoot.style.setProperty('--margin-l-mm', `${mlMm}mm`);
  printRoot.style.setProperty('--header-margin-mm', `${headerMarginMm}mm`);
  printRoot.style.setProperty('--footer-margin-mm', `${footerMarginMm}mm`);
  printRoot.style.setProperty('--usable-px', `${metrics.usable}px`);
  const usableMm = paperHMm - mtMm - mbMm;
  printRoot.style.setProperty('--usable-mm', `${usableMm}mm`);

  const pageCount = breaks.contentOffsets.length;
  const tokenCtx = {
    title: docTitle,
    date: new Date(),
    locale: 'vi' as const,
  };

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < pageCount; i += 1) {
    const pageEl = document.createElement('div');
    pageEl.className = 'print-page';
    pageEl.style.position = 'relative';

    // Watermark
    if (setup.watermark?.enabled && setup.watermark.text) {
      const watermarkEl = document.createElement('div');
      watermarkEl.className = 'print-watermark';
      watermarkEl.style.position = 'absolute';
      watermarkEl.style.inset = '0';
      watermarkEl.style.display = 'flex';
      watermarkEl.style.alignItems = 'center';
      watermarkEl.style.justifyContent = 'center';
      watermarkEl.style.pointerEvents = 'none';
      watermarkEl.style.zIndex = '0';
      watermarkEl.style.opacity = `${setup.watermark.opacity ?? 0.15}`;
      watermarkEl.style.overflow = 'hidden';

      const textEl = document.createElement('div');
      textEl.textContent = setup.watermark.text;
      textEl.style.fontWeight = 'bold';
      textEl.style.letterSpacing = '0.2em';
      textEl.style.textTransform = 'uppercase';
      textEl.style.transform = 'rotate(-45deg)';
      textEl.style.whiteSpace = 'nowrap';
      textEl.style.color = setup.watermark.color || '#64748B';
      textEl.style.fontSize = `${setup.watermark.fontSize || 48}px`;

      watermarkEl.appendChild(textEl);
      pageEl.appendChild(watermarkEl);
    }

    // Header
    const headerSlot = getEffectiveSlot(setup, 'header', i);
    const headerSlots = resolveSlot(
      headerSlot,
      setup.pageNumber,
      'header',
      i,
      pageCount,
      tokenCtx,
    );
    const headerEl = document.createElement('div');
    headerEl.className = 'print-hf print-header';
    headerEl.style.position = 'relative';
    headerEl.style.zIndex = '1';
    const leftHeader = document.createElement('span');
    leftHeader.textContent = headerSlots.left;
    const centerHeader = document.createElement('span');
    centerHeader.textContent = headerSlots.center;
    const rightHeader = document.createElement('span');
    rightHeader.textContent = headerSlots.right;
    headerEl.appendChild(leftHeader);
    headerEl.appendChild(centerHeader);
    headerEl.appendChild(rightHeader);
    pageEl.appendChild(headerEl);

    // Viewport & Content Clip
    const viewportEl = document.createElement('div');
    viewportEl.className = 'page-viewport is-paged';
    viewportEl.style.position = 'relative';
    viewportEl.style.zIndex = '1';

    const clipEl = document.createElement('div');
    clipEl.className = 'print-clip';

    const contentEl = document.createElement('div');
    contentEl.className = 'print-content';
    const offset = breaks.contentOffsets[i] ?? 0;
    contentEl.style.top = `-${offset}px`;

    const clone = editorDom.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.removeAttribute('contenteditable');

    try {
      const liveRect = editorDom.getBoundingClientRect();
      const liveStyle = getComputedStyle(editorDom);
      clone.style.width = `${liveRect.width}px`;
      clone.style.padding = `${liveStyle.paddingTop} ${liveStyle.paddingRight} ${liveStyle.paddingBottom} ${liveStyle.paddingLeft}`;
      clone.style.boxSizing = liveStyle.boxSizing || 'border-box';
      clone.style.fontFamily = liveStyle.fontFamily;
      clone.style.fontSize = liveStyle.fontSize;
      clone.style.lineHeight = liveStyle.lineHeight;
      clone.style.color = liveStyle.color;
      (
        clone.style as CSSStyleDeclaration & {
          printColorAdjust?: string;
          webkitPrintColorAdjust?: string;
        }
      ).printColorAdjust = 'exact';
      (
        clone.style as CSSStyleDeclaration & {
          printColorAdjust?: string;
          webkitPrintColorAdjust?: string;
        }
      ).webkitPrintColorAdjust = 'exact';
    } catch {
      /* non-browser environment (tests) */
    }

    clone.querySelectorAll('.page-break-marker, .section-break-divider').forEach((m) => {
      (m as HTMLElement).classList.add('print-hide-break-visual');
    });

    contentEl.appendChild(clone);
    clipEl.appendChild(contentEl);
    viewportEl.appendChild(clipEl);
    pageEl.appendChild(viewportEl);

    // Footer
    const footerSlot = getEffectiveSlot(setup, 'footer', i);
    const footerSlots = resolveSlot(
      footerSlot,
      setup.pageNumber,
      'footer',
      i,
      pageCount,
      tokenCtx,
    );
    const footerEl = document.createElement('div');
    footerEl.className = 'print-hf print-footer';
    footerEl.style.position = 'relative';
    footerEl.style.zIndex = '1';
    const leftFooter = document.createElement('span');
    leftFooter.textContent = footerSlots.left;
    const centerFooter = document.createElement('span');
    centerFooter.textContent = footerSlots.center;
    const rightFooter = document.createElement('span');
    rightFooter.textContent = footerSlots.right;
    footerEl.appendChild(leftFooter);
    footerEl.appendChild(centerFooter);
    footerEl.appendChild(rightFooter);
    pageEl.appendChild(footerEl);

    fragment.appendChild(pageEl);
  }

  printRoot.appendChild(fragment);
  document.body.classList.add('printing');
};
