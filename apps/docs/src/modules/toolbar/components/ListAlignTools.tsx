import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';

interface ListAlignToolsProps {
  editor: Editor;
}

export const ListAlignTools = ({ editor }: ListAlignToolsProps) => {
  const { t } = useTranslation('docs');

  const isImage = editor.isActive('imageResize');
  const imageAttrs = isImage
    ? (editor.getAttributes('imageResize') as { align?: 'left' | 'center' | 'right'; float?: string | null })
    : null;

  const isAlignLeft = isImage
    ? !imageAttrs?.float && (imageAttrs?.align === 'left' || !imageAttrs?.align)
    : editor.isActive({ textAlign: 'left' });

  const isAlignCenter = isImage
    ? !imageAttrs?.float && imageAttrs?.align === 'center'
    : editor.isActive({ textAlign: 'center' });

  const isAlignRight = isImage
    ? !imageAttrs?.float && imageAttrs?.align === 'right'
    : editor.isActive({ textAlign: 'right' });

  const isAlignJustify = !isImage && editor.isActive({ textAlign: 'justify' });

  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (isImage) {
      if (alignment === 'justify') return;
      editor.chain().focus().setImageAlign(alignment).run();
    } else {
      editor.chain().focus().setTextAlign(alignment).run();
    }
  };

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
        active={isAlignLeft}
        label={t('toolbar.alignLeft')}
        onClick={() => handleAlign('left')}
      >
        <Icon name="align-left" />
      </ToolbarButton>
      <ToolbarButton
        active={isAlignCenter}
        label={t('toolbar.alignCenter')}
        onClick={() => handleAlign('center')}
      >
        <Icon name="align-center" />
      </ToolbarButton>
      <ToolbarButton
        active={isAlignRight}
        label={t('toolbar.alignRight')}
        onClick={() => handleAlign('right')}
      >
        <Icon name="align-right" />
      </ToolbarButton>
      <ToolbarButton
        active={isAlignJustify}
        disabled={isImage}
        label={t('toolbar.alignJustify')}
        onClick={() => handleAlign('justify')}
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
