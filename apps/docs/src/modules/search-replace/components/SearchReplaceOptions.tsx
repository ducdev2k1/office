import { useTranslation } from '@office/i18n';
import { Checkbox, Icon, Switch } from '@office/ui-kit';

interface SearchReplaceOptionsProps {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  onToggleCaseSensitive: () => void;
  onToggleWholeWord: () => void;
  onToggleUseRegex: () => void;
}

export const SearchReplaceOptions = ({
  caseSensitive,
  wholeWord,
  useRegex,
  onToggleCaseSensitive,
  onToggleWholeWord,
  onToggleUseRegex,
}: SearchReplaceOptionsProps) => {
  const { t } = useTranslation('docs');

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-border text-[13px] text-foreground/90">
      <label className="flex items-center justify-between cursor-pointer select-none">
        <span className="flex items-center gap-2">
          <Icon name="case-sensitive" size={15} className="text-muted-foreground" />
          <span>{t('searchReplace.matchCase')}</span>
        </span>
        <Checkbox
          checked={caseSensitive}
          onCheckedChange={onToggleCaseSensitive}
          aria-label={t('searchReplace.matchCase')}
        />
      </label>

      <label className="flex items-center justify-between cursor-pointer select-none">
        <span className="flex items-center gap-2">
          <Icon name="whole-word" size={15} className="text-muted-foreground" />
          <span>{t('searchReplace.wholeWord')}</span>
        </span>
        <Checkbox
          checked={wholeWord}
          onCheckedChange={onToggleWholeWord}
          aria-label={t('searchReplace.wholeWord')}
        />
      </label>

      <label className="flex items-center justify-between cursor-pointer select-none">
        <span className="flex items-center gap-2">
          <Icon name="regex" size={15} className="text-muted-foreground" />
          <span>{t('searchReplace.useRegex')}</span>
        </span>
        <Switch checked={useRegex} onCheckedChange={onToggleUseRegex} />
      </label>
    </div>
  );
};
