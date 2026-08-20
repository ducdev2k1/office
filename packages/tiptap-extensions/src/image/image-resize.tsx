import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, type NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageResize: {
      setImage: (attrs: {
        src: string;
        alt?: string;
        title?: string;
        width?: string;
        height?: string;
        align?: string;
        float?: string;
      }) => ReturnType;
      setImageSize: (attrs: {
        width?: string;
        height?: string;
      }) => ReturnType;
      setImageAlign: (align: string) => ReturnType;
      setImageFloat: (float: string) => ReturnType;
    };
  }
}

export interface ImageResizeOptions {
  HTMLAttributes: Record<string, unknown>;
  maxWidth: number;
  minWidth: number;
}

export const ImageResize = Node.create<ImageResizeOptions>({
  name: 'imageResize',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return { HTMLAttributes: {}, maxWidth: 800, minWidth: 40 };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: 'auto',
        parseHTML: (element) => element.getAttribute('width') || element.style.width || 'auto',
        renderHTML: (attributes) =>
          attributes.width && attributes.width !== 'auto' ? { width: attributes.width } : {},
      },
      height: {
        default: 'auto',
        parseHTML: (element) => element.getAttribute('height') || element.style.height || 'auto',
        renderHTML: (attributes) =>
          attributes.height && attributes.height !== 'auto' ? { height: attributes.height } : {},
      },
      align: {
        default: 'left',
        parseHTML: (element) => element.getAttribute('data-align') || 'left',
        renderHTML: (attributes) =>
          attributes.align && attributes.align !== 'left' ? { 'data-align': attributes.align } : {},
      },
      float: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-float'),
        renderHTML: (attributes) => (attributes.float ? { 'data-float': attributes.float } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: 'imageResize', attrs }),
      setImageSize:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes('imageResize', attrs),
      setImageAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes('imageResize', { align }),
      setImageFloat:
        (float) =>
        ({ commands }) =>
          commands.updateAttributes('imageResize', { float }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeNodeView);
  },
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ImageResizeNodeView = ({ node, selected, updateAttributes }: NodeViewProps) => {
  const attrs = node.attrs as Record<string, unknown>;
  const [width, setWidth] = useState<string>(() => (attrs.width as string) ?? 'auto');
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, w: 0 });
  const widthRef = useRef(width);

  useEffect(() => {
    setWidth((attrs.width as string) ?? 'auto');
  }, [attrs.width]);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const img = wrapRef.current?.querySelector('img');
    startRef.current = { x: event.clientX, w: img?.offsetWidth ?? 0 };
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (event: MouseEvent) => {
      const delta = event.clientX - startRef.current.x;
      const next = clamp(startRef.current.w + delta, 40, 800);
      setWidth(`${next}px`);
    };
    const handleUp = () => {
      setDragging(false);
      updateAttributes({ width: widthRef.current });
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, updateAttributes]);

  const alignClass =
    attrs.align === 'center'
      ? 'mx-auto'
      : attrs.align === 'right'
        ? 'ml-auto'
        : attrs.float === 'right'
          ? 'float-right ml-2'
          : attrs.float === 'left'
            ? 'float-left mr-2'
            : '';

  return (
    <NodeViewWrapper className="image-resize relative inline-block max-w-full" ref={wrapRef}>
      <img
        src={attrs.src as string}
        alt={(attrs.alt as string) ?? ''}
        title={(attrs.title as string) ?? ''}
        className={alignClass}
        style={{ width, height: 'auto', maxWidth: '100%' }}
        draggable={false}
        contentEditable={false}
      />
      {selected && (
        <>
          <span className="absolute inset-0 ring-2 ring-blue-500/70 pointer-events-none" />
          <span
            role="slider"
            aria-label="Kéo để thay đổi kích thước ảnh"
            className="absolute -right-1 -bottom-1 w-3.5 h-3.5 bg-blue-600 rounded-sm cursor-nwse-resize pointer-events-auto shadow-sm"
            onMouseDown={onMouseDown}
          />
        </>
      )}
    </NodeViewWrapper>
  );
};