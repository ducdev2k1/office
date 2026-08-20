import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';
import { useTranslation } from '@office/i18n';
import { Icon, Separator } from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import { useRef } from 'react';
import { EmojiPicker } from '@/modules/toolbar/components/EmojiPicker';
import { TableProperties } from '@/modules/toolbar/components/TableProperties';
import { CodeLanguagePicker } from '@/modules/toolbar/components/CodeLanguagePicker';

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
  const { t } = useTranslation('docs');
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
      <ToolbarButton label={t('toolbar.insertTable')} onClick={onInsertTable}>
        <Icon name="table" />
      </ToolbarButton>
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
