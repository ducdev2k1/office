import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Icon,
  cn,
} from '@office/ui-kit';
import { useTranslation } from '@office/i18n';
import type { PageSetup } from '@/types/docs.types';
import {
  checkVnAdminCompliance,
  STANDARD_VN_ADMIN_PAGE_SETUP,
} from '@/utils/vnAdmin.utils';

interface VnAdminStandardDialogProps {
  open: boolean;
  pageSetup?: PageSetup;
  editor: Editor | null;
  onClose: () => void;
  onApplyPageSetup: (setup: PageSetup) => void;
}

export const VnAdminStandardDialog = ({
  open,
  pageSetup,
  editor,
  onClose,
  onApplyPageSetup,
}: VnAdminStandardDialogProps) => {
  const { t } = useTranslation('docs');
  const [applied, setApplied] = useState(false);
  const report = checkVnAdminCompliance(pageSetup);

  const handleApply = () => {
    onApplyPageSetup(STANDARD_VN_ADMIN_PAGE_SETUP);

    if (editor) {
      editor.chain().focus().setFontFamily('Times New Roman').run();
    }

    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="check-circle-2" size={18} className="text-primary" />
            {t('vnAdmin.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            {t('vnAdmin.description')}
          </p>

          <div className="divide-y divide-border/60 rounded-lg border border-border/80 bg-muted/20">
            {/* Paper Size */}
            <div className="flex items-center justify-between p-3">
              <div>
                <div className="font-semibold text-foreground">{t('vnAdmin.paperSize')}</div>
                <div className="text-[11px] text-muted-foreground">Hiện tại: {pageSetup?.paperSize ?? 'A4'}</div>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  report.isPaperSizeCompliant
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                )}
              >
                {report.isPaperSizeCompliant ? t('vnAdmin.compliant') : t('vnAdmin.nonCompliant')}
              </span>
            </div>

            {/* Margins */}
            <div className="flex items-center justify-between p-3">
              <div>
                <div className="font-semibold text-foreground">{t('vnAdmin.margins')}</div>
                <div className="text-[11px] text-muted-foreground">
                  Trái: 30-35mm · Phải: 15-20mm · Trên/Dưới: 20-25mm
                </div>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  report.isAllMarginsCompliant
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                )}
              >
                {report.isAllMarginsCompliant ? t('vnAdmin.compliant') : t('vnAdmin.nonCompliant')}
              </span>
            </div>

            {/* Font */}
            <div className="flex items-center justify-between p-3">
              <div>
                <div className="font-semibold text-foreground">{t('vnAdmin.font')}</div>
                <div className="text-[11px] text-muted-foreground">{t('vnAdmin.fontSize')}</div>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Times New Roman (13-14pt)
              </span>
            </div>
          </div>

          {applied && (
            <div className="rounded-md bg-emerald-500/10 p-2.5 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {t('vnAdmin.appliedSuccess')}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
          <Button size="sm" onClick={handleApply}>
            <Icon name="sparkles" size={14} className="mr-1" />
            {t('vnAdmin.applyStandard')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
