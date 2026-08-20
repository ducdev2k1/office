import type { CollabUser, HocuspocusProvider } from '@office/collab-core';
import Collaboration from '@tiptap/extension-collaboration';
import Color from '@tiptap/extension-color';
import FindAndReplace from '@tiptap/extension-find-and-replace';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type * as Y from 'yjs';
import { CollaborationCursor } from '@/modules/editor/extensions/collaborationCursor.extension';
import { FontSize } from '@/modules/editor/extensions/fontSize.extension';
import { FontWeight } from '@/modules/editor/extensions/fontWeight.extension';
import { Indent } from '@/modules/editor/extensions/indent.extension';
import { keyboardShortcuts } from '@/modules/editor/extensions/keyboardShortcuts.extension';
import { PageBreak } from '@/modules/editor/extensions/pageBreak.extension';
import { Pagination } from '@/modules/editor/extensions/pagination.extension';

export interface DocsCollabConfig {
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
  user: CollabUser;
}

export const useDocsEditor = (
  docId: string,
  content: string,
  onUpdate: (html: string) => void,
  collabConfig?: DocsCollabConfig | null,
) => {
  const isCollab = Boolean(collabConfig?.ydoc && collabConfig?.provider);

  const extensions = [
    StarterKit.configure({
      undoRedo: isCollab ? false : undefined,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      },
    }),
    ...(isCollab && collabConfig
      ? [
          Collaboration.configure({
            document: collabConfig.ydoc,
          }),
          CollaborationCursor.configure({
            provider: collabConfig.provider,
            user: collabConfig.user,
          }),
        ]
      : []),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: 'Bắt đầu viết tài liệu...' }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    FontFamily.configure({ types: ['textStyle'] }),
    FontSize.configure({ types: ['textStyle'] }),
    FontWeight.configure({ types: ['textStyle'] }),
    Image.configure({ inline: false, allowBase64: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    PageBreak,
    FindAndReplace.configure({
      injectCSS: false,
    }),
    Indent,
    Pagination,
    keyboardShortcuts,
  ];

  return useEditor(
    {
      extensions,
      content: isCollab ? undefined : content,
      editorProps: { attributes: { class: 'doc-editor' } },
      onUpdate: isCollab ? undefined : ({ editor }) => onUpdate(editor.getHTML()),
    },
    [docId, isCollab, collabConfig?.provider],
  );
};
