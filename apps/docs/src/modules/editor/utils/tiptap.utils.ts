import type { Editor, NodeWithPos } from '@tiptap/react';
import { findParentNodeClosestToPos } from '@tiptap/react';
import type { Node as PMNode } from '@tiptap/pm/model';

export const isMarkInSchema = (markName: string, editor: Editor | null): boolean => {
  if (!editor?.schema) return false;
  return editor.schema.spec.marks.get(markName) !== undefined;
};

export const isNodeInSchema = (nodeName: string, editor: Editor | null): boolean => {
  if (!editor?.schema) return false;
  return editor.schema.spec.nodes.get(nodeName) !== undefined;
};

export const isExtensionAvailable = (editor: Editor | null, extensionName: string): boolean => {
  if (!editor?.extensionManager) return false;
  return editor.extensionManager.extensions.some(
    (ext) => ext.name === extensionName || ext.options?.name === extensionName,
  );
};

export const findParentNode = (
  predicate: (node: PMNode) => boolean,
  editor: Editor | null,
): NodeWithPos | undefined => {
  if (!editor?.state) return undefined;
  return findParentNodeClosestToPos(editor.state.selection.$from, predicate);
};
