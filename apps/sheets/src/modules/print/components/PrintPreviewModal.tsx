import { DEFAULT_PRINT_SETTINGS } from '@/modules/print/constants/print.constants';
import { PrintSettingsPanel } from '@/modules/print/components/PrintSettingsPanel';
import type { PrintSettings } from '@/modules/print/types/print.types';
import { exportWorksheetToPdf } from '@/modules/print/utils/pdfGenerator.utils';
import { useTranslation } from '@office/i18n';
import { Button, Dialog, DialogContent, Icon, cn } from '@office/ui-kit';
import type { IWorkbookData } from '@univerjs/presets';
import { useState } from 'react';

interface PrintPreviewModalProps {
  open: boolean;
  onClose: () => void;
  workbookData?: IWorkbookData;
  activeSheetId?: string;
  documentTitle?: string;
}

export const PrintPreviewModal = ({
  open,
  onClose,
  workbookData,
  activeSheetId = 'sheet-01',
  documentTitle = 'Spreadsheet',
}: PrintPreviewModalProps) => {
  const { t } = useTranslation('sheets');
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSettingsChange = (partial: Partial<PrintSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleDownloadPdf = async () => {
    if (!workbookData) return;
    setIsGeneratingPdf(true);
    try {
      const blob = await exportWorksheetToPdf(workbookData, activeSheetId, settings);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[PrintPreviewModal] PDF export failed:', err);
      window.alert('Không thể tạo tệp PDF. Vui lòng thử lại.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentSheet = workbookData?.sheets?.[activeSheetId];
  const isLandscape = settings.orientation === 'landscape';

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col gap-0 border-border bg-background">
        {/* Top bar header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-4 bg-muted/40 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="printer" size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{t('printModal.preview')}</h2>
            <span className="text-xs text-muted-foreground">({documentTitle})</span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </Button>
        </div>

        {/* Body: Left Preview Page + Right Settings Panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Preview Screen */}
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-900/60 p-6 overflow-auto flex items-center justify-center">
            <div
              className={cn(
                'bg-white text-zinc-900 shadow-xl rounded-sm p-8 transition-all duration-300 flex flex-col border border-zinc-200',
                isLandscape ? 'w-[680px] h-[480px]' : 'w-[480px] h-[680px]',
              )}
            >
              {/* Simulated Sheet Title */}
              <div className="border-b pb-2 mb-3">
                <h4 className="text-sm font-bold text-zinc-900">
                  {currentSheet?.name || 'Sheet 1'}
                </h4>
                <p className="text-[10px] text-zinc-500">{new Date().toLocaleDateString('vi-VN')}</p>
              </div>

              {/* Simulated Sheet Grid Table */}
              <div className="flex-1 border border-zinc-300 rounded-xs overflow-hidden text-[10px]">
                <table className="w-full border-collapse">
                  {settings.showHeaders && (
                    <thead>
                      <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-500 font-semibold">
                        <th className="w-6 border-r border-zinc-300 p-1 text-center">#</th>
                        <th className="border-r border-zinc-300 p-1 text-left">A</th>
                        <th className="border-r border-zinc-300 p-1 text-left">B</th>
                        <th className="border-r border-zinc-300 p-1 text-left">C</th>
                        <th className="p-1 text-left">D</th>
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((rowIdx) => (
                      <tr
                        key={rowIdx}
                        className={cn(settings.showGridlines && 'border-b border-zinc-200')}
                      >
                        {settings.showHeaders && (
                          <td className="bg-zinc-50 border-r border-zinc-300 p-1 text-center font-mono text-zinc-400">
                            {rowIdx + 1}
                          </td>
                        )}
                        <td
                          className={cn(
                            'p-1.5 truncate text-zinc-700',
                            settings.showGridlines && 'border-r border-zinc-200',
                          )}
                        >
                          {currentSheet?.cellData?.[rowIdx]?.[0]?.v ?? (rowIdx === 0 ? 'Dữ liệu A' : `Mục ${rowIdx}`)}
                        </td>
                        <td
                          className={cn(
                            'p-1.5 truncate text-zinc-700',
                            settings.showGridlines && 'border-r border-zinc-200',
                          )}
                        >
                          {currentSheet?.cellData?.[rowIdx]?.[1]?.v ?? `Giá trị ${rowIdx * 100}`}
                        </td>
                        <td
                          className={cn(
                            'p-1.5 truncate text-zinc-700',
                            settings.showGridlines && 'border-r border-zinc-200',
                          )}
                        >
                          {currentSheet?.cellData?.[rowIdx]?.[2]?.v ?? 'Hoàn tất'}
                        </td>
                        <td className="p-1.5 truncate text-zinc-700">
                          {currentSheet?.cellData?.[rowIdx]?.[3]?.v ?? (rowIdx * 50000).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Simulated Page Footer */}
              <div className="pt-3 mt-auto flex items-center justify-between text-[9px] text-zinc-400">
                <span>OneMail Sheets Suite</span>
                <span>{t('printModal.page', { current: 1, total: 1 })}</span>
              </div>
            </div>
          </div>

          {/* Right Settings */}
          <PrintSettingsPanel
            settings={settings}
            onChange={handleSettingsChange}
            onPrint={handlePrint}
            onDownloadPdf={handleDownloadPdf}
            isGeneratingPdf={isGeneratingPdf}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
