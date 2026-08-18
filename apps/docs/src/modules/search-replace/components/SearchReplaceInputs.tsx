import type { RefObject, KeyboardEvent } from 'react';
import { useTranslation } from '@office/i18n';
import { Button, Icon, Input } from '@office/ui-kit';

interface SearchReplaceInputsProps {
  searchInputRef: RefObject<HTMLInputElement | null>;
  replaceInputRef: RefObject<HTMLInputElement | null>;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  replaceTerm: string;
  setReplaceTerm: (value: string) => void;
  resultCountLabel: string;
  canReplace: boolean;
  canReplaceAll: boolean;
  onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onReplaceKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
  onReplaceCurrent: () => void;
  onReplaceAll: () => void;
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
  canReplace,
  canReplaceAll,
  onSearchKeyDown,
  onReplaceKeyDown,
  onGoToPrevious,
  onGoToNext,
  onReplaceCurrent,
  onReplaceAll,
  onClose,
}: SearchReplaceInputsProps) => {
  const { t } = useTranslation('docs');
  const { t: tCommon } = useTranslation('common');

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t('searchReplace.findPlaceholder')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={onSearchKeyDown}
            className="h-8 pr-14 text-xs font-normal"
          />
          {resultCountLabel && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-muted-foreground select-none pointer-events-none">
              {resultCountLabel}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={onGoToPrevious}
          disabled={!resultCountLabel || resultCountLabel === '0/0'}
          title={t('searchReplace.previous')}
          aria-label={t('searchReplace.previous')}
        >
          <Icon name="chevron-up" size={16} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={onGoToNext}
          disabled={!resultCountLabel || resultCountLabel === '0/0'}
          title={t('searchReplace.next')}
          aria-label={t('searchReplace.next')}
        >
          <Icon name="chevron-down" size={16} />
        </Button>

        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            title={tCommon('actions.close')}
            aria-label={tCommon('actions.close')}
          >
            <Icon name="x" size={16} />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          ref={replaceInputRef}
          type="text"
          placeholder={t('searchReplace.replacePlaceholder')}
          value={replaceTerm}
          onChange={(event) => setReplaceTerm(event.target.value)}
          onKeyDown={onReplaceKeyDown}
          className="h-8 text-xs font-normal flex-1"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs shrink-0"
          onClick={onReplaceCurrent}
          disabled={!canReplace}
        >
          {t('searchReplace.replace')}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs shrink-0"
          onClick={onReplaceAll}
          disabled={!canReplaceAll}
        >
          {t('searchReplace.replaceAll')}
        </Button>
      </div>
    </>
  );
};
