import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Separator,
  cn,
} from '@office/ui-kit';
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
  fontPickerRef?: RefObject<HTMLSelectElement | null>;
  colorPickerRef?: RefObject<HTMLInputElement | null>;
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

  if (!editor) return <div className="toolbar" aria-label={t('toolbar.ariaLabel')} />;

  const getStyleLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return t('toolbar.heading1');
    if (editor.isActive('heading', { level: 2 })) return t('toolbar.heading2');
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return t('toolbar.normalText');
  };

  return (
    <div className="toolbar" aria-label={t('toolbar.ariaLabel')}>
      <ToolbarButton label={t('toolbar.undo')} onClick={() => editor.chain().focus().undo().run()}>
        <Icon name="undo" />
      </ToolbarButton>
      <ToolbarButton label={t('toolbar.redo')} onClick={() => editor.chain().focus().redo().run()}>
        <Icon name="redo" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

      {/* Paragraph Style Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-normal flex items-center justify-between gap-1 min-w-[110px] max-w-[140px] border border-border/40 hover:bg-hover"
              title={t('toolbar.normalText')}
              aria-label={t('toolbar.normalText')}
            />
          }
        >
          <span className="truncate">{getStyleLabel()}</span>
          <Icon name="chevron-down" size={12} className="opacity-60 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={cn(
              'text-xs flex items-center justify-between py-1.5',
              editor.isActive('paragraph') && 'font-semibold bg-accent',
            )}
          >
            <span>{t('toolbar.normalText')}</span>
            {editor.isActive('paragraph') && <Icon name="check" size={14} className="text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              'text-base font-bold flex items-center justify-between py-1.5',
              editor.isActive('heading', { level: 1 }) && 'bg-accent',
            )}
          >
            <span>{t('toolbar.heading1')}</span>
            {editor.isActive('heading', { level: 1 }) && (
              <Icon name="check" size={14} className="text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              'text-sm font-semibold flex items-center justify-between py-1.5',
              editor.isActive('heading', { level: 2 }) && 'bg-accent',
            )}
          >
            <span>{t('toolbar.heading2')}</span>
            {editor.isActive('heading', { level: 2 }) && (
              <Icon name="check" size={14} className="text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              'text-xs font-medium flex items-center justify-between py-1.5',
              editor.isActive('heading', { level: 3 }) && 'bg-accent',
            )}
          >
            <span>Heading 3</span>
            {editor.isActive('heading', { level: 3 }) && (
              <Icon name="check" size={14} className="text-primary" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

      <TextStyleTools editor={editor} onSetLink={onSetLink} />

      <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

      <ColorFontTools editor={editor} />

      <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

      <ListAlignTools editor={editor} />

      <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

      <InsertTools
        editor={editor}
        onInsertImage={onInsertImage}
        onInsertTable={onInsertTable}
        onInsertPageBreak={onInsertPageBreak}
      />

      <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

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
