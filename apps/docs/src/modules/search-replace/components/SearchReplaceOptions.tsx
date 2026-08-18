import { useTranslation } from '@office/i18n';
import { Button, Icon } from '@office/ui-kit';

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
    <div className="c-srch_opts">
      <Button
        type="button"
        variant={caseSensitive ? 'secondary' : 'ghost'}
        size="sm"
        className="h-6 px-2 text-[11px] font-normal"
        onClick={onToggleCaseSensitive}
        title={t('searchReplace.caseSensitive')}
        aria-pressed={caseSensitive}
      >
        <Icon name="case-sensitive" size={13} className="mr-1" />
        Aa
      </Button>

      <Button
        type="button"
        variant={wholeWord ? 'secondary' : 'ghost'}
        size="sm"
        className="h-6 px-2 text-[11px] font-normal"
        onClick={onToggleWholeWord}
        title={t('searchReplace.wholeWord')}
        aria-pressed={wholeWord}
      >
        <Icon name="whole-word" size={13} className="mr-1" />
        [W]
      </Button>

      <Button
        type="button"
        variant={useRegex ? 'secondary' : 'ghost'}
        size="sm"
        className="h-6 px-2 text-[11px] font-normal"
        onClick={onToggleUseRegex}
        title={t('searchReplace.useRegex')}
        aria-pressed={useRegex}
      >
        <Icon name="regex" size={13} className="mr-1" />
        .*
      </Button>
    </div>
  );
};
