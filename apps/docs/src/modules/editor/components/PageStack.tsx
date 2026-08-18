import { useMemo } from 'react';
import type { PageSetup } from '@/types/docs.types';
import { resolveSlot } from '@/modules/editor/print/page-tokens.utils';

interface PageStackProps {
  pageCount: number;
  setup: PageSetup;
  docTitle: string;
}

export const PageStack = ({ pageCount, setup, docTitle }: PageStackProps) => {
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
      const headerSlots = resolveSlot(setup.header, setup.pageNumber, 'header', i, pageCount, tokenCtx);
      const footerSlots = resolveSlot(setup.footer, setup.pageNumber, 'footer', i, pageCount, tokenCtx);
      return {
        key: i,
        header: headerSlots,
        footer: footerSlots,
      };
    });
  }, [pageCount, setup, tokenCtx]);

  return (
    <div className="page-stack" aria-hidden="true">
      {pages.map((p) => (
        <div key={p.key} className="page">
          <div className="page-hf page-header">
            <span>{p.header.left}</span>
            <span>{p.header.center}</span>
            <span>{p.header.right}</span>
          </div>
          <div className="page-hf page-footer">
            <span>{p.footer.left}</span>
            <span>{p.footer.center}</span>
            <span>{p.footer.right}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
