import { useEffect, useState } from 'react';
import { PAPER_SIZES, type PageSetup } from '../types';

interface PageSetupPanelProps {
  setup: PageSetup;
  onApply: (setup: PageSetup) => void;
  onClose: () => void;
}

export const PageSetupPanel = ({ setup, onApply, onClose }: PageSetupPanelProps) => {
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

  return (
    <div className="page-setup-panel" role="dialog" aria-label="Cau hinh trang">
      <div className="panel-title">Cau hinh trang</div>
      <label className="panel-field">
        <span>Kho giay</span>
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
        <span>Huong</span>
        <select
          value={draft.orientation}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              orientation: event.target.value as PageSetup['orientation'],
            }))
          }
        >
          <option value="portrait">Doc (Portrait)</option>
          <option value="landscape">Ngang (Landscape)</option>
        </select>
      </label>
      <div className="panel-field">
        <span>Le (mm)</span>
        <div className="margin-grid">
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <label key={side} className="margin-input">
              <span>{side}</span>
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
          Ap dung
        </button>
        <button type="button" onClick={onClose}>
          Huy
        </button>
      </div>
    </div>
  );
};
