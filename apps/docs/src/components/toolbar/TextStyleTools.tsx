import type { Editor } from '@tiptap/core';
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Strikethrough,
  Subscript,
  Superscript,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { ToolbarButton } from '../ToolbarButton';

interface TextStyleToolsProps {
  editor: Editor;
  onSetLink: () => void;
}

export const TextStyleTools = ({ editor, onSetLink }: TextStyleToolsProps) => (
  <>
    <ToolbarButton
      active={editor.isActive('bold')}
      label="Bold"
      onClick={() => editor.chain().focus().toggleBold().run()}
    >
      <Bold aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive('italic')}
      label="Italic"
      onClick={() => editor.chain().focus().toggleItalic().run()}
    >
      <Italic aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive('underline')}
      label="Underline"
      onClick={() => editor.chain().focus().toggleUnderline().run()}
    >
      <UnderlineIcon aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive('strike')}
      label="Strikethrough"
      onClick={() => editor.chain().focus().toggleStrike().run()}
    >
      <Strikethrough aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive('subscript')}
      label="Subscript"
      onClick={() => editor.chain().focus().toggleSubscript().run()}
    >
      <Subscript aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive('superscript')}
      label="Superscript"
      onClick={() => editor.chain().focus().toggleSuperscript().run()}
    >
      <Superscript aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton active={editor.isActive('link')} label="Link" onClick={onSetLink}>
      <LinkIcon aria-hidden="true" />
    </ToolbarButton>
  </>
);
