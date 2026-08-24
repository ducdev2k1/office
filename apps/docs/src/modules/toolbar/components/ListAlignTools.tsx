import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import {
  BulletListDropdown,
  ChecklistDropdown,
  Icon,
  NumberedListDropdown,
  type BulletPreset,
  type NumberPreset,
} from '@office/ui-kit';
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

  const handleSelectBulletPreset = (_preset: BulletPreset) => {
    if (!editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run();
    }
  };

  const handleSelectNumberPreset = (_preset: NumberPreset) => {
    if (!editor.isActive('orderedList')) {
      editor.chain().focus().toggleOrderedList().run();
    }
  };

  const handleSelectChecklistStyle = (_strikethrough: boolean) => {
    if (!editor.isActive('taskList')) {
      editor.chain().focus().toggleTaskList().run();
    }
  };

  return (
    <>
      <ChecklistDropdown
        active={editor.isActive('taskList')}
        label={t('toolbar.taskList')}
        onToggle={() => editor.chain().focus().toggleTaskList().run()}
        onSelectStyle={handleSelectChecklistStyle}
      />
      <BulletListDropdown
        active={editor.isActive('bulletList')}
        label={t('toolbar.bulletList')}
        onToggle={() => editor.chain().focus().toggleBulletList().run()}
        onSelectPreset={handleSelectBulletPreset}
        onSelectChecklist={handleSelectChecklistStyle}
      />
      <NumberedListDropdown
        active={editor.isActive('orderedList')}
        label={t('toolbar.orderedList')}
        onToggle={() => editor.chain().focus().toggleOrderedList().run()}
        onSelectPreset={handleSelectNumberPreset}
      />
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
    </>
  );
};

