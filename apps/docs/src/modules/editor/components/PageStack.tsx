import { memo, useMemo, type MouseEvent } from 'react';
import { useTranslation } from '@office/i18n';
import { Icon, Tooltip, TooltipContent, TooltipTrigger } from '@office/ui-kit';
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

const PageStackImpl = ({ pageCount, setup, docTitle, onEditBand }: PageStackProps) => {
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

  const handleOpenHf = (band: 'header' | 'footer', pageIndex: number, event?: MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    window.dispatchEvent(
      new CustomEvent('doc-open-hf-panel', {
        detail: { band, pageIndex, slot: 'center' },
      }),
    );
  };

  const handleBandDoubleClick = (
    band: 'header' | 'footer',
    pageIndex: number,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = rect.width > 0 ? x / rect.width : 0;
    const slot: HFAlign = ratio < 1 / 3 ? 'left' : ratio < 2 / 3 ? 'center' : 'right';

    if (onEditBand) {
      onEditBand({
        band,
        pageIndex,
        slot,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      });
    } else {
      window.dispatchEvent(
        new CustomEvent('doc-open-hf-panel', {
          detail: { band, pageIndex, slot },
        }),
      );
    }
  };

  return (
    <div className="page-stack pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {/* Background paper pages & watermark */}
      <div className="page-bg-stack absolute inset-0 z-0 grid gap-4 pointer-events-none">
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
          </div>
        ))}
      </div>

      {/* Header and Footer interactive overlay */}
      <div className="page-hf-stack absolute inset-0 z-10 grid gap-4 pointer-events-none">
        {pages.map((p) => {
          const isHeaderEmpty = !p.header.left && !p.header.center && !p.header.right;
          const isFooterEmpty = !p.footer.left && !p.footer.center && !p.footer.right;

          return (
            <div
              key={p.key}
              className="page-hf-container relative pointer-events-none"
              style={{
                width: 'var(--paper-w, 793.701px)',
                height: 'var(--paper-h, 1122.52px)',
                margin: '0 auto',
              }}
            >
              {/* Header Band */}
              <div
                className="page-hf page-header group pointer-events-auto"
                onClick={() => handleOpenHf('header', p.key)}
                onDoubleClick={(e) => handleBandDoubleClick('header', p.key, e)}
              >
                <span className="hf-band-badge">{t('headerFooter.header')}</span>

                {isHeaderEmpty ? (
                  <span className="text-muted-foreground/60 italic text-[11px] opacity-0 group-hover:opacity-100 transition-opacity pl-1 select-none">
                    {t('headerFooter.emptyHeaderPlaceholder')}
                  </span>
                ) : (
                  <>
                    <span>{p.header.left}</span>
                    <span>{p.header.center}</span>
                    <span>{p.header.right}</span>
                  </>
                )}

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        className="hf-edit-btn"
                        onClick={(e) => handleOpenHf('header', p.key, e)}
                        aria-label={t('headerFooter.editHeader')}
                      >
                        <Icon name="edit" size={13} />
                        <span>{t('headerFooter.editHeader')}</span>
                      </button>
                    }
                  />
                  <TooltipContent side="left">{t('headerFooter.editHeader')}</TooltipContent>
                </Tooltip>
              </div>

              {/* Footer Band */}
              <div
                className="page-hf page-footer group pointer-events-auto"
                onClick={() => handleOpenHf('footer', p.key)}
                onDoubleClick={(e) => handleBandDoubleClick('footer', p.key, e)}
              >
                <span className="hf-band-badge">{t('headerFooter.footer')}</span>

                {isFooterEmpty ? (
                  <span className="text-muted-foreground/60 italic text-[11px] opacity-0 group-hover:opacity-100 transition-opacity pl-1 select-none">
                    {t('headerFooter.emptyFooterPlaceholder')}
                  </span>
                ) : (
                  <>
                    <span>{p.footer.left}</span>
                    <span>{p.footer.center}</span>
                    <span>{p.footer.right}</span>
                  </>
                )}

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        className="hf-edit-btn"
                        onClick={(e) => handleOpenHf('footer', p.key, e)}
                        aria-label={t('headerFooter.editFooter')}
                      >
                        <Icon name="edit" size={13} />
                        <span>{t('headerFooter.editFooter')}</span>
                      </button>
                    }
                  />
                  <TooltipContent side="left">{t('headerFooter.editFooter')}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PageStack = memo(PageStackImpl);
