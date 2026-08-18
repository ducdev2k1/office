import { useCallback, useEffect, useState } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { useTiptapEditor } from '@/modules/editor/hooks/useTiptapEditor';
import type {
  SearchAndReplaceEditorState,
  UseSearchAndReplaceConfig,
} from '@/modules/search-replace/types/searchReplace.types';
import {
  DEFAULT_SCROLL_INTO_VIEW_OPTIONS,
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
  }, [editor, searchTerm]);

  useEffect(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.setReplaceTerm(replaceTerm);
  }, [editor, replaceTerm]);

  const goToNext = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.goToNextResult();
    scrollCurrentResultIntoView(editor, scrollIntoViewOptions);
  }, [editor, scrollIntoViewOptions]);

  const goToPrevious = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.goToPreviousResult();
    scrollCurrentResultIntoView(editor, scrollIntoViewOptions);
  }, [editor, scrollIntoViewOptions]);

  const replaceCurrent = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.replace();
    scrollCurrentResultIntoView(editor, scrollIntoViewOptions);
  }, [editor, scrollIntoViewOptions]);

  const replaceAll = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.replaceAll();
  }, [editor]);

  const toggleCaseSensitive = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.setCaseSensitive(!editorState.caseSensitive);
  }, [editor, editorState.caseSensitive]);

  const toggleWholeWord = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.setWholeWord(!editorState.wholeWord);
  }, [editor, editorState.wholeWord]);

  const toggleUseRegex = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return;
    editor.commands.setUseRegex(!editorState.useRegex);
  }, [editor, editorState.useRegex]);

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
    canReplace: isAvailable && editorState.total > 0,
    canReplaceAll: isAvailable && editorState.total > 0,
  };
};
