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

interface DragSession {
  type: 'move' | 'resize';
  handle?: ResizeHandle;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialW: number;
  initialH: number;
  currentX: number;
  currentY: number;
  currentW: number;
  currentH: number;
  elementId: string;
  domElement: HTMLElement | null;
}

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
  const dragRef = useRef<DragSession | null>(null);
  const rafIdRef = useRef<number | null>(null);

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

  // 120 FPS+ GPU-accelerated Pointer Move engine using requestAnimationFrame
  useEffect(() => {
    const applyDirectTransform = () => {
      const session = dragRef.current;
      if (!session || !session.domElement) return;

      const leftPercent = (session.currentX / 960) * 100;
      const topPercent = (session.currentY / 540) * 100;
      const widthPercent = (session.currentW / 960) * 100;
      const heightPercent = (session.currentH / 540) * 100;

      session.domElement.style.left = `${leftPercent}%`;
      session.domElement.style.top = `${topPercent}%`;
      session.domElement.style.width = `${widthPercent}%`;
      session.domElement.style.height = `${heightPercent}%`;
      session.domElement.style.willChange = 'left, top, width, height';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const session = dragRef.current;

      const rect = canvasRef.current.getBoundingClientRect();
      const scaleFactor = rect.width / 960;

      // Extract high-frequency sub-frame event if available (ProMotion 120Hz+ / 1000Hz mice)
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      const lastEvent = events[events.length - 1] || e;

      const deltaX = (lastEvent.clientX - session.startX) / scaleFactor;
      const deltaY = (lastEvent.clientY - session.startY) / scaleFactor;

      if (session.type === 'move') {
        session.currentX = Math.round(Math.max(0, Math.min(960 - session.initialW, session.initialX + deltaX)));
        session.currentY = Math.round(Math.max(0, Math.min(540 - session.initialH, session.initialY + deltaY)));
      } else if (session.type === 'resize' && session.handle) {
        const handle = session.handle;
        let newX = session.initialX;
        let newY = session.initialY;
        let newW = session.initialW;
        let newH = session.initialH;

        if (handle.includes('e')) newW = Math.max(30, session.initialW + deltaX);
        if (handle.includes('s')) newH = Math.max(20, session.initialH + deltaY);
        if (handle.includes('w')) {
          const maxDelta = session.initialW - 30;
          const appliedDelta = Math.min(maxDelta, deltaX);
          newX = session.initialX + appliedDelta;
          newW = session.initialW - appliedDelta;
        }
        if (handle.includes('n')) {
          const maxDelta = session.initialH - 20;
          const appliedDelta = Math.min(maxDelta, deltaY);
          newY = session.initialY + appliedDelta;
          newH = session.initialH - appliedDelta;
        }

        session.currentX = Math.round(newX);
        session.currentY = Math.round(newY);
        session.currentW = Math.round(newW);
        session.currentH = Math.round(newH);
      }

      // Schedule hardware-accelerated GPU render tick
      if (rafIdRef.current === null) {
        rafIdRef.current = window.requestAnimationFrame(() => {
          applyDirectTransform();
          rafIdRef.current = null;
        });
      }
    };

    const handlePointerUp = () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      const session = dragRef.current;
      if (session) {
        if (session.domElement) {
          session.domElement.style.willChange = 'auto';
        }
        if (
          session.currentX !== session.initialX ||
          session.currentY !== session.initialY ||
          session.currentW !== session.initialW ||
          session.currentH !== session.initialH
        ) {
          onUpdateElement(session.elementId, {
            x: session.currentX,
            y: session.currentY,
            width: session.currentW,
            height: session.currentH,
          });
        }
      }
      dragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [onUpdateElement]);

  const handleStartMove = useCallback((e: React.PointerEvent, el: SlideElement) => {
    e.stopPropagation();
    onSelectElement(el.id);
    const dom = (e.currentTarget as HTMLElement).closest('[data-slide-element]') as HTMLElement | null;
    dragRef.current = {
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialW: el.width,
      initialH: el.height,
      currentX: el.x,
      currentY: el.y,
      currentW: el.width,
      currentH: el.height,
      elementId: el.id,
      domElement: dom,
    };
  }, [onSelectElement]);

  const handleStartResize = useCallback((e: React.PointerEvent, el: SlideElement, handle: ResizeHandle) => {
    e.stopPropagation();
    const dom = (e.currentTarget as HTMLElement).closest('[data-slide-element]') as HTMLElement | null;
    dragRef.current = {
      type: 'resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialW: el.width,
      initialH: el.height,
      currentX: el.x,
      currentY: el.y,
      currentW: el.width,
      currentH: el.height,
      elementId: el.id,
      domElement: dom,
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
        onPointerDown={(e) => handleStartResize(e, el, h)}
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
        data-slide-element={el.id}
        onPointerDown={(e) => handleStartMove(e, el)}
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
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        className={`group select-none touch-none ${
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
            className="h-full w-full rounded object-contain pointer-events-none"
            draggable={false}
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
