import { useTranslation } from '@office/i18n';
import { Icon, ToolbarButton } from '@office/ui-kit';
import * as echarts from 'echarts';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChartPosition, ChartSpec, ParsedDataMatrix } from '../types/charts.types';
import {
  applyDragDelta,
  applyResizeDelta,
  calculatePixelBounds,
  type PixelBounds,
  type ResizeDirection,
} from '../utils/coordinates.utils';
import { ChartRenderer } from './ChartRenderer';

export interface FloatingChartContainerProps {
  spec: ChartSpec;
  data: ParsedDataMatrix;
  isSelected: boolean;
  isDark?: boolean;
  containerBounds?: { width: number; height: number };
  onSelect: () => void;
  onDoubleClick: () => void;
  onUpdatePosition: (newPos: ChartPosition) => void;
  onDelete: () => void;
}

export const FloatingChartContainer = ({
  spec,
  data,
  isSelected,
  isDark = false,
  containerBounds = { width: 1920, height: 1080 },
  onSelect,
  onDoubleClick,
  onUpdatePosition,
  onDelete,
}: FloatingChartContainerProps) => {
  const { t } = useTranslation('sheets');
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [bounds, setBounds] = useState<PixelBounds>(() =>
    calculatePixelBounds(spec.position, containerBounds.width, containerBounds.height)
  );

  // Sync internal bounds when spec.position changes externally
  useEffect(() => {
    setBounds(calculatePixelBounds(spec.position, containerBounds.width, containerBounds.height));
  }, [spec.position, containerBounds.width, containerBounds.height]);

  // Dragging state
  const dragStartRef = useRef<{ x: number; y: number; initialBounds: PixelBounds } | null>(null);
  // Resizing state
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    direction: ResizeDirection;
    initialBounds: PixelBounds;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onSelect();
    },
    [onSelect]
  );

  const handleHeaderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onSelect();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initialBounds: { ...bounds },
      };
    },
    [bounds, onSelect]
  );

  const handleHeaderPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const newBounds = applyDragDelta(
        dragStartRef.current.initialBounds,
        deltaX,
        deltaY,
        containerBounds.width,
        containerBounds.height
      );
      setBounds(newBounds);
    },
    [containerBounds.width, containerBounds.height]
  );

  const handleHeaderPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragStartRef.current) {
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        dragStartRef.current = null;
        onUpdatePosition({
          ...spec.position,
          offsetX: bounds.left,
          offsetY: bounds.top,
          width: bounds.width,
          height: bounds.height,
        });
      }
    },
    [bounds, onUpdatePosition, spec.position]
  );

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, direction: ResizeDirection) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        direction,
        initialBounds: { ...bounds },
      };
    },
    [bounds]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeStartRef.current) return;
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      const newBounds = applyResizeDelta(
        resizeStartRef.current.initialBounds,
        resizeStartRef.current.direction,
        deltaX,
        deltaY
      );
      setBounds(newBounds);
    },
    []
  );

  const handleResizePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (resizeStartRef.current) {
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        resizeStartRef.current = null;
        onUpdatePosition({
          ...spec.position,
          offsetX: bounds.left,
          offsetY: bounds.top,
          width: bounds.width,
          height: bounds.height,
        });
      }
    },
    [bounds, onUpdatePosition, spec.position]
  );

  const handleExportPng = useCallback(() => {
    if (!chartInstanceRef.current) return;
    const url = chartInstanceRef.current.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
    });
    const link = document.createElement('a');
    link.download = `${spec.title || 'bieu-do'}.png`;
    link.href = url;
    link.click();
  }, [isDark, spec.title]);

  const resizeHandles: { dir: ResizeDirection; className: string }[] = [
    { dir: 'nw', className: '-top-1.5 -left-1.5 cursor-nwse-resize' },
    { dir: 'n', className: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' },
    { dir: 'ne', className: '-top-1.5 -right-1.5 cursor-nesw-resize' },
    { dir: 'e', className: 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize' },
    { dir: 'se', className: '-bottom-1.5 -right-1.5 cursor-nwse-resize' },
    { dir: 's', className: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' },
    { dir: 'sw', className: '-bottom-1.5 -left-1.5 cursor-nesw-resize' },
    { dir: 'w', className: 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize' },
  ];

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onDoubleClick={onDoubleClick}
      style={{
        position: 'absolute',
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
        zIndex: isSelected ? 30 : 20,
      }}
      className={`group flex flex-col rounded-lg border bg-card text-card-foreground shadow-md transition-shadow select-none ${
        isSelected
          ? 'border-primary ring-2 ring-primary/40 shadow-lg'
          : 'border-border/80 hover:border-primary/50'
      }`}
    >
      {/* Chart Top Drag Handle & Toolbar */}
      <div
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerUp}
        className="flex h-7 shrink-0 cursor-move items-center justify-between border-b border-border/40 bg-muted/40 px-2 text-xs text-muted-foreground transition-colors hover:bg-muted/70"
      >
        <div className="flex items-center gap-1 truncate font-medium">
          <Icon name="grid" size={13} className="opacity-70" />
          <span className="truncate">{spec.title || t('chart.fallbackTitle')}</span>
        </div>

        <div className="flex items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
          <ToolbarButton
            label={t('chart.floating.edit')}
            onClick={onDoubleClick}
            className="h-5 w-5 p-0"
          >
            <Icon name="sliders" size={12} />
          </ToolbarButton>

          <ToolbarButton
            label={t('chart.floating.exportPng')}
            onClick={handleExportPng}
            className="h-5 w-5 p-0"
          >
            <Icon name="download" size={12} />
          </ToolbarButton>

          <ToolbarButton
            label={t('chart.floating.delete')}
            onClick={onDelete}
            className="h-5 w-5 p-0 text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
          >
            <Icon name="trash-2" size={12} />
          </ToolbarButton>
        </div>
      </div>

      {/* Render Chart Content */}
      <div className="relative min-h-0 flex-1 p-1">
        <ChartRenderer
          spec={spec}
          data={data}
          isDark={isDark}
          onInstanceReady={(inst) => {
            chartInstanceRef.current = inst;
          }}
        />
      </div>

      {/* 8 Resize Handles when selected */}
      {isSelected &&
        resizeHandles.map((handle) => (
          <div
            key={handle.dir}
            onPointerDown={(e) => handleResizePointerDown(e, handle.dir)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className={`absolute h-3 w-3 rounded-full border-2 border-primary bg-background shadow-sm ${handle.className}`}
          />
        ))}
    </div>
  );
};
