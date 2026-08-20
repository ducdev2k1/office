import type { Editor } from '@tiptap/react';

export interface UseSearchAndReplaceConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  scrollIntoViewOptions?: ScrollIntoViewOptions;
}

export interface SearchAndReplaceEditorState {
  total: number;
  currentIndex: number | null;
  appliedSearchTerm: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface SearchAndReplaceProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, UseSearchAndReplaceConfig {
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  enableShortcut?: boolean;
  autoFocusSearch?: boolean;
}
