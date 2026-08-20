import { useTranslation } from '@office/i18n';
import { Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';

interface TitleInputProps {
  title: string;
  onTitleChange: (title: string) => void;
  readOnly?: boolean;
}

export const TitleInput = ({ title, onTitleChange, readOnly = false }: TitleInputProps) => {
  const { t } = useTranslation('docs');

  const content = (
    <div className="inline-grid items-center relative min-w-0 flex-initial overflow-hidden max-w-[min(40vw,320px)]">
      <span
        className="pointer-events-none invisible whitespace-pre px-1.5 py-0.5 text-lg font-normal border border-transparent min-w-[60px] font-['Google_Sans',Roboto,sans-serif]"
        style={{ gridArea: '1 / 1' }}
        aria-hidden="true"
      >
        {title || t('header.titlePlaceholder')}
      </span>
      <input
        aria-label={t('header.titleAriaLabel')}
        placeholder={t('header.titlePlaceholder')}
        disabled={readOnly}
        readOnly={readOnly}
        className={cn(
          "w-full min-w-0 h-7 px-1.5 py-0.5 border border-transparent rounded bg-transparent text-foreground text-lg leading-snug font-['Google_Sans',Roboto,sans-serif] whitespace-pre overflow-hidden text-ellipsis transition-colors",
          readOnly
            ? 'cursor-default select-none text-foreground/85'
            : 'hover:border-border focus:border-primary focus:bg-background',
        )}
        style={{ gridArea: '1 / 1' }}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
      />
    </div>
  );

  if (readOnly) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="bottom">{t('header.readOnlyTitleTooltip')}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
};
