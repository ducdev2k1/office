import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { InetIcon } from '@office/ui-kit';
import { ToolbarButton } from '@/components/ToolbarButton';

interface TextStyleToolsProps {
  editor: Editor;
  onSetLink: () => void;
}

export const TextStyleTools = ({ editor, onSetLink }: TextStyleToolsProps) => {
  const { t } = useTranslation('docs');

  return (
    <>
      <ToolbarButton
        active={editor.isActive('bold')}
        label={t('toolbar.bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <InetIcon name="bold" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('italic')}
        label={t('toolbar.italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <InetIcon name="italic" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('underline')}
        label={t('toolbar.underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <InetIcon name="underline" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('strike')}
        label={t('toolbar.strikethrough')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <InetIcon name="strikethrough" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('subscript')}
        label={t('toolbar.subscript')}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        <InetIcon name="subscript" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('superscript')}
        label={t('toolbar.superscript')}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <InetIcon name="superscript" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('link')} label={t('toolbar.link')} onClick={onSetLink}>
        <InetIcon name="link" />
      </ToolbarButton>
    </>
  );
};