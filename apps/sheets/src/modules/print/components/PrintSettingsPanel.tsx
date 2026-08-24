import type {
  MarginOption,
  PaperOrientation,
  PaperSize,
  PrintRangeOption,
  PrintSettings,
  ScaleOption,
} from '@/modules/print/types/print.types';
import { useTranslation } from '@office/i18n';
import { Button, Icon, cn } from '@office/ui-kit';

interface PrintSettingsPanelProps {
  settings: PrintSettings;
  onChange: (partial: Partial<PrintSettings>) => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf?: boolean;
}

export const PrintSettingsPanel = ({
  settings,
  onChange,
  onPrint,
  onDownloadPdf,
  isGeneratingPdf = false,
}: PrintSettingsPanelProps) => {
  const { t } = useTranslation('sheets');

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-card p-4 space-y-4 overflow-y-auto text-xs">
      <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-1.5">
        <Icon name="printer" size={16} /> {t('printModal.title')}
      </h3>

      {/* 1. Paper Size */}
      <div className="space-y-1.5">
        <label className="block font-medium text-muted-foreground">
          {t('printModal.paperSize')}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(['a4', 'letter', 'a3', 'legal'] as PaperSize[]).map((size) => (
            <Button
              key={size}
              type="button"
              variant={settings.paperSize === size ? 'default' : 'outline'}
              size="sm"
              className="text-xs uppercase"
              onClick={() => onChange({ paperSize: size })}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* 2. Orientation */}
      <div className="space-y-1.5">
        <label className="block font-medium text-muted-foreground">
          {t('printModal.orientation')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['portrait', 'landscape'] as PaperOrientation[]).map((orient) => (
            <Button
              key={orient}
              type="button"
              variant={settings.orientation === orient ? 'default' : 'outline'}
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => onChange({ orientation: orient })}
            >
              <Icon name={orient === 'portrait' ? 'file-text' : 'square'} size={14} />
              {t(`printModal.${orient}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* 3. Range */}
      <div className="space-y-1.5">
        <label className="block font-medium text-muted-foreground">{t('printModal.range')}</label>
        <div className="space-y-1">
          {(['activeSheet', 'selection', 'workbook'] as PrintRangeOption[]).map((opt) => (
            <Button
              key={opt}
              type="button"
              variant={settings.range === opt ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => onChange({ range: opt })}
            >
              {t(`printModal.${opt}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* 4. Scaling */}
      <div className="space-y-1.5">
        <label className="block font-medium text-muted-foreground">{t('printModal.scale')}</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(['fitWidth', 'fitPage', '100'] as ScaleOption[]).map((scale) => (
            <Button
              key={scale}
              type="button"
              variant={settings.scale === scale ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => onChange({ scale })}
            >
              {scale === '100' ? t('printModal.scale100') : t(`printModal.${scale}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* 5. Margins */}
      <div className="space-y-1.5">
        <label className="block font-medium text-muted-foreground">{t('printModal.margins')}</label>
        <div className="grid grid-cols-3 gap-1">
          {(['normal', 'narrow', 'wide'] as MarginOption[]).map((m) => (
            <Button
              key={m}
              type="button"
              variant={settings.margins === m ? 'default' : 'outline'}
              size="sm"
              className="text-[11px] px-1"
              onClick={() => onChange({ margins: m })}
            >
              {t(`printModal.${m}`).split(' ')[0]}
            </Button>
          ))}
        </div>
      </div>

      {/* 6. Display Options */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="block font-medium text-muted-foreground">{t('printModal.options')}</label>
        
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.showGridlines}
            onChange={(e) => onChange({ showGridlines: e.target.checked })}
            className="rounded border-border text-primary"
          />
          <span className="text-xs text-foreground">{t('printModal.gridlines')}</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.showHeaders}
            onChange={(e) => onChange({ showHeaders: e.target.checked })}
            className="rounded border-border text-primary"
          />
          <span className="text-xs text-foreground">{t('printModal.headers')}</span>
        </label>
      </div>

      {/* 7. Actions */}
      <div className="pt-4 mt-auto space-y-2 border-t border-border">
        <Button
          type="button"
          variant="default"
          className="w-full gap-1.5 text-xs text-white"
          style={{ backgroundColor: 'var(--o-kind-sheets)' }}
          onClick={onPrint}
        >
          <Icon name="printer" size={14} />
          {t('printModal.printButton')}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isGeneratingPdf}
          className="w-full gap-1.5 text-xs text-foreground"
          onClick={onDownloadPdf}
        >
          <Icon name="download" size={14} />
          {isGeneratingPdf ? t('printModal.generatingPdf') : t('printModal.downloadPdf')}
        </Button>
      </div>
    </div>
  );
};
