import type { SlideElement } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import { Icon, Separator } from '@office/ui-kit';
import React, { useEffect, useRef } from 'react';

interface SlideContextMenuProps {
  x: number;
  y: number;
  targetElement?: SlideElement | null;
  canPaste: boolean;
  canDeleteSlide: boolean;
  onClose: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCenter: (axis: 'horizontal' | 'vertical' | 'both') => void;
  onRotate: (deltaDeg: number) => void;
  onReplaceImage?: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAddSlide: () => void;
  onDuplicateSlide: () => void;
  onDeleteSlide: () => void;
  onPresent: () => void;
}

export const SlideContextMenu = ({
  x,
  y,
  targetElement,
  canPaste,
  canDeleteSlide,
  onClose,
  onCut,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onCenter,
  onRotate,
  onReplaceImage,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onPresent,
}: SlideContextMenuProps) => {
  const { t } = useTranslation('slides');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust menu position so it doesn't overflow viewport boundaries
  const menuWidth = 220;
  const menuHeight = targetElement ? 340 : 200;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 16);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 16);

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 min-w-[210px] rounded-lg border border-border bg-popover/95 p-1.5 text-xs text-popover-foreground shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
    >
      {targetElement ? (
        <>
          <button
            type="button"
            onClick={() => { onCut(); onClose(); }}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-2">
              <Icon name="scissors" size={13} />
              <span>{t('contextMenu.cut')}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Ctrl+X</span>
          </button>

          <button
            type="button"
            onClick={() => { onCopy(); onClose(); }}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-2">
              <Icon name="copy" size={13} />
              <span>{t('contextMenu.copy')}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Ctrl+C</span>
          </button>

          {canPaste && (
            <button
              type="button"
              onClick={() => { onPaste(); onClose(); }}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-2">
                <Icon name="clipboard" size={13} />
                <span>{t('contextMenu.paste')}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Ctrl+V</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => { onDuplicate(); onClose(); }}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-2">
              <Icon name="copy" size={13} />
              <span>{t('contextMenu.duplicate')}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Ctrl+D</span>
          </button>

          <button
            type="button"
            onClick={() => { onDelete(); onClose(); }}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-destructive hover:bg-destructive/10"
          >
            <div className="flex items-center gap-2">
              <Icon name="trash-2" size={13} />
              <span>{t('contextMenu.delete')}</span>
            </div>
            <span className="text-[10px]">Delete</span>
          </button>

          <Separator className="my-1" />

          {targetElement.type === 'image' && onReplaceImage && (
            <button
              type="button"
              onClick={() => { onReplaceImage(); onClose(); }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
            >
              <Icon name="image" size={13} />
              <span>{t('contextMenu.replaceImage')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => { onRotate(90); onClose(); }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="rotate-cw" size={13} />
            <span>{t('contextMenu.rotate90')}</span>
          </button>

          <button
            type="button"
            onClick={() => { onCenter('horizontal'); onClose(); }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="align-center" size={13} />
            <span>{t('formatting.centerHorizontally')}</span>
          </button>

          <button
            type="button"
            onClick={() => { onCenter('vertical'); onClose(); }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="align-center" size={13} />
            <span>{t('formatting.centerVertically')}</span>
          </button>

          <Separator className="my-1" />

          <button
            type="button"
            onClick={() => { onBringToFront(); onClose(); }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="layers" size={13} />
            <span>{t('contextMenu.bringToFront')}</span>
          </button>

          <button
            type="button"
            onClick={() => { onSendToBack(); onClose(); }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="layers" size={13} />
            <span>{t('contextMenu.sendToBack')}</span>
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => { onAddSlide(); onClose(); }}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-2">
              <Icon name="plus" size={13} />
              <span>{t('contextMenu.newSlide')}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Ctrl+M</span>
          </button>

          <button
            type="button"
            onClick={() => { onDuplicateSlide(); onClose(); }}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-2">
              <Icon name="copy" size={13} />
              <span>{t('contextMenu.duplicateSlide')}</span>
            </div>
          </button>

          {canPaste && (
            <button
              type="button"
              onClick={() => { onPaste(); onClose(); }}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-2">
                <Icon name="clipboard" size={13} />
                <span>{t('contextMenu.paste')}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Ctrl+V</span>
            </button>
          )}

          {canDeleteSlide && (
            <button
              type="button"
              onClick={() => { onDeleteSlide(); onClose(); }}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-destructive hover:bg-destructive/10"
            >
              <div className="flex items-center gap-2">
                <Icon name="trash-2" size={13} />
                <span>{t('contextMenu.deleteSlide')}</span>
              </div>
            </button>
          )}

          <Separator className="my-1" />

          <button
            type="button"
            onClick={() => { onPresent(); onClose(); }}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 font-medium text-[var(--o-kind-slides)] hover:bg-accent"
          >
            <div className="flex items-center gap-2">
              <Icon name="play" size={13} />
              <span>{t('contextMenu.present')}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">F5</span>
          </button>
        </>
      )}
    </div>
  );
};
