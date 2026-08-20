import type { SlideElement } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@office/ui-kit';
import React, { useRef } from 'react';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface ElementSelectionOverlayProps {
  element: SlideElement;
  onStartResize: (e: React.PointerEvent, handle: ResizeHandle) => void;
  onStartRotate?: (e: React.PointerEvent) => void;
  onUpdateElement?: (patch: Partial<SlideElement>) => void;
  onDeleteElement?: () => void;
  onCenterElement?: (axis: 'horizontal' | 'vertical' | 'both') => void;
  onReplaceImage?: (dataUrl: string) => void;
}

export const ElementSelectionOverlay = ({
  element,
  onStartResize,
  onStartRotate,
  onUpdateElement,
  onDeleteElement,
  onCenterElement,
  onReplaceImage,
}: ElementSelectionOverlayProps) => {
  const { t } = useTranslation('slides');
  const replaceImgRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onReplaceImage) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onReplaceImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const cycleBorderRadius = () => {
    const current = element.borderRadius || 0;
    const next = current === 0 ? 12 : current === 12 ? 24 : current === 24 ? 9999 : 0;
    onUpdateElement?.({ borderRadius: next });
  };

  return (
    <TooltipProvider>
      {/* 1. Google Slides Floating Quick Action Bar for Images */}
      {element.type === 'image' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-11 left-0 z-40 flex items-center gap-0.5 rounded-lg border border-border bg-popover/95 p-1 shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
        >
          <input
            ref={replaceImgRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => replaceImgRef.current?.click()}
                  className="flex h-7 w-7 items-center justify-center rounded text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
                />
              }
            >
              <Icon name="image" size={13} />
            </TooltipTrigger>
            <TooltipContent side="top">{t('formatting.replaceImage')}</TooltipContent>
          </Tooltip>

          {/* Border Stroke Color & Width */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
                />
              }
            >
              <Icon name="edit" size={13} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onUpdateElement?.({ stroke: undefined, strokeWidth: 0 })}>
                {t('formatting.noBorder')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUpdateElement?.({ stroke: '#0f172a', strokeWidth: 2 })}>
                {t('formatting.borderBlack')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateElement?.({ stroke: '#1e40af', strokeWidth: 3 })}>
                {t('formatting.borderPrimary')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateElement?.({ stroke: '#dc2626', strokeWidth: 3 })}>
                {t('formatting.borderRed')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Border Radius Toggle / Crop */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={cycleBorderRadius}
                  className="flex h-7 w-7 items-center justify-center rounded text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
                />
              }
            >
              <Icon name="scissors" size={13} />
            </TooltipTrigger>
            <TooltipContent side="top">{t('formatting.borderRadius')}</TooltipContent>
          </Tooltip>

          {/* Center Element */}
          {onCenterElement && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => onCenterElement('both')}
                    className="flex h-7 w-7 items-center justify-center rounded text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
                  />
                }
              >
                <Icon name="align-center" size={13} />
              </TooltipTrigger>
              <TooltipContent side="top">{t('formatting.centerBoth')}</TooltipContent>
            </Tooltip>
          )}

          {/* Delete Element */}
          {onDeleteElement && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={onDeleteElement}
                    className="flex h-7 w-7 items-center justify-center rounded text-destructive hover:bg-destructive/10 transition-colors"
                  />
                }
              >
                <Icon name="trash-2" size={13} />
              </TooltipTrigger>
              <TooltipContent side="top">{t('formatting.delete')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      {/* 2. Google Slides Top Rotation Stem & Handle */}
      {onStartRotate && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <Tooltip>
            <TooltipTrigger
              render={
                <div
                  onPointerDown={onStartRotate}
                  className="flex h-5 w-5 cursor-grab items-center justify-center rounded-full border-2 border-[var(--o-kind-slides)] bg-white text-[var(--o-kind-slides)] shadow-md transition-transform hover:scale-110 active:cursor-grabbing"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                  </svg>
                </div>
              }
            />
            <TooltipContent side="top">{t('formatting.dragToRotate')}</TooltipContent>
          </Tooltip>
          <div className="h-2 w-0.5 bg-[var(--o-kind-slides)]" />
        </div>
      )}

      {/* 3. Four Corner Circular Handles (Google Slides Style) */}
      <div
        onPointerDown={(e) => onStartResize(e, 'nw')}
        className="absolute -top-1.5 -left-1.5 z-30 h-3 w-3 cursor-nwse-resize rounded-full border-2 border-[var(--o-kind-slides)] bg-white shadow-xs"
      />
      <div
        onPointerDown={(e) => onStartResize(e, 'ne')}
        className="absolute -top-1.5 -right-1.5 z-30 h-3 w-3 cursor-nesw-resize rounded-full border-2 border-[var(--o-kind-slides)] bg-white shadow-xs"
      />
      <div
        onPointerDown={(e) => onStartResize(e, 'se')}
        className="absolute -bottom-1.5 -right-1.5 z-30 h-3 w-3 cursor-nwse-resize rounded-full border-2 border-[var(--o-kind-slides)] bg-white shadow-xs"
      />
      <div
        onPointerDown={(e) => onStartResize(e, 'sw')}
        className="absolute -bottom-1.5 -left-1.5 z-30 h-3 w-3 cursor-nesw-resize rounded-full border-2 border-[var(--o-kind-slides)] bg-white shadow-xs"
      />

      {/* 4. Four Edge Pill Handles (Google Slides Style) */}
      <div
        onPointerDown={(e) => onStartResize(e, 'n')}
        className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 h-1.5 w-4 cursor-ns-resize rounded-full border border-[var(--o-kind-slides)] bg-[var(--o-kind-slides)] shadow-xs"
      />
      <div
        onPointerDown={(e) => onStartResize(e, 's')}
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-30 h-1.5 w-4 cursor-ns-resize rounded-full border border-[var(--o-kind-slides)] bg-[var(--o-kind-slides)] shadow-xs"
      />
      <div
        onPointerDown={(e) => onStartResize(e, 'w')}
        className="absolute top-1/2 -left-1 -translate-y-1/2 z-30 h-4 w-1.5 cursor-ew-resize rounded-full border border-[var(--o-kind-slides)] bg-[var(--o-kind-slides)] shadow-xs"
      />
      <div
        onPointerDown={(e) => onStartResize(e, 'e')}
        className="absolute top-1/2 -right-1 -translate-y-1/2 z-30 h-4 w-1.5 cursor-ew-resize rounded-full border border-[var(--o-kind-slides)] bg-[var(--o-kind-slides)] shadow-xs"
      />
    </TooltipProvider>
  );
};
