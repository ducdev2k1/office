import type { SlideElement, SlideItem } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SlideViewerProps {
  slide?: SlideItem;
  zoom: number;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (elementId: string, patch: Partial<SlideElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onDuplicateElement: (elementId: string) => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const SlideViewer = ({
  slide,
  zoom,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
}: SlideViewerProps) => {
  const { t } = useTranslation('slides');
  const [editingId, setEditingId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    type: 'move' | 'resize';
    handle?: ResizeHandle;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
    elementId: string;
  } | null>(null);

  // Keyboard navigation & deletion on selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElementId || editingId) return;

      const el = slide?.elements.find((item) => item.id === selectedElementId);
      if (!el) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedElementId);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicateElement(selectedElementId);
        return;
      }

      const step = e.shiftKey ? 10 : 2;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement(selectedElementId, { y: Math.max(0, el.y - step) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement(selectedElementId, { y: Math.min(540 - el.height, el.y + step) });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement(selectedElementId, { x: Math.max(0, el.x - step) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement(selectedElementId, { x: Math.min(960 - el.width, el.x + step) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, editingId, slide, onDeleteElement, onDuplicateElement, onUpdateElement]);

  // Global mouse move & mouse up for dragging / resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const { type, handle, startX, startY, initialX, initialY, initialW, initialH, elementId } = dragRef.current;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleFactor = rect.width / 960;

      const deltaX = (e.clientX - startX) / scaleFactor;
      const deltaY = (e.clientY - startY) / scaleFactor;

      if (type === 'move') {
        const newX = Math.round(Math.max(0, Math.min(960 - initialW, initialX + deltaX)));
        const newY = Math.round(Math.max(0, Math.min(540 - initialH, initialY + deltaY)));
        onUpdateElement(elementId, { x: newX, y: newY });
      } else if (type === 'resize' && handle) {
        let newX = initialX;
        let newY = initialY;
        let newW = initialW;
        let newH = initialH;

        if (handle.includes('e')) newW = Math.max(30, initialW + deltaX);
        if (handle.includes('s')) newH = Math.max(20, initialH + deltaY);
        if (handle.includes('w')) {
          const maxDelta = initialW - 30;
          const appliedDelta = Math.min(maxDelta, deltaX);
          newX = initialX + appliedDelta;
          newW = initialW - appliedDelta;
        }
        if (handle.includes('n')) {
          const maxDelta = initialH - 20;
          const appliedDelta = Math.min(maxDelta, deltaY);
          newY = initialY + appliedDelta;
          newH = initialH - appliedDelta;
        }

        onUpdateElement(elementId, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onUpdateElement]);

  const handleStartMove = useCallback((e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    onSelectElement(el.id);
    dragRef.current = {
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialW: el.width,
      initialH: el.height,
      elementId: el.id,
    };
  }, [onSelectElement]);

  const handleStartResize = useCallback((e: React.MouseEvent, el: SlideElement, handle: ResizeHandle) => {
    e.stopPropagation();
    dragRef.current = {
      type: 'resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialW: el.width,
      initialH: el.height,
      elementId: el.id,
    };
  }, []);

  if (!slide) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-sm text-muted-foreground">
        {t('editor.noSlides')}
      </div>
    );
  }

  const renderShapeSvg = (el: SlideElement) => {
    const kind = el.shapeKind || 'rect';
    const fill = el.fill || '#3b82f6';
    const stroke = el.stroke || 'none';
    const strokeWidth = el.strokeWidth || 0;

    if (kind === 'circle') {
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
          <ellipse cx="50" cy="50" rx="48" ry="48" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }
    if (kind === 'triangle') {
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
          <polygon points="50,4 96,96 4,96" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }
    if (kind === 'arrow') {
      return (
        <svg viewBox="0 0 100 60" className="h-full w-full pointer-events-none">
          <polygon points="0,20 60,20 60,0 100,30 60,60 60,40 0,40" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }
    if (kind === 'star') {
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
          <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }
    return (
      <div
        className="h-full w-full"
        style={{
          backgroundColor: fill,
          border: stroke !== 'none' ? `${strokeWidth || 2}px solid ${stroke}` : undefined,
          borderRadius: kind === 'rounded' ? '12px' : '0px',
        }}
      />
    );
  };

  const renderHandles = (el: SlideElement) => {
    const handles: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    const handlePositions: Record<ResizeHandle, string> = {
      nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
      n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
      ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
      e: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
      se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
      s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
      sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
      w: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
    };

    return handles.map((h) => (
      <div
        key={h}
        onMouseDown={(e) => handleStartResize(e, el, h)}
        className={`absolute z-30 h-2.5 w-2.5 rounded-xs border border-white bg-[var(--o-kind-slides)] shadow-xs ${handlePositions[h]}`}
      />
    ));
  };

  const renderElement = (el: SlideElement) => {
    const isSelected = selectedElementId === el.id;
    const isEditing = editingId === el.id;

    const leftPercent = (el.x / 960) * 100;
    const topPercent = (el.y / 540) * 100;
    const widthPercent = (el.width / 960) * 100;
    const heightPercent = (el.height / 540) * 100;

    return (
      <div
        key={el.id}
        onMouseDown={(e) => handleStartMove(e, el)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (el.type === 'text') setEditingId(el.id);
        }}
        style={{
          position: 'absolute',
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          width: `${widthPercent}%`,
          height: `${heightPercent}%`,
        }}
        className={`group select-none ${
          isSelected
            ? 'ring-2 ring-[var(--o-kind-slides)] ring-offset-1 ring-offset-background'
            : 'hover:ring-1 hover:ring-[var(--o-kind-slides)]/50'
        }`}
      >
        {isSelected && renderHandles(el)}

        {el.type === 'text' && (
          <div
            style={{
              fontSize: el.fontSize ? `${(el.fontSize / 16) * 1}rem` : '1.125rem',
              color: el.color || '#0f172a',
              textAlign: el.align || 'left',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textDecoration: el.textDecoration || 'none',
              backgroundColor: el.fill || undefined,
              border: el.stroke ? `${el.strokeWidth || 1}px solid ${el.stroke}` : undefined,
              borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
            }}
            className="h-full w-full overflow-hidden p-1.5 leading-relaxed whitespace-pre-wrap"
          >
            {isEditing ? (
              <textarea
                autoFocus
                defaultValue={el.content}
                onBlur={(e) => {
                  setEditingId(null);
                  onUpdateElement(el.id, { content: e.target.value });
                }}
                className="h-full w-full resize-none border-none bg-transparent p-0 outline-none"
                style={{
                  fontSize: 'inherit',
                  color: 'inherit',
                  textAlign: 'inherit',
                  fontWeight: 'inherit',
                  fontStyle: 'inherit',
                }}
              />
            ) : (
              el.content || 'Nhấp đúp để nhập văn bản'
            )}
          </div>
        )}

        {el.type === 'shape' && (
          <div className="h-full w-full overflow-hidden shadow-xs">
            {renderShapeSvg(el)}
          </div>
        )}

        {el.type === 'image' && (
          <img
            src={el.url}
            alt={el.content || 'Hình ảnh slide'}
            className="h-full w-full rounded object-contain"
          />
        )}
      </div>
    );
  };

  const scale = zoom / 100;

  return (
    <main
      onClick={() => {
        onSelectElement(null);
        setEditingId(null);
      }}
      className="relative flex flex-1 items-center justify-center overflow-auto bg-workspace p-8"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          ref={canvasRef}
          className="relative aspect-[16/9] w-[960px] max-w-[960px] overflow-hidden rounded-lg border border-border bg-white shadow-xl dark:bg-slate-900"
          style={{ backgroundColor: slide.background || undefined }}
        >
          {slide.elements.map(renderElement)}
        </div>
      </div>
    </main>
  );
};
