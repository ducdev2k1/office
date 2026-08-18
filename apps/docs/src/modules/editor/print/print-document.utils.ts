import type { EditorView } from '@tiptap/pm/view';
import { PAPER_SIZES, type PageSetup } from '@/types/docs.types';
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
  const headerMarginMm = setup.headerMargin ?? 10;
  const footerMarginMm = setup.footerMargin ?? 10;
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

    // Header
    const headerSlots = resolveSlot(setup.header, setup.pageNumber, 'header', i, pageCount, tokenCtx);
    const headerEl = document.createElement('div');
    headerEl.className = 'print-hf print-header';
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

    const clipEl = document.createElement('div');
    clipEl.className = 'print-clip';

    const contentEl = document.createElement('div');
    contentEl.className = 'print-content';
    const offset = breaks.contentOffsets[i] ?? 0;
    contentEl.style.top = `-${offset}px`;

    const clone = editorDom.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.removeAttribute('contenteditable');

    const markers = clone.querySelectorAll('.page-break-marker, .page-break-spacer');
    markers.forEach((m) => {
      (m as HTMLElement).style.height = '0px';
    });

    contentEl.appendChild(clone);
    clipEl.appendChild(contentEl);
    viewportEl.appendChild(clipEl);
    pageEl.appendChild(viewportEl);

    // Footer
    const footerSlots = resolveSlot(setup.footer, setup.pageNumber, 'footer', i, pageCount, tokenCtx);
    const footerEl = document.createElement('div');
    footerEl.className = 'print-hf print-footer';
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
