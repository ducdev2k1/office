import { useMemo, useRef } from 'react';
import { useTranslation } from '@office/i18n';
import { generateHorizontalTicks, mmToPx, type RulerUnit } from './ruler.utils';
import type { useRuler } from './useRuler';

interface HorizontalRulerProps {
  paperWidthMm: number;
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
  unit: RulerUnit;
  onToggleUnit?: () => void;
  rulerHook: ReturnType<typeof useRuler>;
}

export const HorizontalRuler = ({
  paperWidthMm,
  margins,
  indents,
  unit,
  onToggleUnit,
  rulerHook,
}: HorizontalRulerProps) => {
  const { t } = useTranslation('docs');
  const containerRef = useRef<HTMLDivElement>(null);
  const paperWidthPx = mmToPx(paperWidthMm);
  const leftMarginPx = mmToPx(margins.left);
  const rightMarginPx = mmToPx(margins.right);
  const usableWidthPx = paperWidthPx - leftMarginPx - rightMarginPx;

  const firstLineIndentPx = mmToPx(indents.firstLineIndent);
  const leftIndentPx = mmToPx(indents.leftIndent);
  const rightIndentPx = mmToPx(indents.rightIndent);

  const ticks = useMemo(() => {
    return generateHorizontalTicks(paperWidthMm, unit);
  }, [paperWidthMm, unit]);

  const { startDrag } = rulerHook;

  return (
    <div
      ref={containerRef}
      className="relative h-4 select-none border-b border-border bg-muted/30 text-[9px] font-mono text-muted-foreground overflow-hidden"
      style={{ width: `${paperWidthPx}px`, minWidth: `${paperWidthPx}px` }}
      onDoubleClick={onToggleUnit}
      title={t('ruler.toggleUnitTip')}
    >
      {/* Usable content area */}
      <div
        className="absolute top-0 bottom-0 bg-background/80 transition-all duration-75"
        style={{
          left: `${leftMarginPx}px`,
          width: `${usableWidthPx}px`,
        }}
      />

      {/* Left Margin Shaded Area */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-muted/60"
        style={{ width: `${leftMarginPx}px` }}
      />

      {/* Right Margin Shaded Area */}
      <div
        className="absolute top-0 bottom-0 right-0 bg-muted/60"
        style={{ width: `${rightMarginPx}px` }}
      />

      {/* Ticks and Numbers */}
      <svg
        className="absolute inset-0 size-full pointer-events-none"
        width={paperWidthPx}
        height={16}
      >
        {ticks.map((tick, i) => {
          const isMajor = tick.heightRatio === 1.0;
          const tickHeight = isMajor ? 7 : tick.heightRatio > 0.5 ? 5 : 3;
          return (
            <g key={i} transform={`translate(${tick.positionPx}, 0)`}>
              <line
                x1={0}
                y1={16}
                x2={0}
                y2={16 - tickHeight}
                stroke="currentColor"
                strokeWidth={isMajor ? 1 : 0.75}
                opacity={isMajor ? 0.7 : 0.4}
              />
              {tick.label && (
                <text
                  x={2}
                  y={8}
                  fill="currentColor"
                  fontSize="8.5"
                  textAnchor="start"
                  dominantBaseline="middle"
                  opacity={0.8}
                >
                  {tick.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Left Margin Drag Handle */}
      <div
        className="absolute top-0 bottom-0 w-2 -ml-1 cursor-ew-resize z-10 group"
        style={{ left: `${leftMarginPx}px` }}
        onPointerDown={(e) => {
          if (containerRef.current) startDrag(e, 'left-margin', containerRef.current);
        }}
        title={`${t('ruler.leftMargin')}: ${(margins.left / (unit === 'cm' ? 10 : 25.4)).toFixed(1)}${unit}`}
      >
        <div className="size-full group-hover:bg-primary/30 transition-colors" />
      </div>

      {/* Right Margin Drag Handle */}
      <div
        className="absolute top-0 bottom-0 w-2 -ml-1 cursor-ew-resize z-10 group"
        style={{ left: `${paperWidthPx - rightMarginPx}px` }}
        onPointerDown={(e) => {
          if (containerRef.current) startDrag(e, 'right-margin', containerRef.current);
        }}
        title={`${t('ruler.rightMargin')}: ${(margins.right / (unit === 'cm' ? 10 : 25.4)).toFixed(1)}${unit}`}
      >
        <div className="size-full group-hover:bg-primary/30 transition-colors" />
      </div>

      {/* Markers: First Line Indent (Top Rectangle) */}
      <div
        className="absolute top-0 z-20 cursor-ew-resize -translate-x-1/2 group"
        style={{
          left: `${leftMarginPx + leftIndentPx + firstLineIndentPx}px`,
        }}
        onPointerDown={(e) => {
          if (containerRef.current) startDrag(e, 'first-line-indent', containerRef.current);
        }}
        title={t('ruler.firstLineIndent')}
      >
        <div className="w-2.5 h-1 bg-primary rounded-t-sm shadow-sm group-hover:brightness-110" />
      </div>

      {/* Markers: Left Indent (Bottom Triangle) */}
      <div
        className="absolute top-[4px] z-20 cursor-ew-resize -translate-x-1/2 group"
        style={{
          left: `${leftMarginPx + leftIndentPx}px`,
        }}
        onPointerDown={(e) => {
          if (containerRef.current) startDrag(e, 'left-indent', containerRef.current);
        }}
        title={t('ruler.leftIndent')}
      >
        <div
          className="w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-t-[7px] border-t-primary shadow-sm group-hover:brightness-110"
        />
      </div>

      {/* Markers: Right Indent (Bottom Triangle at right) */}
      <div
        className="absolute top-[4px] z-20 cursor-ew-resize -translate-x-1/2 group"
        style={{
          left: `${paperWidthPx - rightMarginPx - rightIndentPx}px`,
        }}
        onPointerDown={(e) => {
          if (containerRef.current) startDrag(e, 'right-indent', containerRef.current);
        }}
        title={t('ruler.rightIndent')}
      >
        <div
          className="w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-t-[7px] border-t-primary shadow-sm group-hover:brightness-110"
        />
      </div>
    </div>
  );
};
