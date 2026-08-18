import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import { useRef } from 'react';
import { KIND_ICON } from '../lib/icons';
import type { ProductConfig } from '../types';

interface TemplateStripProps {
  config: ProductConfig;
  onCreate: () => void;
  onOpenFromDevice?: (file: File) => Promise<void> | void;
}

/** Day card "Tao moi" + template — giong Google Workspace home. */
export const TemplateStrip = ({ config, onCreate, onOpenFromDevice }: TemplateStripProps) => {
  const { t } = useTranslation('appShell');
  const IconName = KIND_ICON[config.kind];
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="px-6 pt-6" aria-label={config.startLabel}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">{config.startLabel}</h2>
        {config.templates.length > 0 && (
          <span className="text-sm text-muted-foreground">{t('home.templateGallery')}</span>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={onCreate}
          className="group flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md"
          aria-label={config.blankLabel}
        >
          <span
            className="flex h-28 items-center justify-center"
            style={{ backgroundColor: config.accentVar }}
          >
            <Icon name="add" size={32} className="text-white" aria-hidden="true" />
          </span>
          <span className="truncate px-2 py-2 text-sm text-foreground">{config.blankLabel}</span>
        </button>
        {onOpenFromDevice && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md"
            aria-label={t('home.openFromDevice')}
          >
            <span className="flex h-28 items-center justify-center bg-muted">
              <Icon
                name="upload"
                size={32}
                className="text-muted-foreground group-hover:text-foreground transition-colors"
                aria-hidden="true"
              />
            </span>
            <span className="truncate px-2 py-2 text-sm text-foreground">
              {t('home.openFromDevice')}
            </span>
          </button>
        )}
        {config.templates.map((template) => (
          <div
            key={template.id}
            className="flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm"
          >
            <span className="flex h-28 items-center justify-center bg-muted">
              <Icon
                name={IconName}
                size={40}
                className="text-muted-foreground"
                aria-hidden="true"
              />
            </span>
            <span className="truncate px-2 py-2 text-sm text-foreground">{template.label}</span>
          </div>
        ))}
      </div>
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept=".docx"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && onOpenFromDevice) {
            void onOpenFromDevice(file);
          }
          event.target.value = '';
        }}
      />
    </section>
  );
};
