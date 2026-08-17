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
import { PAPER_SIZES, type PageSetup } from '@/types';

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
      margins: { ...current.margins, [side]: num },
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('pageSetup.title')}</DialogTitle>
          <DialogDescription>
            {draft.paperSize.toUpperCase()} ({w} × {h} mm)
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
              <span>{t('pageSetup.paperSize')}</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={draft.paperSize}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    paperSize: event.target.value as PageSetup['paperSize'],
                  }))
                }
              >
                <option value="a4">A4 (210 × 297 mm)</option>
                <option value="a5">A5 (148 × 210 mm)</option>
                <option value="letter">Letter (8.5 × 11 in)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
              <span>{t('pageSetup.orientation')}</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={draft.orientation}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    orientation: event.target.value as PageSetup['orientation'],
                  }))
                }
              >
                <option value="portrait">{t('pageSetup.portrait')}</option>
                <option value="landscape">{t('pageSetup.landscape')}</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">{t('pageSetup.margins')} (mm)</span>
            <div className="grid grid-cols-2 gap-3">
              {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                <label
                  key={side}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs"
                >
                  <span className="text-muted-foreground">{marginLabels[side]}</span>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    className="h-7 w-16 rounded border border-input bg-background px-2 text-right text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                    value={draft.margins[side]}
                    onChange={(event) => setMargin(side, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" type="button" onClick={onClose}>
            {t('pageSetup.cancel')}
          </Button>
          <Button type="button" onClick={() => onApply(draft)}>
            {t('pageSetup.apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};