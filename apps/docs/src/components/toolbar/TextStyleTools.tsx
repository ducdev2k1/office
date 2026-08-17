import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
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
        <Icon name="bold" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('italic')}
        label={t('toolbar.italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Icon name="italic" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('underline')}
        label={t('toolbar.underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Icon name="underline" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('strike')}
        label={t('toolbar.strikethrough')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Icon name="strikethrough" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('subscript')}
        label={t('toolbar.subscript')}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        <Icon name="subscript" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('superscript')}
        label={t('toolbar.superscript')}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <Icon name="superscript" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('link')} label={t('toolbar.link')} onClick={onSetLink}>
        <Icon name="link" />
      </ToolbarButton>
    </>
  );
};