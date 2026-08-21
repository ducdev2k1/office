import { useEffect, useRef, useState } from 'react';
import { Icon, Separator, cn, Tooltip, TooltipContent, TooltipTrigger } from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';
import { mountPopup, type ImageWrapMode } from '@office/tiptap-extensions';

interface ImageBubbleToolbarProps {
  editor: Editor;
}

export const ImageBubbleToolbar = ({ editor }: ImageBubbleToolbarProps) => {
  const { t } = useTranslation('docs');
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [attrs, setAttrs] = useState<{
    align?: string;
    wrap?: ImageWrapMode;
    margin?: number;
    width?: string;
  }>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let controller: ReturnType<typeof mountPopup> | null = null;

    const update = () => {
      if (!editor.isFocused || !editor.isEditable) {
        setVisible(false);
        controller?.destroy();
        controller = null;
        return;
      }

      const isImage = editor.isActive('imageResize');
      if (!isImage) {
        setVisible(false);
        controller?.destroy();
        controller = null;
        return;
      }

      const currentAttrs = editor.getAttributes('imageResize') as {
        align?: string;
        wrap?: ImageWrapMode;
        margin?: number;
        width?: string;
      };
      setAttrs(currentAttrs);

      const dom = editor.view.dom.querySelector(
        '.image-resize.ProseMirror-selectednode, .ProseMirror-selectednode.image-resize, .image-resize img, .ProseMirror-selectednode',
      );

      let rect: DOMRect | null = null;
      if (dom) {
        rect = dom.getBoundingClientRect();
      } else {
        const { from } = editor.state.selection;
        const nodeDom = editor.view.nodeDOM(from) as HTMLElement | null;
        if (nodeDom) {
          rect = nodeDom.getBoundingClientRect();
        }
      }

      if (!rect || rect.width === 0) {
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

  const align = attrs.align || 'left';
  const wrap = attrs.wrap || 'break';
  const margin = attrs.margin ?? 16;

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto z-50 flex items-center gap-0.5 rounded-lg border border-border bg-popover px-1.5 py-1 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
      onMouseDown={(event) => event.preventDefault()}
    >
      {/* 4 Image Wrap Modes */}
      <ToolbarButton
        active={wrap === 'inline'}
        label={t('imageWrap.inline')}
        onClick={() => editor.chain().focus().setImageWrap('inline').run()}
      >
        <Icon name="align-justify" />
      </ToolbarButton>
      <ToolbarButton
        active={wrap === 'wrap'}
        label={t('imageWrap.wrapText')}
        onClick={() => editor.chain().focus().setImageWrap('wrap').run()}
      >
        <Icon name="wrap-text" />
      </ToolbarButton>
      <ToolbarButton
        active={wrap === 'break'}
        label={t('imageWrap.breakText')}
        onClick={() => editor.chain().focus().setImageWrap('break').run()}
      >
        <Icon name="rows-3" />
      </ToolbarButton>
      <ToolbarButton
        active={wrap === 'behind'}
        label={t('imageWrap.behindText')}
        onClick={() => editor.chain().focus().setImageWrap('behind').run()}
      >
        <Icon name="layers" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-4 w-px bg-border/60" />

      {/* Alignment */}
      <ToolbarButton
        active={align === 'left'}
        label={t('toolbar.alignLeft')}
        onClick={() => editor.chain().focus().setImageAlign('left').run()}
      >
        <Icon name="align-left" />
      </ToolbarButton>
      <ToolbarButton
        active={align === 'center'}
        label={t('toolbar.alignCenter')}
        onClick={() => editor.chain().focus().setImageAlign('center').run()}
      >
        <Icon name="align-center" />
      </ToolbarButton>
      <ToolbarButton
        active={align === 'right'}
        label={t('toolbar.alignRight')}
        onClick={() => editor.chain().focus().setImageAlign('right').run()}
      >
        <Icon name="align-right" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-4 w-px bg-border/60" />

      {/* Margin Buffer */}
      {wrap === 'wrap' && (
        <>
          {[8, 16, 24].map((m) => (
            <Tooltip key={m}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      'h-7 px-1 text-[11px] rounded font-medium text-foreground/80 hover:text-foreground hover:bg-hover transition-colors cursor-pointer',
                      margin === m && 'bg-primary/15 text-primary font-semibold',
                    )}
                    onClick={() => editor.chain().focus().setImageMargin(m).run()}
                  >
                    {m}px
                  </button>
                }
              />
              <TooltipContent>{`Khoảng đệm chữ ${m}px`}</TooltipContent>
            </Tooltip>
          ))}
          <Separator orientation="vertical" className="mx-1 h-4 w-px bg-border/60" />
        </>
      )}

      {/* Quick Size Presets */}
      {(['25%', '50%', '75%', '100%'] as const).map((sz) => (
        <Tooltip key={sz}>
          <TooltipTrigger
            render={
              <button
                type="button"
                className={cn(
                  'h-7 px-1.5 text-xs rounded font-medium text-foreground/80 hover:text-foreground hover:bg-hover transition-colors cursor-pointer',
                  attrs.width === sz && 'bg-primary/15 text-primary font-semibold',
                )}
                onClick={() => editor.chain().focus().setImageSize({ width: sz }).run()}
              >
                {sz}
              </button>
            }
          />
          <TooltipContent>{`Đặt kích thước ${sz}`}</TooltipContent>
        </Tooltip>
      ))}

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className={cn(
                'h-7 px-1.5 text-xs rounded font-medium text-foreground/80 hover:text-foreground hover:bg-hover transition-colors cursor-pointer',
                (attrs.width === 'auto' || !attrs.width) && 'bg-primary/15 text-primary font-semibold',
              )}
              onClick={() => editor.chain().focus().setImageSize({ width: 'auto' }).run()}
            >
              Gốc
            </button>
          }
        />
        <TooltipContent>{t('toolbar.imageSizeOriginal')}</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-4 w-px bg-border/60" />

      {/* Delete button */}
      <ToolbarButton
        tone="danger"
        label={t('toolbar.deleteImage')}
        onClick={() => editor.chain().focus().deleteImage().run()}
      >
        <Icon name="trash-2" />
      </ToolbarButton>
    </div>
  );
};
