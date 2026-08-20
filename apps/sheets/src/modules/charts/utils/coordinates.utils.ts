import { DEFAULT_CHART_SIZE } from '../constants/charts.constants';
import type { ChartPosition } from '../types/charts.types';

export interface PixelBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const calculatePixelBounds = (
  position: ChartPosition,
  containerWidth = 1920,
  containerHeight = 1080,
): PixelBounds => {
  const width = Math.max(position.width || DEFAULT_CHART_SIZE.width, DEFAULT_CHART_SIZE.minWidth);
  const height = Math.max(
    position.height || DEFAULT_CHART_SIZE.height,
    DEFAULT_CHART_SIZE.minHeight,
  );

  // If pixel offsets are provided directly
  const left = Math.min(
    Math.max(position.offsetX || 40, 10),
    Math.max(containerWidth - width - 10, 10),
  );
  const top = Math.min(
    Math.max(position.offsetY || 40, 10),
    Math.max(containerHeight - height - 10, 10),
  );

  return {
    left,
    top,
    width,
    height,
  };
};

export const applyDragDelta = (
  initialBounds: PixelBounds,
  deltaX: number,
  deltaY: number,
  containerWidth: number,
  containerHeight: number,
): PixelBounds => {
  const left = Math.max(
    10,
    Math.min(initialBounds.left + deltaX, containerWidth - initialBounds.width - 10),
  );
  const top = Math.max(
    10,
    Math.min(initialBounds.top + deltaY, containerHeight - initialBounds.height - 10),
  );

  return {
    left,
    top,
    width: initialBounds.width,
    height: initialBounds.height,
  };
};

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const applyResizeDelta = (
  initialBounds: PixelBounds,
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
  minWidth = DEFAULT_CHART_SIZE.minWidth,
  minHeight = DEFAULT_CHART_SIZE.minHeight,
): PixelBounds => {
  let { left, top, width, height } = initialBounds;

  if (direction.includes('e')) {
    width = Math.max(initialBounds.width + deltaX, minWidth);
  }
  if (direction.includes('s')) {
    height = Math.max(initialBounds.height + deltaY, minHeight);
  }
  if (direction.includes('w')) {
    const newWidth = Math.max(initialBounds.width - deltaX, minWidth);
    left = initialBounds.left + (initialBounds.width - newWidth);
    width = newWidth;
  }
  if (direction.includes('n')) {
    const newHeight = Math.max(initialBounds.height - deltaY, minHeight);
    top = initialBounds.top + (initialBounds.height - newHeight);
    height = newHeight;
  }

  return { left, top, width, height };
};
