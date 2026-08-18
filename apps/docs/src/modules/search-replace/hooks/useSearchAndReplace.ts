import { useCallback, useEffect, useState } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { useTiptapEditor } from '@/modules/editor/hooks/useTiptapEditor';
import type {
  SearchAndReplaceEditorState,
  UseSearchAndReplaceConfig,
} from '@/modules/search-replace/types/searchReplace.types';
import {
  DEFAULT_SCROLL_INTO_VIEW_OPTIONS,
  SEARCH_SYNC_DELAY_MS,
  getFindAndReplaceStorage,
  isFindAndReplaceAvailable,
  scrollCurrentResultIntoView,
} from '@/modules/search-replace/utils/searchReplace.utils';

const EMPTY_EDITOR_STATE: SearchAndReplaceEditorState = {
  total: 0,
  currentIndex: null,
  appliedSearchTerm: '',
  caseSensitive: false,
  wholeWord: false,
  useRegex: false,
};

export const useSearchAndReplace = (config: UseSearchAndReplaceConfig = {}) => {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    scrollIntoViewOptions = DEFAULT_SCROLL_INTO_VIEW_OPTIONS,
  } = config;

  const { editor: coreEditor } = useCurrentEditor();
  const rawEditor = providedEditor ?? coreEditor;
  const { editor } = useTiptapEditor(rawEditor);

  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [editorState, setEditorState] =
    useState<SearchAndReplaceEditorState>(EMPTY_EDITOR_STATE);

  const syncStateFromStorage = useCallback(() => {
    const storage = getFindAndReplaceStorage(editor);
    if (!storage) {
      setEditorState(EMPTY_EDITOR_STATE);
      return;
    }

    const total = storage.results?.length ?? 0;
    const currentIndex =
      total > 0 && typeof storage.currentIndex === 'number'
        ? storage.currentIndex
        : null;

    setEditorState({
      total,
      currentIndex,
      appliedSearchTerm: storage.searchTerm ?? '',
      caseSensitive: storage.caseSensitive ?? false,
      wholeWord: storage.wholeWord ?? false,
      useRegex: storage.useRegex ?? false,
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    syncStateFromStorage();

    const handleUpdate = () => syncStateFromStorage();
    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor, syncStateFromStorage]);

  useEffect(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.setSearchTerm(searchTerm);
    const timeout = window.setTimeout(syncStateFromStorage, SEARCH_SYNC_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [editor, searchTerm, syncStateFromStorage]);

  useEffect(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.setReplaceTerm(replaceTerm);
    const timeout = window.setTimeout(syncStateFromStorage, SEARCH_SYNC_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [editor, replaceTerm, syncStateFromStorage]);

  const syncState = useCallback(() => {
    syncStateFromStorage();
  }, [syncStateFromStorage]);

  const goToNext = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.goToNextResult();
    scrollCurrentResultIntoView(editor, scrollIntoViewOptions);
    window.setTimeout(syncStateFromStorage, SEARCH_SYNC_DELAY_MS);
  }, [editor, scrollIntoViewOptions, syncStateFromStorage]);

  const goToPrevious = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.goToPreviousResult();
    scrollCurrentResultIntoView(editor, scrollIntoViewOptions);
    window.setTimeout(syncStateFromStorage, SEARCH_SYNC_DELAY_MS);
  }, [editor, scrollIntoViewOptions, syncStateFromStorage]);

  const replaceCurrent = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.replace();
    scrollCurrentResultIntoView(editor, scrollIntoViewOptions);
    window.setTimeout(syncStateFromStorage, SEARCH_SYNC_DELAY_MS);
  }, [editor, scrollIntoViewOptions, syncStateFromStorage]);

  const replaceAll = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.replaceAll();
    window.setTimeout(syncStateFromStorage, SEARCH_SYNC_DELAY_MS);
  }, [editor, syncStateFromStorage]);

  const toggleCaseSensitive = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.setCaseSensitive(!editorState.caseSensitive);
    window.setTimeout(syncStateFromStorage, SEARCH_SYNC_DELAY_MS);
  }, [editor, editorState.caseSensitive, syncStateFromStorage]);

  const toggleWholeWord = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.setWholeWord(!editorState.wholeWord);
    window.setTimeout(syncStateFromStorage, SEARCH_SYNC_DELAY_MS);
  }, [editor, editorState.wholeWord, syncStateFromStorage]);

  const toggleUseRegex = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.setUseRegex(!editorState.useRegex);
    window.setTimeout(syncStateFromStorage, SEARCH_SYNC_DELAY_MS);
  }, [editor, editorState.useRegex, syncStateFromStorage]);

  const isAvailable = isFindAndReplaceAvailable(editor);
  const shouldHide = hideWhenUnavailable && !isAvailable;

  const resultCountLabel =
    editorState.total > 0 && editorState.currentIndex !== null
      ? `${editorState.currentIndex + 1}/${editorState.total}`
      : editorState.total > 0
        ? `0/${editorState.total}`
        : searchTerm
          ? '0/0'
          : '';

  return {
    editor,
    isAvailable,
    shouldHide,
    syncState,
    searchTerm,
    setSearchTerm,
    replaceTerm,
    setReplaceTerm,
    totalResults: editorState.total,
    currentResultIndex: editorState.currentIndex,
    resultCountLabel,
    caseSensitive: editorState.caseSensitive,
    wholeWord: editorState.wholeWord,
    useRegex: editorState.useRegex,
    toggleCaseSensitive,
    toggleWholeWord,
    toggleUseRegex,
    goToNext,
    goToPrevious,
    replaceCurrent,
    replaceAll,
    canSearch: isAvailable && searchTerm.length > 0,
    canReplace:
      isAvailable && editorState.total > 0 && editorState.currentIndex !== null,
    canReplaceAll: isAvailable && editorState.total > 0,
  };
};
