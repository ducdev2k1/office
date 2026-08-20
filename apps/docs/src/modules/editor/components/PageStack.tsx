import { useMemo, type MouseEvent } from 'react';
import type { HFAlign, HeaderFooterSlot, PageSetup } from '@/types/docs.types';
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

const getEffectiveSlot = (
  setup: PageSetup,
  band: 'header' | 'footer',
  pageIndex: number,
): HeaderFooterSlot | undefined => {
  const isFirstPage = pageIndex === 0;
  const isEvenPage = pageIndex % 2 === 1; // 0-based: index 1 is page 2 (even)

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

export const PageStack = ({ pageCount, setup, docTitle, onEditBand }: PageStackProps) => {
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
      const headerSlot = getEffectiveSlot(setup, 'header', i);
      const footerSlot = getEffectiveSlot(setup, 'footer', i);

      const headerSlots = resolveSlot(
        headerSlot,
        setup.pageNumber,
        'header',
        i,
        pageCount,
        tokenCtx,
      );
      const footerSlots = resolveSlot(
        footerSlot,
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
        <div key={p.key} className="page relative">
          {setup.watermark?.enabled && setup.watermark.text && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
              style={{ opacity: setup.watermark.opacity ?? 0.15 }}
            >
              <div
                className="font-bold tracking-widest uppercase transform -rotate-45 whitespace-nowrap text-center"
                style={{
                  color: setup.watermark.color || '#64748B',
                  fontSize: `${setup.watermark.fontSize || 48}px`,
                }}
              >
                {setup.watermark.text}
              </div>
            </div>
          )}

          <div
            className="page-hf page-header z-10"
            onDoubleClick={(e) => handleBandDoubleClick('header', p.key, e)}
          >
            <span>{p.header.left}</span>
            <span>{p.header.center}</span>
            <span>{p.header.right}</span>
          </div>
          <div
            className="page-hf page-footer z-10"
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
