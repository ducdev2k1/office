import type { HeaderFooterSlot, PageNumberSetup, PageSetup } from '@/types/docs.types';
import type { PaginationMetrics } from '@/modules/editor/types/pagination.types';

interface DomBuilderOptions {
  pageCount: number;
  metrics: PaginationMetrics;
  setup: PageSetup;
  docTitle?: string;
  onEditBand?: (
    band: 'header' | 'footer',
    pageIndex: number,
    slot: keyof HeaderFooterSlot,
    rect: DOMRect,
  ) => void;
}

const resolveTokens = (
  raw: string,
  pageNum: number,
  totalPages: number,
  docTitle: string,
): string => {
  if (!raw) return '';
  return raw
    .replace(/\{title\}/gi, docTitle || '')
    .replace(/\{page\}/gi, String(pageNum))
    .replace(/\{pages\}/gi, String(totalPages))
    .replace(/\{date\}/gi, new Date().toLocaleDateString('vi-VN'));
};

const buildPageNumberHtml = (
  numSetup: PageNumberSetup,
  pageNum: number,
  totalPages: number,
): string => {
  if (!numSetup.enabled) return '';
  if (numSetup.skipFirstPage && pageNum === 1) return '';

  const fmt = numSetup.format || '{page}';
  if (fmt.includes('{page}') && fmt.includes('{pages}')) {
    return `<span data-page-number-mention="page" class="tiptap-page-number-mention">${pageNum}</span> / <span data-page-number-mention="pages" class="tiptap-page-number-mention">${totalPages}</span>`;
  }
  if (fmt.includes('{page}')) {
    return `<span data-page-number-mention="page" class="tiptap-page-number-mention">${pageNum}</span>`;
  }
  return String(pageNum);
};

const renderSlotContent = (
  slotKey: keyof HeaderFooterSlot,
  band: 'header' | 'footer',
  setup: PageSetup,
  pageNum: number,
  totalPages: number,
  docTitle: string,
): string => {
  const slotData = (setup[band] ?? {})[slotKey] ?? '';
  const resolved = resolveTokens(slotData, pageNum, totalPages, docTitle);

  const numSetup = setup.pageNumber;
  if (numSetup?.enabled && numSetup.position === band && numSetup.align === slotKey) {
    const pageNumHtml = buildPageNumberHtml(numSetup, pageNum, totalPages);
    if (pageNumHtml) {
      return resolved ? `${resolved} ${pageNumHtml}` : pageNumHtml;
    }
  }

  return resolved || '&nbsp;';
};

// ── Pencil icon (inline SVG, no external dep) ──────────────────────────────
const PENCIL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;

const createEditButton = (
  band: 'header' | 'footer',
  pageNum: number,
  onEditBand: NonNullable<DomBuilderOptions['onEditBand']>,
  getBandRect: () => DOMRect,
): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.className = 'hf-edit-btn';
  btn.setAttribute('type', 'button');
  btn.setAttribute('title', band === 'header' ? 'Chỉnh sửa đầu trang' : 'Chỉnh sửa chân trang');
  btn.setAttribute('contenteditable', 'false');
  btn.innerHTML = PENCIL_SVG;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('doc-open-hf-panel', {
        detail: { band, pageIndex: pageNum - 1, slot: 'center' },
      }),
    );
    const rect = getBandRect();
    onEditBand(band, pageNum - 1, 'center', rect);
  });
  return btn;
};

const createBandTable = (
  band: 'header' | 'footer',
  pageNum: number,
  totalPages: number,
  setup: PageSetup,
  docTitle: string,
  onEditBand?: DomBuilderOptions['onEditBand'],
): HTMLElement => {
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.tableLayout = 'fixed';
  table.style.fontSize = '9pt';
  table.style.color = '#5f6368';
  table.style.lineHeight = '1.4';

  const tbody = document.createElement('tbody');
  const tr = document.createElement('tr');

  const slots: Array<{ key: keyof HeaderFooterSlot; align: string }> = [
    { key: 'left', align: 'left' },
    { key: 'center', align: 'center' },
    { key: 'right', align: 'right' },
  ];

  for (const { key, align } of slots) {
    const td = document.createElement('td');
    td.style.padding = '0 4px';
    td.style.textAlign = align;
    td.style.verticalAlign = band === 'header' ? 'top' : 'bottom';
    td.style.overflow = 'hidden';
    td.style.textOverflow = 'ellipsis';
    td.style.whiteSpace = 'nowrap';
    td.style.cursor = 'text';

    td.innerHTML = renderSlotContent(key, band, setup, pageNum, totalPages, docTitle);

    td.addEventListener('click', (e) => {
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent('doc-open-hf-panel', {
          detail: { band, pageIndex: pageNum - 1, slot: key },
        }),
      );
      if (onEditBand) {
        onEditBand(band, pageNum - 1, key, td.getBoundingClientRect());
      }
    });

    tr.appendChild(td);
  }

  tbody.appendChild(tr);
  table.appendChild(tbody);
  return table;
};

