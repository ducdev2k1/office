import type { Editor } from '@tiptap/core';
import { AlignCenter, AlignLeft, AlignRight, List, ListOrdered } from 'lucide-react';
import { ToolbarButton } from '../ToolbarButton';

interface ListAlignToolsProps {
  editor: Editor;
}

export const ListAlignTools = ({ editor }: ListAlignToolsProps) => (
  <>
    <ToolbarButton
      active={editor.isActive('bulletList')}
      label="Bullet list"
      onClick={() => editor.chain().focus().toggleBulletList().run()}
    >
      <List aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive('orderedList')}
      label="Numbered list"
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
    >
      <ListOrdered aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive({ textAlign: 'left' })}
      label="Align left"
      onClick={() => editor.chain().focus().setTextAlign('left').run()}
    >
      <AlignLeft aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive({ textAlign: 'center' })}
      label="Align center"
      onClick={() => editor.chain().focus().setTextAlign('center').run()}
    >
      <AlignCenter aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive({ textAlign: 'right' })}
      label="Align right"
      onClick={() => editor.chain().focus().setTextAlign('right').run()}
    >
      <AlignRight aria-hidden="true" />
    </ToolbarButton>
  </>
);
