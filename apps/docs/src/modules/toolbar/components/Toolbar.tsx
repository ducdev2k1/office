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
  onPageSetup,
  onViewModeChange,
  isReadOnly = false,
}: ToolbarProps) => {
  const { t } = useTranslation('docs');

  if (!editor) {
    return (
      <div
        className="toolbar flex h-9 items-center gap-0.5 overflow-x-auto border-b border-border bg-background px-3"
        aria-label={t('toolbar.ariaLabel')}
      />
    );
  }

  if (isReadOnly) {
    return (
      <div
        className="toolbar flex h-9 min-w-0 items-center justify-between gap-2 overflow-x-auto border-b border-border bg-background px-3"
        aria-label={t('toolbar.ariaLabel')}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 select-none">
            <Icon name="eye" size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">{t('toolbar.viewOnlyNotice')}</span>
            <span className="hidden md:inline text-muted-foreground font-normal">
              — {t('toolbar.viewOnlyDescription')}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <DocTools
            findOpen={findOpen}
            viewMode={viewMode}
            canDelete={false}
            onToggleFind={onToggleFind}
            onViewModeChange={onViewModeChange}
            onPageSetup={onPageSetup}
            onPrint={onPrint}
            onExportHtml={onExportHtml}
            onExportText={onExportText}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="toolbar flex h-9 min-w-0 items-center gap-0.5 overflow-x-auto border-b border-border bg-background px-3"
      aria-label={t('toolbar.ariaLabel')}
    >
      <ToolbarButton label={t('toolbar.undo')} onClick={() => editor.chain().focus().undo().run()}>
        <Icon name="undo" />
      </ToolbarButton>
      <ToolbarButton label={t('toolbar.redo')} onClick={() => editor.chain().focus().redo().run()}>
        <Icon name="redo" />
      </ToolbarButton>

      <Sep />

      {/* Paragraph / Heading quick buttons */}
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
        <span className="text-[11px] font-bold leading-none">H1</span>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('heading', { level: 2 })}
        label={t('toolbar.heading2')}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="text-[11px] font-bold leading-none">H2</span>
      </ToolbarButton>

      <Sep />

      <TextStyleTools editor={editor} onSetLink={onSetLink} />

      <Sep />

      <ColorFontTools
        editor={editor}
        fontPickerRef={fontPickerRef}
        colorPickerRef={colorPickerRef}
      />

      <Sep />

      <ListAlignTools editor={editor} />

      <Sep />

      <InsertTools
        editor={editor}
        onInsertImage={onInsertImage}
        onInsertTable={onInsertTable}
        onInsertPageBreak={onInsertPageBreak}
      />

      <Sep />

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
