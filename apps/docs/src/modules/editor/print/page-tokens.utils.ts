import { formatDateTime, type Locale } from '@office/i18n';
import type { HeaderFooterSlot, HFAlign, PageNumberSetup } from '@/types/docs.types';

export interface TokenContext {
  page: number;
  pages: number;
  title: string;
  date: Date;
  locale: Locale;
}

export const renderTokens = (template: string, ctx: TokenContext): string => {
  if (!template) return '';
  const dateStr = formatDateTime(ctx.date, ctx.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return template.replace(/\{([^}]+)\}/g, (match, tokenName) => {
    switch (tokenName.trim().toLowerCase()) {
      case 'page':
        return String(ctx.page);
      case 'pages':
        return String(ctx.pages);
      case 'title':
        return ctx.title;
      case 'date':
        return dateStr;
      default:
        return match;
    }
  });
};

export const resolveSlot = (
  slot: HeaderFooterSlot | undefined,
  pageNumber: PageNumberSetup | undefined,
  band: 'header' | 'footer',
  pageIndex: number,
  pageCount: number,
  ctx: Omit<TokenContext, 'page' | 'pages'>,
): Record<HFAlign, string> => {
  const result: Record<HFAlign, string> = {
    left: slot?.left
      ? renderTokens(slot.left, { ...ctx, page: pageIndex + 1, pages: pageCount })
      : '',
    center: slot?.center
      ? renderTokens(slot.center, { ...ctx, page: pageIndex + 1, pages: pageCount })
      : '',
    right: slot?.right
      ? renderTokens(slot.right, { ...ctx, page: pageIndex + 1, pages: pageCount })
      : '',
  };

  if (pageNumber?.enabled && pageNumber.position === band) {
    if (!(pageNumber.skipFirstPage && pageIndex === 0)) {
      const page = pageIndex + (pageNumber.startAt ?? 1);
      const pages = pageCount;
      const numText = renderTokens(pageNumber.format || '{page}', {
        ...ctx,
        page,
        pages,
      });
      const align = pageNumber.align || 'center';
      const existing = result[align];
      result[align] = existing ? `${existing} ${numText}`.trim() : numText;
    }
  }

  return result;
};
