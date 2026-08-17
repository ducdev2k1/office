import type { Editor } from '@tiptap/core';
import { Heading1, Heading2, Pilcrow, Redo2, Undo2 } from 'lucide-react';
import type { RefObject } from 'react';
import type { ViewMode } from '../editor/use-pagination';
import { ToolbarButton } from './ToolbarButton';
import { ColorFontTools } from './toolbar/ColorFontTools';
import { DocTools } from './toolbar/DocTools';
import { InsertTools } from './toolbar/InsertTools';
import { ListAlignTools } from './toolbar/ListAlignTools';
import { TextStyleTools } from './toolbar/TextStyleTools';

export interface ToolbarProps {
  editor: Editor | null;
  findOpen: boolean;
  viewMode: ViewMode;
  fontPickerRef: RefObject<HTMLSelectElement | null>;
  colorPickerRef: RefObject<HTMLInputElement | null>;
  canDelete: boolean;
  onSetLink: () => void;
  onExportHtml: () => void;
  onExportText: () => void;
  onPrint: () => void;
  onDelete: () => void;
  onToggleFind: () => void;
  onInsertImage: (file: File) => void;
  onInsertTable: () => void;
  onInsertPageBreak: () => void;
  onPageSetup: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export const Toolbar = ({
  editor,
  findOpen,
  viewMode,
  fontPickerRef,
  colorPickerRef,
  canDelete,
  onSetLink,
  onExportHtml,
  onExportText,
  onPrint,
  onDelete,
  onToggleFind,
  onInsertImage,
  onInsertTable,
  onInsertPageBreak,
  onPageSetup,
  onViewModeChange,
}: ToolbarProps) => {
  if (!editor) return <div className="toolbar" aria-label="Thanh cong cu" />;

  return (
    <div className="toolbar" aria-label="Thanh cong cu">
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 aria-hidden="true" />
      </ToolbarButton>
      <span className="toolbar-separator" />
      <ToolbarButton
        active={editor.isActive('paragraph')}
        label="Normal text"
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('heading', { level: 1 })}
        label="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('heading', { level: 2 })}
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 aria-hidden="true" />
      </ToolbarButton>
      <span className="toolbar-separator" />
      <TextStyleTools editor={editor} onSetLink={onSetLink} />
      <span className="toolbar-separator" />
      <ColorFontTools
        editor={editor}
        fontPickerRef={fontPickerRef}
        colorPickerRef={colorPickerRef}
      />
      <span className="toolbar-separator" />
      <ListAlignTools editor={editor} />
      <span className="toolbar-separator" />
      <InsertTools
        editor={editor}
        onInsertImage={onInsertImage}
        onInsertTable={onInsertTable}
        onInsertPageBreak={onInsertPageBreak}
      />
      <span className="toolbar-separator" />
      <DocTools
        findOpen={findOpen}
        viewMode={viewMode}
        canDelete={canDelete}
        onToggleFind={onToggleFind}
        onViewModeChange={onViewModeChange}
        onPageSetup={onPageSetup}
        onPrint={onPrint}
        onExportHtml={onExportHtml}
        onExportText={onExportText}
        onDelete={onDelete}
      />
    </div>
  );
};
