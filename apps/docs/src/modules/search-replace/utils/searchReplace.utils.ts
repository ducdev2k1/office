import type { Editor } from '@tiptap/react';
import type { FindAndReplaceStorage } from '@tiptap/extension-find-and-replace';
import { isExtensionAvailable } from '@/modules/editor/utils/tiptap.utils';

export const SEARCH_AND_REPLACE_SHORTCUT_KEY = 'mod+h';
export const NEXT_RESULT_SHORTCUT_KEY = 'mod+shift+f';
export const PREVIOUS_RESULT_SHORTCUT_KEY = 'mod+shift+d';

export const SEARCH_RESULT_CLASS = 'find-and-replace-result';
export const SEARCH_RESULT_CURRENT_CLASS = 'find-and-replace-result-current';

export const SEARCH_SYNC_DELAY_MS = 300;

export const DEFAULT_SCROLL_INTO_VIEW_OPTIONS: ScrollIntoViewOptions = {
  block: 'nearest',
  inline: 'nearest',
};

export const isFindAndReplaceAvailable = (editor: Editor | null): boolean =>
  isExtensionAvailable(editor, 'findAndReplace');

export const getFindAndReplaceStorage = (
  editor: Editor | null,
): FindAndReplaceStorage | null => {
  if (!editor || !isFindAndReplaceAvailable(editor)) return null;
  return (
    (editor.storage.findAndReplace as FindAndReplaceStorage | undefined) ?? null
  );
};

export const scrollCurrentResultIntoView = (
  editor: Editor | null,
  options?: ScrollIntoViewOptions,
): void => {
  if (!editor) return;
  const dom = editor.view.dom as HTMLElement | null;
  if (!dom) return;

  const currentResultEl = dom.querySelector(
    `.${SEARCH_RESULT_CURRENT_CLASS}`,
  ) as HTMLElement | null;

  if (currentResultEl) {
    currentResultEl.scrollIntoView({
      ...DEFAULT_SCROLL_INTO_VIEW_OPTIONS,
      ...options,
    });
  }
};
