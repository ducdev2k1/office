import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn } from '@office/ui-kit';
import { useComposedRef } from '@/hooks/useComposedRef';
import type { SearchAndReplaceProps } from '@/modules/search-replace/types/searchReplace.types';
import {
  SEARCH_AND_REPLACE_SHORTCUT_KEY,
  NEXT_RESULT_SHORTCUT_KEY,
  PREVIOUS_RESULT_SHORTCUT_KEY,
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

    useEffect(() => {
      if (open && autoFocusSearch) {
        window.setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      }
    }, [open, autoFocusSearch]);

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
        className={cn('c-srch', className)}
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
          canReplace={canReplace}
          canReplaceAll={canReplaceAll}
          onSearchKeyDown={handleSearchKeyDown}
          onReplaceKeyDown={handleReplaceKeyDown}
          onGoToPrevious={goToPrevious}
          onGoToNext={goToNext}
          onReplaceCurrent={replaceCurrent}
          onReplaceAll={replaceAll}
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
      </div>
    );
  },
);

SearchAndReplace.displayName = 'SearchAndReplace';
