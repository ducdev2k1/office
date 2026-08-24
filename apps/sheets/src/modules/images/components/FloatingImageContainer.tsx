import type { FloatingImageSpec, ImagePosition } from '@/modules/images/types/images.types';
import {
  applyDragDelta,
  applyResizeDelta,
  type ResizeDirection,
} from '@/modules/charts/utils/coordinates.utils';
import { useTranslation } from '@office/i18n';
import { Button, Icon, cn } from '@office/ui-kit';
import { useCallback, useRef, type MouseEvent } from 'react';

interface FloatingImageContainerProps {
  spec: FloatingImageSpec;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onUpdatePosition?: (id: string, newPos: ImagePosition) => void;
  onDelete?: (id: string) => void;
}

export const FloatingImageContainer = ({
  spec,
  isSelected = false,
  onSelect,
  onUpdatePosition,
  onDelete,
}: FloatingImageContainerProps) => {
  const { t } = useTranslation('sheets');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDownDrag = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onSelect?.(spec.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const initialPos = {
        left: spec.position.offsetX,
        top: spec.position.offsetY,
        width: spec.position.width,
        height: spec.position.height,
      };

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        const nextBounds = applyDragDelta(initialPos, deltaX, deltaY, 4000, 4000);
        onUpdatePosition?.(spec.id, {
          ...spec.position,
          offsetX: nextBounds.left,
          offsetY: nextBounds.top,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [spec.id, spec.position, onSelect, onUpdatePosition],
  );

  const handleMouseDownResize = useCallback(
    (e: MouseEvent<HTMLDivElement>, direction: ResizeDirection) => {
      e.stopPropagation();
      onSelect?.(spec.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const initialPos = {
        left: spec.position.offsetX,
        top: spec.position.offsetY,
        width: spec.position.width,
        height: spec.position.height,
      };

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        const nextBounds = applyResizeDelta(initialPos, direction, deltaX, deltaY, 50, 50);
        onUpdatePosition?.(spec.id, {
          ...spec.position,
          offsetX: nextBounds.left,
          offsetY: nextBounds.top,
          width: nextBounds.width,
          height: nextBounds.height,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [spec.id, spec.position, onSelect, onUpdatePosition],
  );

  const RESIZE_HANDLES: ResizeDirection[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(spec.id);
      }}
      className={cn(
        'absolute group select-none transition-shadow z-20 pointer-events-auto rounded-sm overflow-hidden bg-background shadow-md',
        isSelected ? 'ring-2 ring-primary shadow-xl' : 'hover:ring-1 hover:ring-primary/50',
      )}
      style={{
        left: `${spec.position.offsetX}px`,
        top: `${spec.position.offsetY}px`,
        width: `${spec.position.width}px`,
        height: `${spec.position.height}px`,
      }}
    >
      {/* Drag Handle Top Bar */}
      <div
        onMouseDown={handleMouseDownDrag}
        className={cn(
          'absolute top-0 left-0 right-0 h-6 bg-black/40 hover:bg-black/60 transition-opacity flex items-center justify-between px-2 cursor-grab active:cursor-grabbing z-30',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <span className="text-[10px] font-medium text-white truncate">{spec.title || 'Image'}</span>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-4.5 text-white/80 hover:text-white hover:bg-destructive/80"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(spec.id);
            }}
            aria-label={t('images.deleteImage')}
          >
            <Icon name="trash" size={12} />
          </Button>
        )}
      </div>

      {/* Image Content */}
      <img
        src={spec.url}
        alt={spec.title || 'Floating Sheet Graphic'}
        className="size-full object-contain pointer-events-none"
      />

      {/* 8 Resize Control Points */}
      {isSelected &&
        RESIZE_HANDLES.map((dir) => {
          let posClass = '';
          if (dir === 'nw') posClass = 'top-[-4px] left-[-4px] cursor-nwse-resize';
          if (dir === 'n') posClass = 'top-[-4px] left-1/2 -translate-x-1/2 cursor-ns-resize';
          if (dir === 'ne') posClass = 'top-[-4px] right-[-4px] cursor-nesw-resize';
          if (dir === 'e') posClass = 'top-1/2 -translate-y-1/2 right-[-4px] cursor-ew-resize';
          if (dir === 'se') posClass = 'bottom-[-4px] right-[-4px] cursor-nwse-resize';
          if (dir === 's') posClass = 'bottom-[-4px] left-1/2 -translate-x-1/2 cursor-ns-resize';
          if (dir === 'sw') posClass = 'bottom-[-4px] left-[-4px] cursor-nesw-resize';
          if (dir === 'w') posClass = 'top-1/2 -translate-y-1/2 left-[-4px] cursor-ew-resize';

          return (
            <div
              key={dir}
              onMouseDown={(e) => handleMouseDownResize(e, dir)}
              className={cn(
                'absolute size-2.5 bg-background border-2 border-primary rounded-xs z-40',
                posClass,
              )}
            />
          );
        })}
    </div>
  );
};
