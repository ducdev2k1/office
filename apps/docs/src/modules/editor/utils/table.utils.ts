import type { Editor } from '@tiptap/core';
import { cellAround, CellSelection } from '@tiptap/pm/tables';

export const isCellSelection = (selection: unknown): selection is CellSelection =>
  selection instanceof CellSelection;

export const isTableActive = (editor: Editor | null): boolean =>
  Boolean(editor?.isActive('table'));

export const getSelectedCell = (editor: Editor | null) => {
  if (!editor?.state) return null;
  const { selection } = editor.state;
  return cellAround(selection.$from);
};
