import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { InetIcon } from '@office/ui-kit';
import { ToolbarButton } from '@/components/ToolbarButton';

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
        <InetIcon name="list" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('orderedList')}
        label={t('toolbar.orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <InetIcon name="list-ordered" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'left' })}
        label={t('toolbar.alignLeft')}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <InetIcon name="align-left" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'center' })}
        label={t('toolbar.alignCenter')}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <InetIcon name="align-center" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'right' })}
        label={t('toolbar.alignRight')}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <InetIcon name="align-right" />
      </ToolbarButton>
    </>
  );
};