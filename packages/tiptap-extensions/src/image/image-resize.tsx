import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, type NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type ImageWrapMode = 'inline' | 'wrap' | 'break' | 'behind' | 'inFront';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageResize: {
      setImage: (attrs: {
        src: string;
        alt?: string;
        title?: string;
        width?: string;
        height?: string;
        align?: 'left' | 'center' | 'right';
        wrap?: ImageWrapMode;
        margin?: number;
      }) => ReturnType;
      setImageSize: (attrs: {
        width?: string;
        height?: string;
      }) => ReturnType;
      setImageAlign: (align: 'left' | 'center' | 'right') => ReturnType;
      setImageWrap: (wrap: ImageWrapMode, margin?: number) => ReturnType;
      setImageMargin: (margin: number) => ReturnType;
      deleteImage: () => ReturnType;
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
    return { HTMLAttributes: {}, maxWidth: 1200, minWidth: 40 };
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
        parseHTML: (element) => (element.getAttribute('data-align') as 'left' | 'center' | 'right') || 'left',
        renderHTML: (attributes) =>
          attributes.align && attributes.align !== 'left' ? { 'data-align': attributes.align } : {},
      },
      wrap: {
        default: 'break',
        parseHTML: (element) => (element.getAttribute('data-wrap') as ImageWrapMode) || 'break',
        renderHTML: (attributes) => ({ 'data-wrap': attributes.wrap || 'break' }),
      },
      margin: {
        default: 16,
        parseHTML: (element) => {
          const m = element.getAttribute('data-margin');
          return m ? parseInt(m, 10) : 16;
        },
        renderHTML: (attributes) => ({ 'data-margin': String(attributes.margin ?? 16) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes['data-align'] || 'left';
    const wrap = (HTMLAttributes['data-wrap'] as ImageWrapMode) || 'break';
    const margin = parseInt(HTMLAttributes['data-margin'] || '16', 10);

    let style = '';
    if (wrap === 'wrap') {
      const isRight = align === 'right';
      style = `float: ${isRight ? 'right' : 'left'}; margin-${isRight ? 'left' : 'right'}: ${margin}px; margin-bottom: ${margin}px;`;
    } else if (wrap === 'inline') {
      style = `display: inline-block; vertical-align: baseline; margin: ${margin / 2}px;`;
    } else if (wrap === 'behind') {
      style = `position: relative; opacity: 0.85; z-index: 0; margin: ${margin}px auto;`;
    } else if (wrap === 'inFront') {
      style = `position: relative; z-index: 10; margin: ${margin}px auto;`;
    } else {
      // break
      if (align === 'center') {
        style = `display: block; clear: both; margin: ${margin}px auto;`;
      } else if (align === 'right') {
        style = `display: block; clear: both; margin: ${margin}px 0 ${margin}px auto;`;
      } else {
        style = `display: block; clear: both; margin: ${margin}px auto ${margin}px 0;`;
      }
    }

    if (HTMLAttributes.width && HTMLAttributes.width !== 'auto') {
      style += ` width: ${HTMLAttributes.width};`;
    }

    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { style: style.trim() })];
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
      setImageWrap:
        (wrap, margin = 16) =>
        ({ commands }) =>
          commands.updateAttributes('imageResize', { wrap, margin }),
      setImageMargin:
        (margin) =>
        ({ commands }) =>
          commands.updateAttributes('imageResize', { margin }),
      deleteImage:
        () =>
        ({ commands }) =>
          commands.deleteSelection(),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeNodeView);
  },
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type HandleDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const ImageResizeNodeView = ({ node, selected, updateAttributes }: NodeViewProps) => {
  const attrs = node.attrs as {
    src?: string;
    alt?: string;
    title?: string;
    width?: string;
    height?: string;
    align?: 'left' | 'center' | 'right';
    wrap?: ImageWrapMode;
    margin?: number;
  };
  const [width, setWidth] = useState<string>(() => attrs.width ?? 'auto');
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const startRef = useRef<{ x: number; w: number; handle: HandleDirection }>({
    x: 0,
    w: 0,
    handle: 'bottom-right',
  });
  const widthRef = useRef(width);

  useEffect(() => {
    setWidth(attrs.width ?? 'auto');
  }, [attrs.width]);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  const onMouseDown = useCallback((event: React.MouseEvent, handle: HandleDirection) => {
    event.preventDefault();
    event.stopPropagation();
    const img = imgRef.current;
    startRef.current = {
      x: event.clientX,
      w: img?.offsetWidth ?? 0,
      handle,
    };
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (event: MouseEvent) => {
      const { x, w, handle } = startRef.current;
      const isRight = handle === 'bottom-right' || handle === 'top-right';
      const delta = isRight ? event.clientX - x : x - event.clientX;
      const next = clamp(w + delta, 40, 1200);
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

  const align = attrs.align || 'left';
  const wrapMode = attrs.wrap || 'break';
  const margin = attrs.margin ?? 16;

  let containerClass = 'image-resize select-none ';
  let wrapStyle: React.CSSProperties = {};

  if (wrapMode === 'wrap') {
    if (align === 'right') {
      containerClass += 'float-right clear-right inline-block ';
      wrapStyle = { marginLeft: `${margin}px`, marginBottom: `${margin}px` };
    } else {
      containerClass += 'float-left clear-left inline-block ';
      wrapStyle = { marginRight: `${margin}px`, marginBottom: `${margin}px` };
    }
  } else if (wrapMode === 'inline') {
    containerClass += 'inline-block align-baseline ';
    wrapStyle = { margin: `${margin / 2}px` };
  } else if (wrapMode === 'behind') {
    containerClass += 'block opacity-85 my-3 ';
    if (align === 'center') containerClass += 'mx-auto text-center ';
    else if (align === 'right') containerClass += 'ml-auto text-right ';
  } else if (wrapMode === 'inFront') {
    containerClass += 'block relative z-10 my-3 ';
    if (align === 'center') containerClass += 'mx-auto text-center ';
    else if (align === 'right') containerClass += 'ml-auto text-right ';
  } else {
    // Break text
    containerClass += 'w-full flex my-3 clear-both ';
    if (align === 'center') containerClass += 'justify-center';
    else if (align === 'right') containerClass += 'justify-end';
    else containerClass += 'justify-start';
    wrapStyle = { marginTop: `${margin}px`, marginBottom: `${margin}px` };
  }

  return (
    <NodeViewWrapper className={containerClass} style={wrapStyle} ref={wrapRef} data-wrap={wrapMode}>
      <div className="relative inline-block max-w-full group">
        <img
          ref={imgRef}
          src={attrs.src}
          alt={attrs.alt ?? ''}
          title={attrs.title ?? ''}
          style={{ width, height: 'auto', maxWidth: '100%', display: 'block' }}
          draggable={false}
          contentEditable={false}
          className="rounded-xs select-none"
        />

        {selected && (
          <>
            <span className="absolute inset-0 ring-2 ring-primary/80 pointer-events-none rounded-xs" />
            <span
              role="slider"
              aria-label="Kéo góc trên trái để đổi kích thước"
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary border-2 border-white rounded-xs cursor-nwse-resize pointer-events-auto shadow"
              onMouseDown={(e) => onMouseDown(e, 'top-left')}
            />
            <span
              role="slider"
              aria-label="Kéo góc trên phải để đổi kích thước"
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary border-2 border-white rounded-xs cursor-nesw-resize pointer-events-auto shadow"
              onMouseDown={(e) => onMouseDown(e, 'top-right')}
            />
            <span
              role="slider"
              aria-label="Kéo góc dưới trái để đổi kích thước"
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary border-2 border-white rounded-xs cursor-nesw-resize pointer-events-auto shadow"
              onMouseDown={(e) => onMouseDown(e, 'bottom-left')}
            />
            <span
              role="slider"
              aria-label="Kéo góc dưới phải để đổi kích thước"
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary border-2 border-white rounded-xs cursor-nwse-resize pointer-events-auto shadow"
              onMouseDown={(e) => onMouseDown(e, 'bottom-right')}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};