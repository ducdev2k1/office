import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Separator } from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';
import { getSelectionRect, mountPopup } from '@office/tiptap-extensions';

interface BubbleToolbarProps {
  editor: Editor;
  onSetLink: () => void;
  onAddComment?: () => void;
}

export const BubbleToolbar = ({ editor, onSetLink, onAddComment }: BubbleToolbarProps) => {
  const { t } = useTranslation('docs');
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let controller: ReturnType<typeof mountPopup> | null = null;

    const update = () => {
      const { state } = editor;
      const { from, to, empty } = state.selection;
      if (empty || !editor.isFocused || !editor.isEditable) {
        setVisible(false);
        controller?.destroy();
        controller = null;
        return;
      }
      const hasText = state.doc.textBetween(from, to, undefined, '\uFFFC').trim().length > 0;
      if (!hasText) {
        setVisible(false);
        controller?.destroy();
        controller = null;
        return;
      }
      const rect = getSelectionRect();
      if (!rect) {
        setVisible(false);
        controller?.destroy();
        controller = null;
        return;
      }
      setVisible(true);
      controller?.destroy();
      controller = mountPopup(container, { placement: 'top', anchor: rect, offset: 10 });
    };

    const view = editor.view;
    view.dom.addEventListener('mouseup', update);
    view.dom.addEventListener('keyup', update);
    editor.on('selectionUpdate', update);
    editor.on('focus', update);
    editor.on('blur', update);
    update();
    return () => {
      view.dom.removeEventListener('mouseup', update);
      view.dom.removeEventListener('keyup', update);
      editor.off('selectionUpdate', update);
      editor.off('focus', update);
      editor.off('blur', update);
      controller?.destroy();
    };
  }, [editor]);

  if (!visible || !editor.isEditable) return null;

  const content = (
    <div
      ref={containerRef}
      className="fixed z-50 flex items-center gap-0.5 rounded-xl border border-border bg-popover/95 backdrop-blur-md px-1.5 py-1 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
      onMouseDown={(event) => event.preventDefault()}
    >
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
      <Separator orientation="vertical" className="mx-1 h-4 w-px bg-border/60" />
      <ToolbarButton
        label={t('toolbar.alignLeft')}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <Icon name="align-left" />
      </ToolbarButton>
      <ToolbarButton
        label={t('toolbar.alignCenter')}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <Icon name="align-center" />
      </ToolbarButton>
      <ToolbarButton
        label={t('toolbar.alignRight')}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <Icon name="align-right" />
      </ToolbarButton>
      <Separator orientation="vertical" className="mx-1 h-4 w-px bg-border/60" />
      <ToolbarButton label={t('toolbar.link')} onClick={onSetLink}>
        <Icon name="link" />
      </ToolbarButton>
      {onAddComment && (
        <ToolbarButton label="Thêm bình luận" onClick={onAddComment}>
          <Icon name="comment" className="text-amber-500" />
        </ToolbarButton>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};