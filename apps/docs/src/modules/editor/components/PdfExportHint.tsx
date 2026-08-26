import { useTranslation } from '@office/i18n';

interface PdfExportHintProps {
  open: boolean;
}

export const PdfExportHint = ({ open }: PdfExportHintProps) => {
  const { t } = useTranslation('docs');
  if (!open) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-14 left-1/2 z-50 -translate-x-1/2 max-w-[92vw] sm:max-w-md rounded-xl bg-slate-800 dark:bg-slate-700 text-slate-50 text-xs leading-relaxed px-4 py-2.5 shadow-lg shadow-black/25 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {t('export.pdfHint')}
    </div>
  );
};
