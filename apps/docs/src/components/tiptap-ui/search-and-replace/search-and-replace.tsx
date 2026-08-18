import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from '@office/i18n';

// --- Hooks ---
import { useComposedRef } from '@/hooks/use-composed-ref';

// --- Icons ---
import { cn } from '@/lib/tiptap-utils';
import {
  Button,
  Icon,
  Input,
  Separator,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@office/ui-kit';

// --- Tiptap UI ---
import type { UseSearchAndReplaceConfig } from '@/components/tiptap-ui/search-and-replace';
import {
  SEARCH_AND_REPLACE_SHORTCUT_KEY,
  useSearchAndReplace,
} from '@/components/tiptap-ui/search-and-replace';

// --- Styles ---
import '@/components/tiptap-ui/search-and-replace/search-and-replace.scss';

export interface SearchAndReplaceProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, UseSearchAndReplaceConfig {
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  enableShortcut?: boolean;
  autoFocusSearch?: boolean;
}

export type SearchAndReplaceContentProps = SearchAndReplaceProps;

const isModKey = (event: React.KeyboardEvent): boolean => event.metaKey || event.ctrlKey;

const REGEX_DOCS_URL =
  'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions';

const REGEX_REPLACE_EXAMPLES = [
  { pattern: 'TipTap|tiptap|TIPTAP', replacement: 'Tiptap' },
  { pattern: '(cat|tiptap)', replacement: '"$1"' },
];

const ICON_SIZE = 16;

interface ToolbarIconButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  icon: string;
  dataAction?: string;
}

const ToolbarIconButton = ({
  label,
  disabled = false,
  onClick,
  icon,
  dataAction,
}: ToolbarIconButtonProps) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={disabled}
          aria-label={label}
          data-search-replace-action={dataAction}
          onClick={onClick}
        >
          <Icon name={icon} size={ICON_SIZE} />
        </Button>
      }
    />
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

const RegexExampleButton = ({
  pattern,
  onApply,
  children,
}: {
  pattern: string;
  onApply: () => void;
  children: React.ReactNode;
}) => (
  <Button
    type="button"
    className="tiptap-search-replace-regex-example-button justify-start"
    data-regex-example={pattern}
    onClick={onApply}
    variant="ghost"
    size="sm"
  >
    <span className="tiptap-button-text">{children}</span>
    <Icon name="arrow-right" size={ICON_SIZE} className="tiptap-button-icon" />
  </Button>
);

export const SearchAndReplaceButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, children, ...props }, ref) => {
  const { t } = useTranslation('docs');
  return (
    <Button
      type="button"
      className={className}
      variant="ghost"
      role="button"
      tabIndex={-1}
      aria-label={t('searchReplace.title')}
      ref={ref}
      {...props}
    >
      {children || <Icon name="search" size={ICON_SIZE} className="tiptap-button-icon" />}
    </Button>
  );
});

