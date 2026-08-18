import { useTranslation } from '@office/i18n';

interface TitleInputProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export const TitleInput = ({ title, onTitleChange }: TitleInputProps) => {
  const { t } = useTranslation('docs');

  return (
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
        className="w-full min-w-0 h-7 px-1.5 py-0.5 border border-transparent hover:border-border focus:border-primary rounded bg-transparent focus:bg-background text-foreground text-lg leading-snug font-['Google_Sans',Roboto,sans-serif] whitespace-pre overflow-hidden text-ellipsis transition-colors"
        style={{ gridArea: '1 / 1' }}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
      />
    </div>
  );
};
