import type { ViewMode } from '@/modules/editor/types/editor.types';
import type { Editor } from '@tiptap/core';

export interface MenuAction {
  label: string;
  shortcut?: string;
  danger?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export type MenuItem = MenuAction | 'separator';

export interface MenuSpec {
  label: string;
  items: MenuItem[];
}

export interface HeaderMenuActions {
  editor: Editor | null;
  viewMode: ViewMode;
  canDelete: boolean;
  wordCount: number;
  charCount: number;
  onNewDoc: () => void;
  onToggleSidebar: () => void;
  onToggleFind: () => void;
  onPageSetup: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onPrint: () => void;
  onExportHtml: () => void;
  onExportText: () => void;
  onDelete: () => void;
  onInsertImage: (file: File) => void;
  onInsertTable: () => void;
  onInsertPageBreak: () => void;
  onHelp: () => void;
}
