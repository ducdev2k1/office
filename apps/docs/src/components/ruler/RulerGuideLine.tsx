import type { DragState } from './useRuler';

interface RulerGuideLineProps {
  dragState: DragState | null;
}

export const RulerGuideLine = ({ dragState }: RulerGuideLineProps) => {
  if (!dragState) return null;

  const isVerticalLine = dragState.orientation === 'vertical';

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* Guideline */}
      <div
        className="absolute bg-primary/70 shadow-sm"
        style={{
          ...(isVerticalLine
            ? {
                left: `${dragState.guidePositionPx}px`,
                top: 0,
                bottom: 0,
                width: '1px',
                borderLeft: '1px dashed hsl(var(--primary))',
                backgroundColor: 'transparent',
              }
            : {
                top: `${dragState.guidePositionPx}px`,
                left: 0,
                right: 0,
                height: '1px',
                borderTop: '1px dashed hsl(var(--primary))',
                backgroundColor: 'transparent',
              }),
        }}
      />

      {/* Floating Tooltip */}
      <div
        className="absolute px-2 py-0.5 rounded bg-popover text-popover-foreground border border-border shadow-md text-[11px] font-mono tabular-nums select-none transform -translate-x-1/2 -translate-y-full -mt-2 pointer-events-none"
        style={{
          left: `${dragState.tooltipClientPos.x}px`,
          top: `${dragState.tooltipClientPos.y}px`,
        }}
      >
        {dragState.tooltipText}
      </div>
    </div>
  );
};
