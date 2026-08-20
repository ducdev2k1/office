import { useMemo, type MouseEvent } from 'react';
import { useTranslation } from '@office/i18n';
import type { HFAlign, PageSetup } from '@/types/docs.types';
import { resolveSlot } from '@/modules/editor/print/page-tokens.utils';
import type { InlineBandRect } from '@/modules/editor/components/HeaderFooterInlineEditor';

interface PageStackProps {
  pageCount: number;
  setup: PageSetup;
  docTitle: string;
  onEditBand?: (request: InlineEditRequest) => void;
}

export interface InlineEditRequest {
  band: 'header' | 'footer';
  pageIndex: number;
  slot: HFAlign;
  rect: InlineBandRect;
}

export const PageStack = ({ pageCount, setup, docTitle, onEditBand }: PageStackProps) => {
  const { t } = useTranslation('docs');
  const tokenDate = useMemo(() => new Date(), []);
  const tokenCtx = useMemo(
    () => ({
      title: docTitle,
      date: tokenDate,
      locale: 'vi' as const,
    }),
    [docTitle, tokenDate],
  );

  const pages = useMemo(() => {
    return Array.from({ length: pageCount }).map((_, i) => {
      const headerSlots = resolveSlot(
        setup.header,
        setup.pageNumber,
        'header',
        i,
        pageCount,
        tokenCtx,
      );
      const footerSlots = resolveSlot(
        setup.footer,
        setup.pageNumber,
        'footer',
        i,
        pageCount,
        tokenCtx,
      );
      return {
        key: i,
        header: headerSlots,
        footer: footerSlots,
      };
    });
  }, [pageCount, setup, tokenCtx]);

  const handleBandDoubleClick = (
    band: 'header' | 'footer',
    pageIndex: number,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (!onEditBand) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = rect.width > 0 ? x / rect.width : 0;
    const slot: HFAlign = ratio < 1 / 3 ? 'left' : ratio < 2 / 3 ? 'center' : 'right';
    onEditBand({
      band,
      pageIndex,
      slot,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    });
  };

  return (
    <div className="page-stack" aria-hidden="true">
      {pages.map((p) => (
        <div key={p.key} className="page">
          <div
            className="page-hf page-header"
            onDoubleClick={(e) => handleBandDoubleClick('header', p.key, e)}
          >
            <span>{p.header.left}</span>
            <span>{p.header.center}</span>
            <span>{p.header.right}</span>
          </div>
          <div
            className="page-hf page-footer"
            onDoubleClick={(e) => handleBandDoubleClick('footer', p.key, e)}
          >
            <span>{p.footer.left}</span>
            <span>{p.footer.center}</span>
            <span>{p.footer.right}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
