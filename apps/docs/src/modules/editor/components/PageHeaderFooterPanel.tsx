import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@office/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@office/ui-kit';
import { resolveSlot } from '@/modules/editor/print/page-tokens.utils';
import type { HeaderFooterSlot, HFAlign, PageNumberSetup, PageSetup } from '@/types/docs.types';

interface PageHeaderFooterPanelProps {
  open: boolean;
  setup: PageSetup;
  docTitle?: string;
  onApply: (setup: PageSetup) => void;
  onClose: () => void;
}

type SlotField = 'header-left' | 'header-center' | 'header-right' | 'footer-left' | 'footer-center' | 'footer-right';

export const PageHeaderFooterPanel = ({
  open,
  setup,
  docTitle = 'Tài liệu',
  onApply,
  onClose,
}: PageHeaderFooterPanelProps) => {
  const { t } = useTranslation('docs');
  const [draft, setDraft] = useState<PageSetup>(setup);
  const [lastFocusedField, setLastFocusedField] = useState<SlotField>('footer-center');
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    setDraft(setup);
  }, [setup]);

  const header = useMemo<HeaderFooterSlot>(
    () => draft.header ?? { left: '', center: '', right: '' },
    [draft.header],
  );

  const footer = useMemo<HeaderFooterSlot>(
    () => draft.footer ?? { left: '', center: '', right: '' },
    [draft.footer],
  );

  const pageNumber = useMemo<PageNumberSetup>(
    () =>
      draft.pageNumber ?? {
        enabled: false,
        position: 'footer',
        align: 'center',
        format: '{page}',
        startAt: 1,
        skipFirstPage: false,
      },
    [draft.pageNumber],
  );

  const updateHeaderSlot = (align: keyof HeaderFooterSlot, value: string) => {
    setDraft((cur) => ({
      ...cur,
      header: {
        ...(cur.header ?? { left: '', center: '', right: '' }),
        [align]: value,
      },
    }));
  };

  const updateFooterSlot = (align: keyof HeaderFooterSlot, value: string) => {
    setDraft((cur) => ({
      ...cur,
      footer: {
        ...(cur.footer ?? { left: '', center: '', right: '' }),
        [align]: value,
      },
    }));
  };

  const updatePageNumber = (updates: Partial<PageNumberSetup>) => {
    setDraft((cur) => ({
      ...cur,
      pageNumber: {
        ...(cur.pageNumber ?? pageNumber),
        ...updates,
      },
    }));
  };

  const insertToken = (token: string) => {
    const [band, align] = lastFocusedField.split('-') as ['header' | 'footer', keyof HeaderFooterSlot];
    if (band === 'header') {
      const current = header[align] || '';
      updateHeaderSlot(align, current ? `${current} ${token}` : token);
    } else {
      const current = footer[align] || '';
      updateFooterSlot(align, current ? `${current} ${token}` : token);
    }
  };

  const previewDate = useMemo(() => new Date(), []);
  const previewCtx = useMemo(
    () => ({
      title: docTitle,
      date: previewDate,
      locale: 'vi' as const,
    }),
    [docTitle, previewDate],
  );

  const previewHeader = useMemo(
    () => resolveSlot(draft.header, draft.pageNumber, 'header', 0, 3, previewCtx),
    [draft.header, draft.pageNumber, previewCtx],
  );

  const previewFooter = useMemo(
    () => resolveSlot(draft.footer, draft.pageNumber, 'footer', 0, 3, previewCtx),
    [draft.footer, draft.pageNumber, previewCtx],
  );

  const handleApply = () => {
    onApply(draft);
    setLiveAnnouncement(t('headerFooter.applied'));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-[560px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{t('headerFooter.title')}</DialogTitle>
          <DialogDescription>{t('headerFooter.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-5 text-xs">
          {/* Section: Tokens Toolbar */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
            <span className="font-semibold text-foreground">{t('headerFooter.tokens.label')}</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: t('headerFooter.tokens.page'), token: '{page}' },
                { label: t('headerFooter.tokens.pages'), token: '{pages}' },
                { label: t('headerFooter.tokens.docTitle'), token: '{title}' },
                { label: t('headerFooter.tokens.date'), token: '{date}' },
              ].map(({ label, token }) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => insertToken(token)}
                  className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[11px] font-medium text-foreground shadow-2xs hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Header Content */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{t('headerFooter.header')}</span>
              <label className="flex items-center gap-1.5 text-muted-foreground">
                <span>{t('headerFooter.headerMargin')}</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={draft.headerMargin ?? 10}
                  onChange={(e) =>
                    setDraft((cur) => ({ ...cur, headerMargin: Math.max(0, Number(e.target.value) || 0) }))
                  }
                  className="w-14 rounded border border-input bg-background px-2 py-0.5 text-right font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'center', 'right'] as const).map((align) => (
                <div key={`hdr-${align}`} className="space-y-1">
                  <span className="text-muted-foreground text-[11px]">
                    {t(`headerFooter.align${align.charAt(0).toUpperCase() + align.slice(1)}` as any)}
                  </span>
                  <input
                    type="text"
                    value={header[align]}
                    onFocus={() => setLastFocusedField(`header-${align}`)}
                    onChange={(e) => updateHeaderSlot(align, e.target.value)}
                    placeholder={t(`headerFooter.align${align.charAt(0).toUpperCase() + align.slice(1)}` as any)}
                    className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Footer Content */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{t('headerFooter.footer')}</span>
              <label className="flex items-center gap-1.5 text-muted-foreground">
                <span>{t('headerFooter.footerMargin')}</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={draft.footerMargin ?? 10}
                  onChange={(e) =>
                    setDraft((cur) => ({ ...cur, footerMargin: Math.max(0, Number(e.target.value) || 0) }))
                  }
                  className="w-14 rounded border border-input bg-background px-2 py-0.5 text-right font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'center', 'right'] as const).map((align) => (
                <div key={`ftr-${align}`} className="space-y-1">
                  <span className="text-muted-foreground text-[11px]">
                    {t(`headerFooter.align${align.charAt(0).toUpperCase() + align.slice(1)}` as any)}
                  </span>
                  <input
                    type="text"
                    value={footer[align]}
                    onFocus={() => setLastFocusedField(`footer-${align}`)}
                    onChange={(e) => updateFooterSlot(align, e.target.value)}
                    placeholder={t(`headerFooter.align${align.charAt(0).toUpperCase() + align.slice(1)}` as any)}
                    className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Page Numbering */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{t('headerFooter.pageNumber.title')}</span>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageNumber.enabled}
                  onChange={(e) => updatePageNumber({ enabled: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-ring h-4 w-4"
                />
                <span className="font-medium text-foreground">{t('headerFooter.pageNumber.enable')}</span>
              </label>
            </div>

            {pageNumber.enabled && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">{t('headerFooter.pageNumber.position')}</span>
                  <select
                    value={pageNumber.position}
                    onChange={(e) =>
                      updatePageNumber({ position: e.target.value as 'header' | 'footer' })
                    }
                    className="h-8 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="header">{t('headerFooter.pageNumber.positionHeader')}</option>
                    <option value="footer">{t('headerFooter.pageNumber.positionFooter')}</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">{t('headerFooter.pageNumber.align')}</span>
                  <select
                    value={pageNumber.align}
                    onChange={(e) => updatePageNumber({ align: e.target.value as HFAlign })}
                    className="h-8 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="left">{t('headerFooter.alignLeft')}</option>
                    <option value="center">{t('headerFooter.alignCenter')}</option>
                    <option value="right">{t('headerFooter.alignRight')}</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">{t('headerFooter.pageNumber.format')}</span>
                  <select
                    value={pageNumber.format}
                    onChange={(e) => updatePageNumber({ format: e.target.value })}
                    className="h-8 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="{page}">{t('headerFooter.pageNumber.formatSimple')}</option>
                    <option value="{page} / {pages}">{t('headerFooter.pageNumber.formatTotal')}</option>
                    <option value="Trang {page}">{t('headerFooter.pageNumber.formatPrefixed')}</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">{t('headerFooter.pageNumber.startAt')}</span>
                  <input
                    type="number"
                    min="1"
                    value={pageNumber.startAt}
                    onChange={(e) =>
                      updatePageNumber({ startAt: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="h-8 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </label>

                <label className="col-span-2 inline-flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={pageNumber.skipFirstPage}
                    onChange={(e) => updatePageNumber({ skipFirstPage: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-ring h-4 w-4"
                  />
                  <span className="text-muted-foreground">{t('headerFooter.pageNumber.skipFirst')}</span>
                </label>
              </div>
            )}
          </div>

          {/* Section: Live Preview Box */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <span className="font-semibold text-foreground">{t('headerFooter.preview')} (Trang 1 / 3)</span>
            <div className="rounded-lg border border-border bg-card p-3 space-y-4 shadow-2xs">
              <div className="flex justify-between text-[11px] text-muted-foreground border-b border-border/50 pb-1">
                <span className="flex-1 truncate">{previewHeader.left || '—'}</span>
                <span className="flex-1 text-center truncate">{previewHeader.center || '—'}</span>
                <span className="flex-1 text-right truncate">{previewHeader.right || '—'}</span>
              </div>
              <div className="py-2 text-center text-muted-foreground/50 text-[10px] italic">
                {`[ ${docTitle} ]`}
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-1">
                <span className="flex-1 truncate">{previewFooter.left || '—'}</span>
                <span className="flex-1 text-center truncate">{previewFooter.center || '—'}</span>
                <span className="flex-1 text-right truncate">{previewFooter.right || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sr-only" aria-live="polite" role="status">
          {liveAnnouncement}
        </div>

        <DialogFooter className="p-6 pt-2 gap-2 sm:gap-0 border-t border-border bg-background">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('headerFooter.cancel')}
          </Button>
          <Button size="sm" onClick={handleApply}>
            {t('headerFooter.apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
