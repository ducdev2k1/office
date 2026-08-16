import type { Editor } from '@tiptap/core';
import {
  Columns3,
  ImagePlus,
  Minus,
  Rows3,
  SeparatorHorizontal,
  Table,
  Trash2,
} from 'lucide-react';
import { useRef } from 'react';
import { ToolbarButton } from '../ToolbarButton';

interface InsertToolsProps {
  editor: Editor;
  onInsertImage: (file: File) => void;
  onInsertTable: () => void;
  onInsertPageBreak: () => void;
}

export const InsertTools = ({
  editor,
  onInsertImage,
  onInsertTable,
  onInsertPageBreak,
}: InsertToolsProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inTable = editor.isActive('table');
  const insertImage = (file: File | undefined) => {
    if (file) onInsertImage(file);
  };

  return (
    <>
      <button
        className="tool-button"
        type="button"
        title="Chen anh"
        aria-label="Chen anh"
        onClick={() => imageInputRef.current?.click()}
      >
        <ImagePlus aria-hidden="true" />
      </button>
      <input
        ref={imageInputRef}
        className="hidden-file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          insertImage(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <ToolbarButton label="Chen bang" onClick={onInsertTable}>
        <Table aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Chen duong ke ngang"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Chen page break (Ctrl+Enter)" onClick={onInsertPageBreak}>
        <SeparatorHorizontal aria-hidden="true" />
      </ToolbarButton>
      {inTable && (
        <>
          <span className="toolbar-separator" />
          <ToolbarButton
            label="Them dong duoi"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <Rows3 aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Xoa dong" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Trash2 aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Them cot phai"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Columns3 aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Xoa cot"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Trash2 aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Xoa bang"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Table aria-hidden="true" />
          </ToolbarButton>
        </>
      )}
    </>
  );
};