SearchAndReplaceButton.displayName = 'SearchAndReplaceButton';

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
      ...divProps
    },
    ref,
  ) => {
    const { t } = useTranslation('docs');
    const { t: tCommon } = useTranslation('common');

    const regexSearchExamples = useMemo(
      () => [
        { label: t('searchReplace.regexAnyLetter'), pattern: 'c.t' },
        { label: t('searchReplace.regexEitherTerm'), pattern: 'cat|tiptap' },
        { label: t('searchReplace.regexCaseInsensitive'), pattern: '[Cc]at' },
      ],
      [t],
    );

    const searchAndReplace = useSearchAndReplace({
      editor: providedEditor,
      hideWhenUnavailable,
      scrollIntoViewOptions,
    });

    const {
      isVisible,
      resultCountLabel,
      searchTerm,
      replaceTerm,
      caseSensitive,
      wholeWord,
      useRegex,
      canSearch,
      canNavigate,
      canReplace,
      canReplaceAll,
      setSearchTerm,
      setReplaceTerm,
      toggleCaseSensitive,
      toggleWholeWord,
      toggleUseRegex,
      goToNext,
      goToPrevious,
      replaceCurrent,
      replaceAll,
      applySearch,
      suspendSearch,
    } = searchAndReplace;

    const searchInputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const composedPanelRef = useComposedRef(panelRef, ref);

    const focusSearchInput = useCallback(() => {
      const input = searchInputRef.current;
      if (!input) return;
      input.focus();
      input.select();
    }, []);

    const applyRegexExample = useCallback(
      (pattern: string, replacement?: string) => {
        setSearchTerm(pattern);
        if (replacement !== undefined) {
          setReplaceTerm(replacement);
        }
        focusSearchInput();
      },
      [setSearchTerm, setReplaceTerm, focusSearchInput],
    );

    useHotkeys(
      SEARCH_AND_REPLACE_SHORTCUT_KEY,
      (event) => {
        if (open) {
          event.preventDefault();
          focusSearchInput();
          return;
        }

        if (!onOpen) return;

        event.preventDefault();
        onOpen();
      },
      {
        enabled: enableShortcut && isVisible && canSearch,
        enableOnContentEditable: true,
        enableOnFormTags: true,
      },
      [open, onOpen, focusSearchInput],
    );

    useHotkeys(
      'up,down',
      (event) => {
        const target = event.target instanceof Node ? event.target : null;
        if (panelRef.current?.contains(target)) return;

        event.preventDefault();
        if (event.key === 'ArrowDown') {
          goToNext();
        } else {
          goToPrevious();
        }
      },
      { enabled: open && canNavigate },
      [goToNext, goToPrevious],
    );

    const applySearchRef = useRef(applySearch);
    const suspendSearchRef = useRef(suspendSearch);
    useEffect(() => {
      applySearchRef.current = applySearch;
      suspendSearchRef.current = suspendSearch;
    });

    const previousOpenRef = useRef(false);
    useEffect(() => {
      if (previousOpenRef.current === open) return;
      previousOpenRef.current = open;

      if (open) {
        applySearchRef.current();
      } else {
        suspendSearchRef.current();
      }
    }, [open]);

    const focusedForOpenRef = useRef(false);
    useEffect(() => {
      if (!open) {
        focusedForOpenRef.current = false;
        return;
      }
      if (focusedForOpenRef.current || !autoFocusSearch || !canSearch) return;

      focusedForOpenRef.current = true;
      focusSearchInput();
    }, [open, canSearch, autoFocusSearch, focusSearchInput]);

    const handlePanelKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
          if (onClose) {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
          return;
        }

        if (
          (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
          !event.shiftKey &&
          !event.altKey &&
          !isModKey(event) &&
          !event.nativeEvent.isComposing &&
          canNavigate
        ) {
          event.preventDefault();
          if (event.key === 'ArrowDown') {
            goToNext();
          } else {
            goToPrevious();
          }
          return;
        }

        if (isModKey(event) && event.shiftKey && !event.altKey) {
          const key = event.key.toLowerCase();

          if (key === 'f' && canNavigate) {
            event.preventDefault();
            event.stopPropagation();
            goToNext();
            return;
          }

          if (key === 'd' && canNavigate) {
            event.preventDefault();
            event.stopPropagation();
            goToPrevious();
          }
        }
      },
      [onClose, canNavigate, goToNext, goToPrevious],
    );

    const handleSearchKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !isModKey(event) &&
          !event.nativeEvent.isComposing &&
          canNavigate
        ) {
          event.preventDefault();
          goToNext();
        }
      },
      [canNavigate, goToNext],
    );

    const handleReplaceKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !isModKey(event) &&
          !event.nativeEvent.isComposing &&
          canReplace
        ) {
          event.preventDefault();
          replaceCurrent();
        }
      },
      [canReplace, replaceCurrent],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <div
        className={cn('tiptap-search-replace', className)}
        data-open={open ? 'true' : 'false'}
        role="dialog"
        aria-label={t('searchReplace.title')}
        onKeyDown={handlePanelKeyDown}
        ref={composedPanelRef}
        {...divProps}
      >
        <div className="tiptap-search-replace-header">
          <span className="tiptap-search-replace-count" aria-live="polite">
            {resultCountLabel}
          </span>

          <div className="tiptap-search-replace-nav-group">
            <div className="button-group">
              <ToolbarIconButton
                label={t('searchReplace.previous')}
                disabled={!canNavigate}
                onClick={goToPrevious}
                icon="chevron-up"
                dataAction="prev"
              />
              <ToolbarIconButton
                label={t('searchReplace.next')}
                disabled={!canNavigate}
                onClick={goToNext}
                icon="chevron-down"
                dataAction="next"
              />
            </div>
            <div className="button-group">
              <ToolbarIconButton
                label={tCommon('actions.close')}
                onClick={() => onClose?.()}
                icon="x"
                dataAction="close"
              />
            </div>
          </div>
        </div>

        <div className="tiptap-search-replace-body">
          <div className="tiptap-search-replace-query-controls">
            <div className="tiptap-search-replace-inputs">
              <div className="tiptap-search-replace-input-group relative">
                <Input
                  data-field="search-query"
                  placeholder={t('searchReplace.findPlaceholder')}
                  aria-label={t('searchReplace.findPlaceholder')}
                  value={searchTerm}
                  autoFocus={open && autoFocusSearch}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={!canSearch}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  ref={searchInputRef}
                  className="pr-8"
                />
                <kbd
                  className="tiptap-search-replace-keyboard-hint pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                >
                  ↵
                </kbd>
              </div>

              <div className="tiptap-search-replace-input-group relative">
                <Input
                  data-field="replace-query"
                  placeholder={t('searchReplace.replacePlaceholder')}
                  aria-label={t('searchReplace.replacePlaceholder')}
                  value={replaceTerm}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={!canSearch}
                  onChange={(event) => setReplaceTerm(event.target.value)}
                  onKeyDown={handleReplaceKeyDown}
                  className="pr-8"
                />
                <kbd
                  className="tiptap-search-replace-keyboard-hint pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                >
                  ↵
                </kbd>
              </div>
            </div>

            <div className="tiptap-search-replace-options">
              <Button
                type="button"
                data-option="match-case"
                variant="ghost"
                size="sm"
                aria-pressed={caseSensitive}
                disabled={!canSearch}
                onClick={toggleCaseSensitive}
                className={cn(caseSensitive && 'bg-accent text-accent-foreground')}
              >
                <Icon name="case-sensitive" size={ICON_SIZE} className="tiptap-button-icon" />
                <span className="tiptap-button-text">{t('searchReplace.matchCase')}</span>
              </Button>

              <Button
                type="button"
                data-option="whole-words"
                variant="ghost"
                size="sm"
                aria-pressed={wholeWord}
                disabled={!canSearch}
                onClick={toggleWholeWord}
                className={cn(wholeWord && 'bg-accent text-accent-foreground')}
              >
                <Icon name="whole-word" size={ICON_SIZE} className="tiptap-button-icon" />
                <span className="tiptap-button-text">{t('searchReplace.wholeWord')}</span>
              </Button>
            </div>
          </div>

          <Separator orientation="horizontal" />

          <div className="tiptap-search-replace-regex-toggle">
            <label data-option="use-regex" className="tiptap-search-replace-regex-toggle-row">
              <span className="tiptap-search-replace-regex-toggle-label">
                {t('searchReplace.useRegex')}
              </span>
              <Switch checked={useRegex} onCheckedChange={toggleUseRegex} disabled={!canSearch} />
            </label>

            {useRegex && (
              <div className="tiptap-search-replace-regex-help">
                <div className="tiptap-search-replace-regex-help-section">
                  <span className="tiptap-search-replace-regex-help-label">
                    {t('searchReplace.tryPattern')}
                  </span>

                  <div className="tiptap-search-replace-regex-example-list">
                    {regexSearchExamples.map(({ label, pattern }) => (
                      <RegexExampleButton
                        key={pattern}
                        pattern={pattern}
                        onApply={() => applyRegexExample(pattern)}
                      >
                        {label} <code>{pattern}</code>
                      </RegexExampleButton>
                    ))}
                  </div>
                </div>

                <Separator
                  orientation="horizontal"
                  className="tiptap-search-replace-regex-help-separator"
                />

                <div className="tiptap-search-replace-regex-help-section">
                  <span className="tiptap-search-replace-regex-help-label">
                    {t('searchReplace.tryReplace')}
                  </span>

                  <div className="tiptap-search-replace-regex-example-list">
                    {REGEX_REPLACE_EXAMPLES.map(({ pattern, replacement }) => (
                      <RegexExampleButton
                        key={pattern}
                        pattern={pattern}
                        onApply={() => applyRegexExample(pattern, replacement)}
                      >
                        <code>{pattern}</code> {t('searchReplace.to')} <code>{replacement}</code>
                      </RegexExampleButton>
                    ))}
                  </div>

                  <a
                    className="tiptap-search-replace-regex-docs-link"
                    data-search-replace-action="regex-docs"
                    href={REGEX_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('searchReplace.learnRegex')}
                    <Icon
                      name="external-link"
                      size={ICON_SIZE}
                      className="tiptap-search-replace-regex-docs-link-icon"
                    />
                  </a>
                </div>
              </div>
            )}
          </div>

          <Separator orientation="horizontal" />
        </div>

        <div className="tiptap-search-replace-actions">
          <div className="button-group">
            <Button
              type="button"
              data-search-replace-action="replace"
              disabled={!canReplace}
              aria-label={t('searchReplace.replace')}
              onClick={replaceCurrent}
            >
              {t('searchReplace.replace')}
            </Button>
            <Button
              type="button"
              data-search-replace-action="replace-all"
              disabled={!canReplaceAll}
              aria-label={t('searchReplace.replaceAll')}
              onClick={replaceAll}
            >
              {t('searchReplace.replaceAll')}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

SearchAndReplace.displayName = 'SearchAndReplace';

export const SearchAndReplaceContent = SearchAndReplace;

export default SearchAndReplace;
