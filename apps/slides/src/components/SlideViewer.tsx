import type { SlideElement, SlideItem } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ElementSelectionOverlay, type ResizeHandle } from './canvas/ElementSelectionOverlay';

interface SlideViewerProps {
  slide?: SlideItem;
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (elementId: string, patch: Partial<SlideElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onDuplicateElement: (elementId: string) => void;
  onCenterElement?: (axis: 'horizontal' | 'vertical' | 'both') => void;
  onReplaceImage?: (url: string) => void;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
  onOpenContextMenu?: (x: number, y: number, element?: SlideElement | null) => void;
}

interface DragSession {
  type: 'move' | 'resize' | 'rotate';
  handle?: ResizeHandle;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialW: number;
  initialH: number;
  initialRot?: number;
  currentX: number;
  currentY: number;
  currentW: number;
  currentH: number;
  currentRot?: number;
  elementId: string;
  domElement: HTMLElement | null;
}

export const SlideViewer = ({
  slide,
  zoom,
  onZoomChange,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onCenterElement,
  onReplaceImage,
  onNextSlide,
  onPrevSlide,
  onOpenContextMenu,
}: SlideViewerProps) => {
  const { t } = useTranslation('slides');
  const [editingId, setEditingId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragSession | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastWheelTimeRef = useRef<number>(0);

  // Mouse wheel navigation & zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (onZoomChange) {
          const delta = e.deltaY < 0 ? 5 : -5;
          onZoomChange(Math.max(50, Math.min(200, zoom + delta)));
        }
        return;
      }

      const now = Date.now();
      if (now - lastWheelTimeRef.current < 350) return;

      if (e.deltaY > 30 && onNextSlide) {
        lastWheelTimeRef.current = now;
        onNextSlide();
      } else if (e.deltaY < -30 && onPrevSlide) {
        lastWheelTimeRef.current = now;
        onPrevSlide();
      }
    },
    [zoom, onZoomChange, onNextSlide, onPrevSlide],
  );

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

      if (session.type === 'rotate') {
        session.domElement.style.transform = `rotate(${session.currentRot || 0}deg) translateZ(0)`;
        session.domElement.style.willChange = 'transform';
        return;
      }

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

      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      const lastEvent = events[events.length - 1] || e;

      if (session.type === 'rotate') {
        const rad = Math.atan2(lastEvent.clientY - session.startY, lastEvent.clientX - session.startX);
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;
        if (Math.abs(deg % 45) < 3) deg = Math.round(deg / 45) * 45;
        session.currentRot = deg % 360;
      } else if (session.type === 'move') {
        const deltaX = (lastEvent.clientX - session.startX) / scaleFactor;
        const deltaY = (lastEvent.clientY - session.startY) / scaleFactor;
        session.currentX = Math.round(Math.max(0, Math.min(960 - session.initialW, session.initialX + deltaX)));
        session.currentY = Math.round(Math.max(0, Math.min(540 - session.initialH, session.initialY + deltaY)));
      } else if (session.type === 'resize' && session.handle) {
        const deltaX = (lastEvent.clientX - session.startX) / scaleFactor;
        const deltaY = (lastEvent.clientY - session.startY) / scaleFactor;
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
        if (session.type === 'rotate' && session.currentRot !== undefined) {
          onUpdateElement(session.elementId, { rotation: session.currentRot });
        } else if (
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
    if (e.button === 2) return;
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
    if (e.button === 2) return;
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

  const handleStartRotate = useCallback((e: React.PointerEvent, el: SlideElement) => {
    if (e.button === 2 || !canvasRef.current) return;
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleFactor = rect.width / 960;
    const centerX = rect.left + (el.x + el.width / 2) * scaleFactor;
    const centerY = rect.top + (el.y + el.height / 2) * scaleFactor;
    const dom = (e.currentTarget as HTMLElement).closest('[data-slide-element]') as HTMLElement | null;

    dragRef.current = {
      type: 'rotate',
      startX: centerX,
      startY: centerY,
      initialX: el.x,
      initialY: el.y,
      initialW: el.width,
      initialH: el.height,
      initialRot: el.rotation || 0,
      currentX: el.x,
      currentY: el.y,
      currentW: el.width,
      currentH: el.height,
      currentRot: el.rotation || 0,
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

  const renderElement = (el: SlideElement) => {
    const isSelected = selectedElementId === el.id;
    const isEditing = editingId === el.id;

    const leftPercent = (el.x / 960) * 100;
    const topPercent = (el.y / 540) * 100;
    const widthPercent = (el.width / 960) * 100;
    const heightPercent = (el.height / 540) * 100;
    const rotationDeg = el.rotation || 0;

    return (
      <div
        key={el.id}
        data-slide-element={el.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement(el.id);
        }}
        onPointerDown={(e) => handleStartMove(e, el)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelectElement(el.id);
          onOpenContextMenu?.(e.clientX, e.clientY, el);
        }}
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
          transform: `rotate(${rotationDeg}deg) translateZ(0)`,
          backfaceVisibility: 'hidden',
        }}
        className={`group select-none touch-none ${
          isSelected
            ? 'ring-2 ring-[var(--o-kind-slides)] ring-offset-1 ring-offset-background'
            : 'hover:ring-1 hover:ring-[var(--o-kind-slides)]/50'
        }`}
      >
        {isSelected && (
          <ElementSelectionOverlay
            element={el}
            onStartResize={(e, h) => handleStartResize(e, el, h)}
            onStartRotate={(e) => handleStartRotate(e, el)}
            onUpdateElement={(patch) => onUpdateElement(el.id, patch)}
            onDeleteElement={() => onDeleteElement(el.id)}
            onCenterElement={onCenterElement}
            onReplaceImage={onReplaceImage}
          />
        )}

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
              el.content || t('editor.doubleClickToEdit')
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
            alt={el.content || t('toolbar.image')}
            style={{
              border: el.stroke ? `${el.strokeWidth || 2}px solid ${el.stroke}` : undefined,
              borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
            }}
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
      onWheel={handleWheel}
      onClick={() => {
        onSelectElement(null);
        setEditingId(null);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenContextMenu?.(e.clientX, e.clientY, null);
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
