import { useCallback, useEffect, useRef, useState } from 'react';
import { formatUnitValue, mmToPx, pxToMm, snapValueMm, type RulerUnit } from './ruler.utils';

export type RulerDragTarget =
  | 'left-margin'
  | 'right-margin'
  | 'top-margin'
  | 'bottom-margin'
  | 'first-line-indent'
  | 'left-indent'
  | 'right-indent';

export interface DragState {
  target: RulerDragTarget;
  currentMm: number;
  guidePositionPx: number;
  orientation: 'vertical' | 'horizontal';
  tooltipText: string;
  tooltipClientPos: { x: number; y: number };
}

interface UseRulerProps {
  unit: RulerUnit;
  paperWidthMm: number;
  paperHeightMm: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  indents: {
    firstLineIndent: number;
    leftIndent: number;
    rightIndent: number;
  };
  onMarginChange: (margins: { top: number; right: number; bottom: number; left: number }) => void;
  onIndentChange: (indents: {
    firstLineIndent: number;
    leftIndent: number;
    rightIndent: number;
  }) => void;
}

export const useRuler = ({
  unit,
  paperWidthMm,
  paperHeightMm,
  margins,
  indents,
  onMarginChange,
  onIndentChange,
}: UseRulerProps) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const activeDragRef = useRef<{
    target: RulerDragTarget;
    startClientX: number;
    startClientY: number;
    initialMm: number;
    initialMargins: typeof margins;
    initialIndents: typeof indents;
    containerRect: DOMRect;
  } | null>(null);

  const startDrag = useCallback(
    (event: React.PointerEvent, target: RulerDragTarget, containerElement: HTMLElement) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = containerElement.getBoundingClientRect();

      let initialMm = 0;
      let orientation: 'vertical' | 'horizontal' = 'horizontal';

      if (target === 'left-margin') {
        initialMm = margins.left;
      } else if (target === 'right-margin') {
        initialMm = margins.right;
      } else if (target === 'top-margin') {
        initialMm = margins.top;
        orientation = 'vertical';
      } else if (target === 'bottom-margin') {
        initialMm = margins.bottom;
        orientation = 'vertical';
      } else if (target === 'first-line-indent') {
        initialMm = indents.firstLineIndent;
      } else if (target === 'left-indent') {
        initialMm = indents.leftIndent;
      } else if (target === 'right-indent') {
        initialMm = indents.rightIndent;
      }

      activeDragRef.current = {
        target,
        startClientX: event.clientX,
        startClientY: event.clientY,
        initialMm,
        initialMargins: { ...margins },
        initialIndents: { ...indents },
        containerRect: rect,
      };

      const initialGuidePx =
        orientation === 'horizontal'
          ? target === 'right-margin'
            ? rect.left + rect.width - mmToPx(initialMm)
            : target === 'right-indent'
              ? rect.left + rect.width - mmToPx(initialMm + margins.right)
              : target === 'first-line-indent'
                ? rect.left + mmToPx(initialMm + margins.left + indents.leftIndent)
                : rect.left + mmToPx(initialMm + (target === 'left-indent' ? margins.left : 0))
          : target === 'bottom-margin'
            ? rect.top + rect.height - mmToPx(initialMm)
            : rect.top + mmToPx(initialMm);

      setDragState({
        target,
        currentMm: initialMm,
        guidePositionPx: initialGuidePx,
        orientation,
        tooltipText: formatUnitValue(initialMm, unit),
        tooltipClientPos: { x: event.clientX, y: event.clientY },
      });

      (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    },
    [margins, indents, unit],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = activeDragRef.current;
      if (!drag) return;

      const { target, startClientX, startClientY, containerRect, initialMargins, initialIndents } =
        drag;
      const isHorizontal = !target.includes('top') && !target.includes('bottom');

      let currentMm = 0;
      let guidePositionPx = 0;

      if (isHorizontal) {
        const deltaPx = event.clientX - startClientX;
        const deltaMm = pxToMm(deltaPx);

        if (target === 'left-margin') {
          const rawMm = initialMargins.left + deltaMm;
          currentMm = Math.max(
            5,
            Math.min(paperWidthMm - initialMargins.right - 20, snapValueMm(rawMm, unit)),
          );
          guidePositionPx = containerRect.left + mmToPx(currentMm);
          onMarginChange({ ...initialMargins, left: currentMm });
        } else if (target === 'right-margin') {
          const rawMm = initialMargins.right - deltaMm;
          currentMm = Math.max(
            5,
            Math.min(paperWidthMm - initialMargins.left - 20, snapValueMm(rawMm, unit)),
          );
          guidePositionPx = containerRect.left + containerRect.width - mmToPx(currentMm);
          onMarginChange({ ...initialMargins, right: currentMm });
        } else if (target === 'first-line-indent') {
          const rawMm = initialIndents.firstLineIndent + deltaMm;
          currentMm = Math.max(-50, Math.min(100, snapValueMm(rawMm, unit)));
          guidePositionPx =
            containerRect.left +
            mmToPx(initialMargins.left + initialIndents.leftIndent + currentMm);
          onIndentChange({ ...initialIndents, firstLineIndent: currentMm });
        } else if (target === 'left-indent') {
          const rawMm = initialIndents.leftIndent + deltaMm;
          currentMm = Math.max(0, Math.min(120, snapValueMm(rawMm, unit)));
          guidePositionPx = containerRect.left + mmToPx(initialMargins.left + currentMm);
          onIndentChange({ ...initialIndents, leftIndent: currentMm });
        } else if (target === 'right-indent') {
          const rawMm = initialIndents.rightIndent - deltaMm;
          currentMm = Math.max(0, Math.min(120, snapValueMm(rawMm, unit)));
          guidePositionPx =
            containerRect.left + containerRect.width - mmToPx(initialMargins.right + currentMm);
          onIndentChange({ ...initialIndents, rightIndent: currentMm });
        }
      } else {
        const deltaPx = event.clientY - startClientY;
        const deltaMm = pxToMm(deltaPx);

        if (target === 'top-margin') {
          const rawMm = initialMargins.top + deltaMm;
          currentMm = Math.max(
            5,
            Math.min(paperHeightMm - initialMargins.bottom - 30, snapValueMm(rawMm, unit)),
          );
          guidePositionPx = containerRect.top + mmToPx(currentMm);
          onMarginChange({ ...initialMargins, top: currentMm });
        } else if (target === 'bottom-margin') {
          const rawMm = initialMargins.bottom - deltaMm;
          currentMm = Math.max(
            5,
            Math.min(paperHeightMm - initialMargins.top - 30, snapValueMm(rawMm, unit)),
          );
          guidePositionPx = containerRect.top + containerRect.height - mmToPx(currentMm);
          onMarginChange({ ...initialMargins, bottom: currentMm });
        }
      }

      setDragState({
        target,
        currentMm,
        guidePositionPx,
        orientation: isHorizontal ? 'vertical' : 'horizontal',
        tooltipText: formatUnitValue(currentMm, unit),
        tooltipClientPos: { x: event.clientX, y: event.clientY },
      });
    };

    const handlePointerUp = () => {
      activeDragRef.current = null;
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [paperWidthMm, paperHeightMm, onMarginChange, onIndentChange, unit]);

  return {
    dragState,
    startDrag,
    isDragging: dragState !== null,
  };
};
