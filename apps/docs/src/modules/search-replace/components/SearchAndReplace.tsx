import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn, Button } from '@office/ui-kit';
import { useTranslation } from '@office/i18n';
import { useComposedRef } from '@/hooks/useComposedRef';
import type { SearchAndReplaceProps } from '@/modules/search-replace/types/searchReplace.types';
import {
  SEARCH_AND_REPLACE_SHORTCUT_KEY,
  NEXT_RESULT_SHORTCUT_KEY,
  PREVIOUS_RESULT_SHORTCUT_KEY,
  SEARCH_SYNC_DELAY_MS,
  isFindAndReplaceAvailable,
} from '@/modules/search-replace/utils/searchReplace.utils';
import { useSearchAndReplace } from '@/modules/search-replace/hooks/useSearchAndReplace';
import { SearchReplaceInputs } from '@/modules/search-replace/components/SearchReplaceInputs';
import { SearchReplaceOptions } from '@/modules/search-replace/components/SearchReplaceOptions';

export const SearchAndReplace = forwardRef<HTMLDivElement, SearchAndReplaceProps>(
  (
    {
      editor: providedEditor,
      hideWhenUnavailable = false,
      scrollIntoViewOptions,
      open = true,
      onClose,
      onOpen,
      enableShortcut = true,
      autoFocusSearch = true,
      className,
      style,
      ...divProps
    },
    ref,
  ) => {
    const {
      editor,
      syncState,
      searchTerm,
      setSearchTerm,
      replaceTerm,
      setReplaceTerm,
      resultCountLabel,
      caseSensitive,
      wholeWord,
      useRegex,
      toggleCaseSensitive,
      toggleWholeWord,
      toggleUseRegex,
      goToNext,
      goToPrevious,
      replaceCurrent,
      replaceAll,
      canReplace,
      canReplaceAll,
      shouldHide,
    } = useSearchAndReplace({
      editor: providedEditor,
      hideWhenUnavailable,
      scrollIntoViewOptions,
    });

    const searchInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRef(containerRef, ref);
    const searchTermRef = useRef(searchTerm);
    searchTermRef.current = searchTerm;
    const { t } = useTranslation('docs');

    useEffect(() => {
      if (open && autoFocusSearch) {
        window.setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      }
    }, [open, autoFocusSearch]);

    useEffect(() => {
      if (!editor || !isFindAndReplaceAvailable(editor)) return;
      editor.commands.setSearchTerm(open ? searchTermRef.current : '');
      const timeout = window.setTimeout(syncState, SEARCH_SYNC_DELAY_MS);
      return () => window.clearTimeout(timeout);
    }, [open, editor, syncState]);

    useHotkeys(
      SEARCH_AND_REPLACE_SHORTCUT_KEY,
      (event) => {
        event.preventDefault();
        if (open) {
          onClose?.();
        } else {
          onOpen?.();
        }
      },
      { enabled: enableShortcut, enableOnFormTags: true },
      [open, onOpen, onClose, enableShortcut],
    );

    useHotkeys(
      NEXT_RESULT_SHORTCUT_KEY,
      (event) => {
        event.preventDefault();
        goToNext();
      },
      { enabled: open, enableOnFormTags: true },
      [open, goToNext],
    );

    useHotkeys(
      PREVIOUS_RESULT_SHORTCUT_KEY,
      (event) => {
        event.preventDefault();
        goToPrevious();
      },
      { enabled: open, enableOnFormTags: true },
      [open, goToPrevious],
    );

    const handleSearchKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (event.shiftKey) {
            goToPrevious();
          } else {
            goToNext();
          }
        } else if (event.key === 'Escape') {
          event.preventDefault();
          onClose?.();
          editor?.commands.focus();
        }
      },
      [goToNext, goToPrevious, onClose, editor],
    );

    const handleReplaceKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (event.shiftKey) {
            replaceAll();
          } else {
            replaceCurrent();
          }
        } else if (event.key === 'Escape') {
          event.preventDefault();
          onClose?.();
          editor?.commands.focus();
        }
      },
      [replaceCurrent, replaceAll, onClose, editor],
    );

    if (shouldHide || !open) return null;

    return (
      <div
        ref={composedRef}
        className={cn(
          'fixed top-28 right-5 z-50 w-88 max-w-[calc(100vw-32px)] p-3.5 rounded-2xl border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-2 duration-150',
          className,
        )}
        data-open={open}
        style={style}
        {...divProps}
      >
        <SearchReplaceInputs
          searchInputRef={searchInputRef}
          replaceInputRef={replaceInputRef}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          replaceTerm={replaceTerm}
          setReplaceTerm={setReplaceTerm}
          resultCountLabel={resultCountLabel}
          onSearchKeyDown={handleSearchKeyDown}
          onReplaceKeyDown={handleReplaceKeyDown}
          onGoToPrevious={goToPrevious}
          onGoToNext={goToNext}
          onClose={onClose}
        />

        <SearchReplaceOptions
          caseSensitive={caseSensitive}
          wholeWord={wholeWord}
          useRegex={useRegex}
          onToggleCaseSensitive={toggleCaseSensitive}
          onToggleWholeWord={toggleWholeWord}
          onToggleUseRegex={toggleUseRegex}
        />

        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={replaceCurrent}
            disabled={!canReplace}
          >
            {t('searchReplace.replace')}
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={replaceAll}
            disabled={!canReplaceAll}
          >
            {t('searchReplace.replaceAll')}
          </Button>
        </div>
      </div>
    );
  },
);

SearchAndReplace.displayName = 'SearchAndReplace';
