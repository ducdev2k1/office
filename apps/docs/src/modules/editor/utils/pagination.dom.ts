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

    if (onEditBand) {
      td.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        onEditBand(band, pageNum - 1, key, td.getBoundingClientRect());
      });
    }

    tr.appendChild(td);
  }

  tbody.appendChild(tr);
  table.appendChild(tbody);
  return table;
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
      // Header for Page 1
      const headerDiv = document.createElement('div');
      headerDiv.className = 'tiptap-page-header';
      headerDiv.setAttribute('data-editable', 'true');
      headerDiv.setAttribute('data-header-page-number', '1');
      headerDiv.setAttribute('data-header-type', 'default');
      headerDiv.style.minHeight = `${metrics.headerH}px`;
      headerDiv.style.height = `${metrics.headerH}px`;
      headerDiv.style.padding = `${metrics.headerPaddingTop}px ${metrics.marginR}px 0px ${metrics.marginL}px`;
      headerDiv.style.cursor = 'pointer';
      headerDiv.appendChild(
        createBandTable('header', 1, totalPages, setup, docTitle, onEditBand),
      );
      breaker.appendChild(headerDiv);
    } else {
      // Footer for Page i
      const footerDiv = document.createElement('div');
      footerDiv.className = 'tiptap-page-footer';
      footerDiv.setAttribute('data-editable', 'true');
      footerDiv.setAttribute('data-footer-page-number', String(i));
      footerDiv.setAttribute('data-footer-type', 'default');
      footerDiv.style.minHeight = `${metrics.footerH}px`;
      footerDiv.style.height = `${metrics.footerH}px`;
      footerDiv.style.padding = `0px ${metrics.marginR}px ${metrics.footerPaddingBottom}px ${metrics.marginL}px`;
      footerDiv.style.display = 'flex';
      footerDiv.style.flexDirection = 'column';
      footerDiv.style.justifyContent = 'flex-end';
      footerDiv.style.cursor = 'pointer';
      footerDiv.appendChild(
        createBandTable('footer', i, totalPages, setup, docTitle, onEditBand),
      );
      breaker.appendChild(footerDiv);

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

      // Header for Page i + 1
      const headerDiv = document.createElement('div');
      headerDiv.className = 'tiptap-page-header';
      headerDiv.setAttribute('data-editable', 'true');
      headerDiv.setAttribute('data-header-page-number', String(i + 1));
      headerDiv.setAttribute('data-header-type', 'default');
      headerDiv.style.minHeight = `${metrics.headerH}px`;
      headerDiv.style.height = `${metrics.headerH}px`;
      headerDiv.style.padding = `${metrics.headerPaddingTop}px ${metrics.marginR}px 0px ${metrics.marginL}px`;
      headerDiv.style.cursor = 'pointer';
      headerDiv.appendChild(
        createBandTable('header', i + 1, totalPages, setup, docTitle, onEditBand),
      );
      breaker.appendChild(headerDiv);
    }

    pageBreak.appendChild(breaker);
    root.appendChild(pageBreak);
  }

  // Last page footer breaker (hiển thị footer cho trang cuối cùng)
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

    const lastFooterDiv = document.createElement('div');
    lastFooterDiv.className = 'tiptap-page-footer';
    lastFooterDiv.setAttribute('data-editable', 'true');
    lastFooterDiv.setAttribute('data-footer-page-number', String(totalPages));
    lastFooterDiv.setAttribute('data-footer-type', 'default');
    lastFooterDiv.style.minHeight = `${metrics.footerH}px`;
    lastFooterDiv.style.height = `${metrics.footerH}px`;
    lastFooterDiv.style.padding = `0px ${metrics.marginR}px ${metrics.footerPaddingBottom}px ${metrics.marginL}px`;
    lastFooterDiv.style.display = 'flex';
    lastFooterDiv.style.flexDirection = 'column';
    lastFooterDiv.style.justifyContent = 'flex-end';
    lastFooterDiv.style.cursor = 'pointer';
    lastFooterDiv.appendChild(
      createBandTable('footer', totalPages, totalPages, setup, docTitle, onEditBand),
    );
    lastBreaker.appendChild(lastFooterDiv);

    lastFooterBreaker.appendChild(lastBreaker);
    root.appendChild(lastFooterBreaker);
  }

  return root;
};
