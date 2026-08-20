import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';

interface ListAlignToolsProps {
  editor: Editor;
}

export const ListAlignTools = ({ editor }: ListAlignToolsProps) => {
  const { t } = useTranslation('docs');

  return (
    <>
      <ToolbarButton
        active={editor.isActive('bulletList')}
        label={t('toolbar.bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <Icon name="list" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('orderedList')}
        label={t('toolbar.orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <Icon name="list-ordered" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'left' })}
        label={t('toolbar.alignLeft')}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <Icon name="align-left" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'center' })}
        label={t('toolbar.alignCenter')}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <Icon name="align-center" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'right' })}
        label={t('toolbar.alignRight')}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <Icon name="align-right" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'justify' })}
        label={t('toolbar.alignJustify')}
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <Icon name="align-justify" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('taskList')}
        label={t('toolbar.taskList')}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <Icon name="check-square" />
      </ToolbarButton>
    </>
  );
};