const createBandDiv = (
  band: 'header' | 'footer',
  pageNum: number,
  totalPages: number,
  metrics: PaginationMetrics,
  setup: PageSetup,
  docTitle: string,
  onEditBand?: DomBuilderOptions['onEditBand'],
): HTMLDivElement => {
  const div = document.createElement('div');
  div.className = band === 'header' ? 'tiptap-page-header' : 'tiptap-page-footer';
  div.setAttribute('data-editable', 'true');
  div.setAttribute(`data-${band}-page-number`, String(pageNum));
  div.setAttribute(`data-${band}-type`, 'default');
  div.style.position = 'relative';

  if (band === 'header') {
    div.style.minHeight = `${metrics.headerH}px`;
    div.style.height = `${metrics.headerH}px`;
    div.style.padding = `${metrics.headerPaddingTop}px ${metrics.marginR}px 0px ${metrics.marginL}px`;
  } else {
    div.style.minHeight = `${metrics.footerH}px`;
    div.style.height = `${metrics.footerH}px`;
    div.style.padding = `0px ${metrics.marginR}px ${metrics.footerPaddingBottom}px ${metrics.marginL}px`;
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.justifyContent = 'flex-end';
  }

  // Visual badge indicator (TipTap style)
  const badge = document.createElement('span');
  badge.className = 'hf-band-badge';
  badge.textContent = band === 'header' ? 'Page header' : 'Page footer';
  badge.setAttribute('contenteditable', 'false');
  div.appendChild(badge);

  div.appendChild(createBandTable(band, pageNum, totalPages, setup, docTitle, onEditBand));

  // Edit button
  div.appendChild(
    createEditButton(band, pageNum, onEditBand ?? (() => {}), () => div.getBoundingClientRect()),
  );

  return div;
};

export const buildPagesWidget = ({
  pageCount,
  metrics,
  setup,
  docTitle = '',
  onEditBand,
}: DomBuilderOptions): HTMLElement => {
  const root = document.createElement('div');
  root.id = 'pages';
  root.setAttribute('data-tiptap-pagination', 'true');
  root.setAttribute('contenteditable', 'false');
  root.className = 'ProseMirror-widget';

  const totalPages = Math.max(1, pageCount);

  for (let i = 0; i < totalPages; i += 1) {
    const pageBreak = document.createElement('div');
    pageBreak.className = 'tiptap-page-break';
    pageBreak.setAttribute('data-page-number', String(i));

    // .page spacer
    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page-number', String(i));
    pageDiv.style.position = 'relative';
    pageDiv.style.float = 'left';
    pageDiv.style.clear = 'both';
    pageDiv.style.marginTop = i === 0 ? '0px' : `${metrics.usableH}px`;
    pageBreak.appendChild(pageDiv);

    // .breaker
    const breaker = document.createElement('div');
    breaker.className = 'breaker';
    breaker.setAttribute('data-page-number', String(i));
    breaker.style.width = `calc(${metrics.paperW}px)`;
    breaker.style.marginLeft = `-${metrics.marginL}px`;
    breaker.style.position = 'relative';
    breaker.style.float = 'left';
    breaker.style.clear = 'both';
    breaker.style.left = '0px';
    breaker.style.right = '0px';
    breaker.style.zIndex = '2';

    if (i === 0) {
      breaker.appendChild(
        createBandDiv('header', 1, totalPages, metrics, setup, docTitle, onEditBand),
      );
    } else {
      breaker.appendChild(
        createBandDiv('footer', i, totalPages, metrics, setup, docTitle, onEditBand),
      );

      // Pagination gap (nền xám ngăn cách 2 trang)
      const gapDiv = document.createElement('div');
      gapDiv.className = 'tiptap-pagination-gap';
      gapDiv.style.height = `${metrics.gapH}px`;
      gapDiv.style.borderLeft = '1px solid var(--workspace)';
      gapDiv.style.borderRight = '1px solid var(--workspace)';
      gapDiv.style.position = 'relative';
      gapDiv.style.width = 'calc(100% + 2px)';
      gapDiv.style.left = '-1px';
      gapDiv.style.backgroundColor = 'var(--workspace)';
      breaker.appendChild(gapDiv);

      breaker.appendChild(
        createBandDiv('header', i + 1, totalPages, metrics, setup, docTitle, onEditBand),
      );
    }

    pageBreak.appendChild(breaker);
    root.appendChild(pageBreak);
  }

  // Last page footer breaker
  if (totalPages >= 1) {
    const lastFooterBreaker = document.createElement('div');
    lastFooterBreaker.className = 'tiptap-page-break tiptap-page-break-last';
    lastFooterBreaker.setAttribute('data-page-number', String(totalPages));

    const lastPageSpacer = document.createElement('div');
    lastPageSpacer.className = 'page';
    lastPageSpacer.style.position = 'relative';
    lastPageSpacer.style.float = 'left';
    lastPageSpacer.style.clear = 'both';
    lastPageSpacer.style.marginTop = `${metrics.usableH}px`;
    lastFooterBreaker.appendChild(lastPageSpacer);

    const lastBreaker = document.createElement('div');
    lastBreaker.className = 'breaker';
    lastBreaker.style.width = `calc(${metrics.paperW}px)`;
    lastBreaker.style.marginLeft = `-${metrics.marginL}px`;
    lastBreaker.style.position = 'relative';
    lastBreaker.style.float = 'left';
    lastBreaker.style.clear = 'both';
    lastBreaker.style.left = '0px';
    lastBreaker.style.right = '0px';
    lastBreaker.style.zIndex = '2';

    lastBreaker.appendChild(
      createBandDiv('footer', totalPages, totalPages, metrics, setup, docTitle, onEditBand),
    );

    lastFooterBreaker.appendChild(lastBreaker);
    root.appendChild(lastFooterBreaker);
  }

  return root;
};
