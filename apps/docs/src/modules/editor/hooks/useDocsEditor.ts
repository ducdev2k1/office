import Color from '@tiptap/extension-color';
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
import { pagination } from '@/modules/editor/utils/pagination.utils';
import { FontSize } from '@/modules/editor/extensions/fontSize.extension';
import { FontWeight } from '@/modules/editor/extensions/fontWeight.extension';
import { keyboardShortcuts } from '@/modules/editor/extensions/keyboardShortcuts.extension';
import { PageBreak } from '@/modules/editor/extensions/pageBreak.extension';
import { Indent } from '@/modules/editor/extensions/indent.extension';
import FindAndReplace from '@tiptap/extension-find-and-replace';

export const useDocsEditor = (
  docId: string,
  content: string,
  onUpdate: (html: string) => void,
) =>
  useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: {
            openOnClick: false,
            autolink: true,
            defaultProtocol: 'https',
          },
        }),
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
        pagination,
        keyboardShortcuts,
      ],
      content,
      editorProps: { attributes: { class: 'doc-editor' } },
      onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
    },
    [docId],
  );
