import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';
import { useTranslation } from '@office/i18n';
import {
  Button,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  TableGridPicker,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import { useRef, useState } from 'react';
import { EmojiPicker } from '@/modules/toolbar/components/EmojiPicker';
import { TableProperties } from '@/modules/toolbar/components/TableProperties';
import { CodeLanguagePicker } from '@/modules/toolbar/components/CodeLanguagePicker';

interface InsertToolsProps {
  editor: Editor;
  onInsertImage: (file: File) => void;
  onInsertTable: (rows?: number, cols?: number) => void;
  onInsertPageBreak: () => void;
  onInsertMath?: () => void;
}

export const InsertTools = ({
  editor,
  onInsertImage,
  onInsertTable,
  onInsertPageBreak,
  onInsertMath,
}: InsertToolsProps) => {
  const { t } = useTranslation('docs');
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inTable = editor.isActive('table');
  const insertImage = (file: File | undefined) => {
    if (file) onInsertImage(file);
  };
  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
  };

  return (
    <>
      <ToolbarButton
        label={t('toolbar.insertImage')}
        onClick={() => imageInputRef.current?.click()}
      >
        <Icon name="image-plus" />
      </ToolbarButton>
      <input
        ref={imageInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={(event) => {
          insertImage(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <Popover open={tablePickerOpen} onOpenChange={setTablePickerOpen}>
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('toolbar.insertTable')}
                  className={cn(
                    'inline-flex items-center justify-center size-7 p-0 rounded text-foreground/80 hover:text-foreground hover:bg-hover transition-colors',
                    tablePickerOpen && 'bg-primary/15 text-primary',
                  )}
                >
                  <Icon name="table" size={16} />
                </Button>
              }
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {t('toolbar.insertTable')}
          </TooltipContent>
        </Tooltip>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="p-1 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <TableGridPicker
            onSelect={(rows, cols) => {
              onInsertTable(rows, cols);
              setTablePickerOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <ToolbarButton
        label={t('toolbar.insertHorizontalRule')}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Icon name="minus" />
      </ToolbarButton>
      <ToolbarButton label={t('toolbar.insertPageBreak')} onClick={onInsertPageBreak}>
        <Icon name="separator-horizontal" />
      </ToolbarButton>
      <ToolbarButton label={t('toolbar.insertToc')} onClick={() => editor.chain().focus().insertToc().run()}>
        <Icon name="list" />
      </ToolbarButton>
      {onInsertMath && (
        <ToolbarButton label={t('menu.insert.math')} onClick={onInsertMath}>
          <span className="font-serif italic font-bold text-xs">∑</span>
        </ToolbarButton>
      )}
      <EmojiPicker
        trigger={
          <ToolbarButton label={t('toolbar.insertEmoji')} onClick={() => undefined}>
            <span className="text-[15px] leading-none" aria-hidden="true">
              😀
            </span>
          </ToolbarButton>
        }
        onSelect={insertEmoji}
      />
      <CodeLanguagePicker editor={editor} />
      {inTable && (
        <>
          <Separator orientation="vertical" className="h-5 w-px bg-border/60 mx-1 shrink-0" />
          <TableProperties editor={editor} />
          <ToolbarButton
            label={t('toolbar.addRowBelow')}
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <Icon name="rows-3" />
          </ToolbarButton>
          <ToolbarButton
            label={t('toolbar.deleteRow')}
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <Icon name="trash-2" />
          </ToolbarButton>
          <ToolbarButton
            label={t('toolbar.addColumnRight')}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Icon name="columns-3" />
          </ToolbarButton>
          <ToolbarButton
            label={t('toolbar.deleteColumn')}
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Icon name="columns-3" />
          </ToolbarButton>
          <ToolbarButton
            label={t('toolbar.deleteTable')}
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Icon name="table" />
          </ToolbarButton>
        </>
      )}
    </>
  );
};
