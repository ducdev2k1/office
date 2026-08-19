import { PAPER_SIZES, type PageSetup } from '@/types/docs.types';
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
import { useEffect, useState } from 'react';

interface PageSetupPanelProps {
  open: boolean;
  setup: PageSetup;
  onApply: (setup: PageSetup) => void;
  onClose: () => void;
}

export const PageSetupPanel = ({ open, setup, onApply, onClose }: PageSetupPanelProps) => {
  const { t } = useTranslation('docs');
  const [draft, setDraft] = useState<PageSetup>(setup);

  useEffect(() => {
    setDraft(setup);
  }, [setup]);

  const { width, height } = PAPER_SIZES[draft.paperSize];
  const [w, h] = draft.orientation === 'landscape' ? [height, width] : [width, height];

  const setMargin = (side: keyof PageSetup['margins'], value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    setDraft((current) => ({
      ...current,
      margins: { ...current.margins, [side]: Math.min(50, Math.max(5, num)) },
    }));
  };

  const marginLabels: Record<keyof PageSetup['margins'], string> = {
    top: t('pageSetup.marginTop'),
    bottom: t('pageSetup.marginBottom'),
    left: t('pageSetup.marginLeft'),
    right: t('pageSetup.marginRight'),
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{t('pageSetup.title')}</DialogTitle>
          <DialogDescription>
            {draft.paperSize.toUpperCase()} ({w} × {h} mm)
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
              {t('pageSetup.paperSize')}
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={draft.paperSize}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    paperSize: event.target.value as PageSetup['paperSize'],
                  }))
                }
              >
                <option value="a4">{t('pageSetup.paperSizes.a4')}</option>
                <option value="a5">{t('pageSetup.paperSizes.a5')}</option>
                <option value="letter">{t('pageSetup.paperSizes.letter')}</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
              {t('pageSetup.orientation')}
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={draft.orientation}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    orientation: event.target.value as PageSetup['orientation'],
                  }))
                }
              >
                <option value="portrait">{t('pageSetup.orientations.portrait')}</option>
                <option value="landscape">{t('pageSetup.orientations.landscape')}</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">{t('pageSetup.margins')}</span>
            <div className="grid grid-cols-2 gap-2.5">
              {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                <label
                  key={side}
                  className="flex items-center justify-between rounded-md border border-input px-3 py-1.5 text-xs text-muted-foreground"
                >
                  <span>{marginLabels[side]}</span>
                  <input
                    className="w-14 rounded border border-input bg-background px-2 py-0.5 text-right text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    type="number"
                    min="5"
                    max="50"
                    value={draft.margins[side]}
                    onChange={(event) => setMargin(side, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('pageSetup.cancel')}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            {t('pageSetup.apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
