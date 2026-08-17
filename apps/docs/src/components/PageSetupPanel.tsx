import { useTranslation } from '@office/i18n';
import { useEffect, useState } from 'react';
import { PAPER_SIZES, type PageSetup } from '@/types';

interface PageSetupPanelProps {
  setup: PageSetup;
  onApply: (setup: PageSetup) => void;
  onClose: () => void;
}

export const PageSetupPanel = ({ setup, onApply, onClose }: PageSetupPanelProps) => {
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
    <div className="page-setup-panel" role="dialog" aria-label={t('pageSetup.title')}>
      <div className="panel-title">{t('pageSetup.title')}</div>
      <label className="panel-field">
        <span>{t('pageSetup.paperSize')}</span>
        <select
          value={draft.paperSize}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              paperSize: event.target.value as PageSetup['paperSize'],
            }))
          }
        >
          <option value="a4">A4</option>
          <option value="a5">A5</option>
          <option value="letter">Letter</option>
        </select>
      </label>
      <label className="panel-field">
        <span>{t('pageSetup.orientation')}</span>
        <select
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
      <div className="panel-field">
        <span>{t('pageSetup.margins')}</span>
        <div className="margin-grid">
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <label key={side} className="margin-input">
              <span>{marginLabels[side]}</span>
              <input
                type="number"
                min={0}
                max={80}
                value={draft.margins[side]}
                onChange={(event) => setMargin(side, event.target.value)}
              />
            </label>
          ))}
        </div>
      </div>
      <div className="panel-preview">
        {draft.paperSize.toUpperCase()} {w}×{h}mm
      </div>
      <div className="panel-actions">
        <button type="button" onClick={() => onApply(draft)}>
          {t('pageSetup.apply')}
        </button>
        <button type="button" onClick={onClose}>
          {t('pageSetup.cancel')}
        </button>
      </div>
    </div>
  );
};