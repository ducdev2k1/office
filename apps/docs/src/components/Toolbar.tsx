import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import type { RefObject } from 'react';
import type { ViewMode } from '@/editor/use-pagination';
import { ToolbarButton } from '@/components/ToolbarButton';
import { ColorFontTools } from '@/components/toolbar/ColorFontTools';
import { DocTools } from '@/components/toolbar/DocTools';
import { InsertTools } from '@/components/toolbar/InsertTools';
import { ListAlignTools } from '@/components/toolbar/ListAlignTools';
import { TextStyleTools } from '@/components/toolbar/TextStyleTools';

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
  const { t } = useTranslation('docs');

  if (!editor) return <div className="toolbar" aria-label="Toolbar" />;

  return (
    <div className="toolbar" aria-label="Toolbar">
      <ToolbarButton label={t('toolbar.undo')} onClick={() => editor.chain().focus().undo().run()}>
        <Icon name="undo" />
      </ToolbarButton>
      <ToolbarButton label={t('toolbar.redo')} onClick={() => editor.chain().focus().redo().run()}>
        <Icon name="redo" />
      </ToolbarButton>
      <span className="toolbar-separator" />
      <ToolbarButton
        active={editor.isActive('paragraph')}
        label={t('toolbar.normalText')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Icon name="pilcrow" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('heading', { level: 1 })}
        label={t('toolbar.heading1')}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Icon name="heading-1" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('heading', { level: 2 })}
        label={t('toolbar.heading2')}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Icon name="heading-2" />
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