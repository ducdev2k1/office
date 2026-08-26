import { useRef } from 'react';
import type { CollabUser, HocuspocusProvider } from '@office/collab-core';
import {
  Bookmark,
  Callout,
  ChartBlock,
  Checklist,
  ClearFormatting,
  Column,
  Columns,
  Comments,
  type CommentsStore,
  Footnote,
  ImageResize,
  LineSpacing,
  LinkPopover,
  MathBlock,
  MathInline,
  Mention,
  MentionSuggestion,
  ParagraphSpacing,
  ParagraphStyle,
  SectionBreak,
  SlashCommand,
  type SuggestionStore,
  Toc,
  TrackChanges,
} from '@office/tiptap-extensions';
import { CharacterCount } from '@tiptap/extensions';
import Collaboration from '@tiptap/extension-collaboration';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import FindAndReplace from '@tiptap/extension-find-and-replace';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createLowlight, common } from 'lowlight';
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
  users: () => { id: string; name: string }[];
}

export const useDocsEditor = (
  docId: string,
  content: string,
  onUpdate: (html: string) => void,
  collabConfig?: DocsCollabConfig | null,
  commentsStore?: CommentsStore,
  onSelectCommentThread?: (threadId: string) => void,
  suggestionStore?: SuggestionStore,
  onSelectSuggestion?: (suggestionId: string) => void,
) => {
  const isCollab = Boolean(collabConfig?.ydoc && collabConfig?.provider);

  const mentionUsers = () => collabConfig?.users?.() ?? [];
  const mentionedIds = () => {
    const editor = editorRef.current;
    if (!editor) return [];
    const ids: string[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'mention') {
        const id = node.attrs.id as string | undefined;
        if (id) ids.push(id);
      }
    });
    return ids;
  };

  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);

  const extensions = [
    StarterKit.configure({
      undoRedo: isCollab ? false : undefined,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      },
      codeBlock: false,
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
    CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
    ImageResize.configure({}),
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
    ClearFormatting,
    LineSpacing.configure({ types: ['textStyle'] }),
    ParagraphSpacing,
    ParagraphStyle,
    TaskItem.configure({ nested: true }),
    Checklist,
    LinkPopover,
    Toc,
    SectionBreak,
    Bookmark,
    MathInline,
    MathBlock,
    Footnote,
    Columns,
    Column,
    Callout,
    SlashCommand,
    ChartBlock,
    ...(commentsStore
      ? [
          Comments.configure({
            store: commentsStore,
            onSelectThread: onSelectCommentThread,
          }),
        ]
      : []),
    ...(suggestionStore
      ? [
          TrackChanges.configure({
            store: suggestionStore,
            onSelectSuggestion,
          }),
        ]
      : []),
    Mention.configure({}),
    MentionSuggestion.configure({
      users: mentionUsers,
      getMentionedIds: mentionedIds,
    }),
    CharacterCount,
    keyboardShortcuts,
  ];

  const editor = useEditor(
    {
      extensions,
      content: isCollab ? undefined : content,
      editorProps: { attributes: { class: 'doc-editor', spellcheck: 'true' } },
      onUpdate: isCollab ? undefined : ({ editor }) => onUpdate(editor.getHTML()),
    },
    [docId, isCollab, collabConfig?.provider, commentsStore, suggestionStore],
  );
  editorRef.current = editor;

  return editor;
};
