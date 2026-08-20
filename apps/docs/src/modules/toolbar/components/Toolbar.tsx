import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { Icon, Separator } from '@office/ui-kit';
import type { RefObject } from 'react';
import type { ViewMode } from '@/modules/editor/types/editor.types';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';
import { ColorFontTools } from '@/modules/toolbar/components/ColorFontTools';
import { DocTools } from '@/modules/toolbar/components/DocTools';
import { InsertTools } from '@/modules/toolbar/components/InsertTools';
import { ListAlignTools } from '@/modules/toolbar/components/ListAlignTools';
import { TextStyleTools } from '@/modules/toolbar/components/TextStyleTools';

export interface ToolbarProps {
  editor: Editor | null;
  findOpen: boolean;
  viewMode: ViewMode;
  fontPickerRef?: RefObject<HTMLButtonElement | null>;
  colorPickerRef?: RefObject<HTMLButtonElement | null>;
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
  onInsertMath?: () => void;
  onPageSetup: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  isReadOnly?: boolean;
}

const Sep = () => (
  <Separator orientation="vertical" className="h-5 w-px bg-border/50 mx-1 shrink-0" />
);

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
  onInsertMath,
  onPageSetup,
  onViewModeChange,
  isReadOnly = false,
}: ToolbarProps) => {
  const { t } = useTranslation('docs');

  if (!editor) {
    return (
      <div
        className="doc-toolbar border-b border-border bg-card/80 px-3 py-1 flex items-center gap-0.5 overflow-x-auto min-h-10 shrink-0"
        role="toolbar"
        aria-label={t('toolbar.formattingToolbar')}
      >
        <div className="flex items-center gap-1 opacity-40 pointer-events-none">
          <ToolbarButton label={t('toolbar.undo')} disabled onClick={() => undefined}>
            <Icon name="undo-2" />
          </ToolbarButton>
          <ToolbarButton label={t('toolbar.redo')} disabled onClick={() => undefined}>
            <Icon name="redo-2" />
          </ToolbarButton>
        </div>
      </div>
    );
  }

  return (
    <div
      className="doc-toolbar border-b border-border bg-card/80 px-3 py-1 flex items-center gap-0.5 overflow-x-auto min-h-10 shrink-0"
      role="toolbar"
      aria-label={t('toolbar.formattingToolbar')}
    >
      <DocTools
        canDelete={canDelete}
        onPrint={onPrint}
        onDelete={onDelete}
        onToggleFind={onToggleFind}
        findOpen={findOpen}
        onPageSetup={onPageSetup}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onExportHtml={onExportHtml}
        onExportText={onExportText}
      />

      <Sep />

      <ColorFontTools
        editor={editor}
        fontPickerRef={fontPickerRef}
        colorPickerRef={colorPickerRef}
      />

      <Sep />

      <TextStyleTools editor={editor} onSetLink={onSetLink} />

      <Sep />

      <ListAlignTools editor={editor} />

      {!isReadOnly && (
        <>
          <Sep />
          <InsertTools
            editor={editor}
            onInsertImage={onInsertImage}
            onInsertTable={onInsertTable}
            onInsertPageBreak={onInsertPageBreak}
            onInsertMath={onInsertMath}
          />
        </>
      )}
    </div>
  );
};
