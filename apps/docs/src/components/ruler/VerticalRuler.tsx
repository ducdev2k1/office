import { useMemo, useRef } from 'react';
import { useTranslation } from '@office/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@office/ui-kit';
import { generateVerticalTicks, mmToPx, type RulerUnit } from './ruler.utils';
import type { useRuler } from './useRuler';

interface VerticalRulerProps {
  paperHeightMm: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  unit: RulerUnit;
  rulerHook: ReturnType<typeof useRuler>;
  scrollTop?: number;
}

export const VerticalRuler = ({
  paperHeightMm,
  margins,
  unit,
  rulerHook,
  scrollTop = 0,
}: VerticalRulerProps) => {
  const { t } = useTranslation('docs');
  const containerRef = useRef<HTMLDivElement>(null);
  const paperHeightPx = mmToPx(paperHeightMm);
  const topMarginPx = mmToPx(margins.top);
  const bottomMarginPx = mmToPx(margins.bottom);
  const usableHeightPx = paperHeightPx - topMarginPx - bottomMarginPx;

  const ticks = useMemo(() => {
    return generateVerticalTicks(paperHeightMm, unit);
  }, [paperHeightMm, unit]);

  const { startDrag } = rulerHook;

  return (
    <div
      ref={containerRef}
      className="ruler-vertical relative w-4 h-full select-none border-r border-border bg-muted/40 text-[8.5px] font-mono text-muted-foreground overflow-hidden shrink-0 shadow-sm z-20"
    >
      {/* Scrollable inner track aligned with paper top (24px initial top padding) */}
      <div
        className="absolute left-0 right-0 transition-transform duration-75 ease-out"
        style={{
          top: 0,
          transform: `translateY(${24 - scrollTop}px)`,
          height: `${paperHeightPx}px`,
        }}
      >
        {/* Usable content area */}
        <div
          className="absolute left-0 right-0 bg-background/80 transition-all duration-75"
          style={{
            top: `${topMarginPx}px`,
            height: `${usableHeightPx}px`,
          }}
        />

        {/* Top Margin Shaded Area */}
        <div
          className="absolute top-0 left-0 right-0 bg-muted/70"
          style={{ height: `${topMarginPx}px` }}
        />

        {/* Bottom Margin Shaded Area */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-muted/70"
          style={{ height: `${bottomMarginPx}px` }}
        />

        {/* Ticks and Numbers */}
        <svg
          className="absolute inset-0 size-full pointer-events-none"
          width={16}
          height={paperHeightPx}
        >
          {ticks.map((tick, i) => {
            const isMajor = tick.heightRatio === 1.0;
            const tickWidth = isMajor ? 7 : tick.heightRatio > 0.5 ? 5 : 3;
            return (
              <g key={i} transform={`translate(0, ${tick.positionPx})`}>
                <line
                  x1={16}
                  y1={0}
                  x2={16 - tickWidth}
                  y2={0}
                  stroke="currentColor"
                  strokeWidth={isMajor ? 1 : 0.75}
                  opacity={isMajor ? 0.7 : 0.4}
                />
                {tick.label && (
                  <text
                    x={3}
                    y={6}
                    fill="currentColor"
                    fontSize="8"
                    textAnchor="start"
                    dominantBaseline="hanging"
                    opacity={0.8}
                  >
                    {tick.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Top Margin Drag Handle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <div
                className="absolute left-0 right-0 h-2 -mt-1 cursor-ns-resize z-10 group"
                style={{ top: `${topMarginPx}px` }}
                onPointerDown={(e) => {
                  if (containerRef.current) startDrag(e, 'top-margin', containerRef.current);
                }}
                aria-label={`${t('ruler.topMargin')}: ${(margins.top / (unit === 'cm' ? 10 : 25.4)).toFixed(1)}${unit}`}
              >
                <div className="size-full group-hover:bg-primary/30 transition-colors" />
              </div>
            }
          />
          <TooltipContent side="right">
            {`${t('ruler.topMargin')}: ${(margins.top / (unit === 'cm' ? 10 : 25.4)).toFixed(1)}${unit}`}
          </TooltipContent>
        </Tooltip>

        {/* Bottom Margin Drag Handle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <div
                className="absolute left-0 right-0 h-2 -mt-1 cursor-ns-resize z-10 group"
                style={{ top: `${paperHeightPx - bottomMarginPx}px` }}
                onPointerDown={(e) => {
                  if (containerRef.current) startDrag(e, 'bottom-margin', containerRef.current);
                }}
                aria-label={`${t('ruler.bottomMargin')}: ${(margins.bottom / (unit === 'cm' ? 10 : 25.4)).toFixed(1)}${unit}`}
              >
                <div className="size-full group-hover:bg-primary/30 transition-colors" />
              </div>
            }
          />
          <TooltipContent side="right">
            {`${t('ruler.bottomMargin')}: ${(margins.bottom / (unit === 'cm' ? 10 : 25.4)).toFixed(1)}${unit}`}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
