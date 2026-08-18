import { useTranslation } from '@office/i18n';
import { Button, Icon, Input } from '@office/ui-kit';
import type { KeyboardEvent, RefObject } from 'react';

interface SearchReplaceInputsProps {
  searchInputRef: RefObject<HTMLInputElement | null>;
  replaceInputRef: RefObject<HTMLInputElement | null>;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  replaceTerm: string;
  setReplaceTerm: (value: string) => void;
  resultCountLabel: string;
  onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onReplaceKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
  onClose?: () => void;
}

export const SearchReplaceInputs = ({
  searchInputRef,
  replaceInputRef,
  searchTerm,
  setSearchTerm,
  replaceTerm,
  setReplaceTerm,
  resultCountLabel,
  onSearchKeyDown,
  onReplaceKeyDown,
  onGoToPrevious,
  onGoToNext,
  onClose,
}: SearchReplaceInputsProps) => {
  const { t } = useTranslation('docs');
  const { t: tCommon } = useTranslation('common');

return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground select-none">
          {resultCountLabel || '0/0'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
            onClick={onGoToPrevious}
            disabled={!resultCountLabel || resultCountLabel === '0/0'}
            title={t('searchReplace.previous')}
            aria-label={t('searchReplace.previous')}
          >
            <Icon name="chevron-up" size={15} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
            onClick={onGoToNext}
            disabled={!resultCountLabel || resultCountLabel === '0/0'}
            title={t('searchReplace.next')}
            aria-label={t('searchReplace.next')}
          >
            <Icon name="chevron-down" size={15} />
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title={tCommon('actions.close')}
              aria-label={tCommon('actions.close')}
            >
              <Icon name="x" size={15} />
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Icon
          name="search"
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
        />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={t('searchReplace.findPlaceholder')}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onKeyDown={onSearchKeyDown}
          className="h-8 pl-8 pr-2.5 text-xs font-normal bg-background rounded-lg border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
        />
      </div>

      <Input
        ref={replaceInputRef}
        type="text"
        placeholder={t('searchReplace.replacePlaceholder')}
        value={replaceTerm}
        onChange={(event) => setReplaceTerm(event.target.value)}
        onKeyDown={onReplaceKeyDown}
        className="h-8 text-xs font-normal bg-background rounded-lg border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
      />
    </div>
  );
};
