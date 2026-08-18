import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from '@office/i18n';

// --- Hooks ---
import { useComposedRef } from '@/hooks/use-composed-ref';

// --- UI Primitives ---
import {
  Button,
  Icon,
  Input,
  Separator,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
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
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    UseSearchAndReplaceConfig {
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
    const { t } = useTranslation('docs');
    const { t: tCommon } = useTranslation('common');

    const regexSearchExamples = useMemo(
      () => [
        { label: t('searchReplace.examples.digits'), pattern: '\\d+' },
        { label: t('searchReplace.examples.words'), pattern: '\\b\\w+\\b' },
      ],
      [t],
    );

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
      canSearch,
      canReplace,
      canReplaceAll,
      canNavigate,
    } = useSearchAndReplace({
      editor: providedEditor,
      hideWhenUnavailable,
      scrollIntoViewOptions,
    });

    const isVisible = Boolean(editor) && (!hideWhenUnavailable || canSearch);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const composedPanelRef = useComposedRef(panelRef, ref);

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
      {
        enabled: enableShortcut,
        enableOnFormTags: true,
      },
    );

    useEffect(() => {
      if (open && autoFocusSearch && searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    }, [open, autoFocusSearch]);

    const applyRegexExample = useCallback(
      (searchPattern: string, replacePattern?: string) => {
        setSearchTerm(searchPattern);
        if (replacePattern !== undefined) {
          setReplaceTerm(replacePattern);
        }
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      },
      [setSearchTerm, setReplaceTerm],
    );

    const handlePanelKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose?.();
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

    if (!isVisible || !open) {
      return null;
    }

    return (
      <div
        className={cn('tiptap-search-replace', className)}
        data-open="true"
        role="dialog"
        aria-label={t('searchReplace.title')}
        onKeyDown={handlePanelKeyDown}
        ref={composedPanelRef}
        style={style}
        {...divProps}
      >
        {/* Header: count + navigation + close */}
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-semibold tabular-nums text-muted-foreground" aria-live="polite">
            {resultCountLabel}
          </span>

          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    disabled={!canNavigate}
                    onClick={goToPrevious}
                    aria-label={t('searchReplace.previous')}
                  >
                    <Icon name="chevron-up" size={15} />
                  </Button>
                }
              />
              <TooltipContent>{t('searchReplace.previous')}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    disabled={!canNavigate}
                    onClick={goToNext}
                    aria-label={t('searchReplace.next')}
                  >
                    <Icon name="chevron-down" size={15} />
                  </Button>
                }
              />
              <TooltipContent>{t('searchReplace.next')}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={() => onClose?.()}
                    aria-label={tCommon('actions.close')}
                  >
                    <Icon name="x" size={15} />
                  </Button>
                }
              />
              <TooltipContent>{tCommon('actions.close')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-2">
          <div className="relative">
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
              className="h-9 pr-7 text-xs rounded-lg border-border bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60">
              ↵
            </span>
          </div>

          <div className="relative">
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
              className="h-9 pr-7 text-xs rounded-lg border-border bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60">
              ↵
            </span>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="flex flex-col gap-0.5 pt-1">
          <button
            type="button"
            onClick={toggleCaseSensitive}
            disabled={!canSearch}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-hover cursor-pointer outline-none"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground text-xs w-4">Aa</span>
              <span>{t('searchReplace.matchCase')}</span>
            </div>
            <div
              className={cn(
                'flex size-4 items-center justify-center rounded border transition-colors shrink-0',
                caseSensitive
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border bg-muted/40 hover:border-foreground/50',
              )}
            >
              {caseSensitive && <Icon name="check" size={11} />}
            </div>
          </button>

          <button
            type="button"
            onClick={toggleWholeWord}
            disabled={!canSearch}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-hover cursor-pointer outline-none"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground text-xs w-4">ab</span>
              <span>{t('searchReplace.wholeWord')}</span>
            </div>
            <div
              className={cn(
                'flex size-4 items-center justify-center rounded border transition-colors shrink-0',
                wholeWord
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border bg-muted/40 hover:border-foreground/50',
              )}
            >
              {wholeWord && <Icon name="check" size={11} />}
            </div>
          </button>
        </div>

        <Separator orientation="horizontal" className="my-0.5" />

        {/* Regex toggle */}
        <div className="flex flex-col gap-2">
          <label
            data-option="use-regex"
            className="flex items-center justify-between px-2 py-1 text-xs text-foreground cursor-pointer"
          >
            <span>{t('searchReplace.useRegex')}</span>
            <Switch checked={useRegex} onCheckedChange={toggleUseRegex} disabled={!canSearch} />
          </label>

          {useRegex && (
            <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-muted/60 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {t('searchReplace.tryPattern')}
                </span>
                <div className="flex flex-col gap-1">
                  {regexSearchExamples.map(({ label, pattern }) => (
                    <Button
                      key={pattern}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs justify-start px-1.5 gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => applyRegexExample(pattern)}
                    >
                      <span>{label}</span>
                      <code className="px-1 py-0.5 rounded bg-background border border-border text-[10px] font-mono text-foreground">
                        {pattern}
                      </code>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator orientation="horizontal" />

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {t('searchReplace.tryReplace')}
                </span>
                <div className="flex flex-col gap-1">
                  {REGEX_REPLACE_EXAMPLES.map(({ pattern, replacement }) => (
                    <Button
                      key={pattern}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs justify-start px-1.5 gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => applyRegexExample(pattern, replacement)}
                    >
                      <code className="px-1 py-0.5 rounded bg-background border border-border text-[10px] font-mono text-foreground">
                        {pattern}
                      </code>
                      <span>{t('searchReplace.to')}</span>
                      <code className="px-1 py-0.5 rounded bg-background border border-border text-[10px] font-mono text-foreground">
                        {replacement}
                      </code>
                    </Button>
                  ))}
                </div>
                <a
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline pt-1"
                  href={REGEX_DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('searchReplace.learnRegex')}
                  <Icon name="external-link" size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        <Separator orientation="horizontal" className="my-0.5" />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-0.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 rounded-lg px-3.5 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-all"
            disabled={!canReplace}
            onClick={replaceCurrent}
          >
            {t('searchReplace.replace')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 rounded-lg px-3.5 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-all"
            disabled={!canReplaceAll}
            onClick={replaceAll}
          >
            {t('searchReplace.replaceAll')}
          </Button>
        </div>
      </div>
    );
  },
);

SearchAndReplace.displayName = 'SearchAndReplace';

export const SearchAndReplaceContent = SearchAndReplace;

export default SearchAndReplace;
