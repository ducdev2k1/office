import type { SlideElement, SlideItem } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import React, { useState } from 'react';

interface SlideViewerProps {
  slide?: SlideItem;
  zoom: number;
  onUpdateElement?: (elementId: string, content: string) => void;
}

export const SlideViewer = ({ slide, zoom, onUpdateElement }: SlideViewerProps) => {
  const { t } = useTranslation('slides');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!slide) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-sm text-muted-foreground">
        {t('editor.noSlides')}
      </div>
    );
  }

  const renderElement = (el: SlideElement) => {
    const isEditing = editingId === el.id;

    switch (el.type) {
      case 'text':
        return (
          <div
            key={el.id}
            onDoubleClick={() => setEditingId(el.id)}
            style={{
              position: 'absolute',
              left: `${(el.x / 960) * 100}%`,
              top: `${(el.y / 540) * 100}%`,
              width: `${(el.width / 960) * 100}%`,
              minHeight: `${(el.height / 540) * 100}%`,
              fontSize: el.fontSize ? `${(el.fontSize / 16) * 1}rem` : '1.125rem',
              color: el.color || 'inherit',
              textAlign: el.align || 'left',
              whiteSpace: 'pre-wrap',
            }}
            className={`cursor-pointer select-none rounded p-1 leading-relaxed transition-all ${
              isEditing ? 'outline-2 outline-dashed outline-[var(--o-kind-slides)]' : 'hover:bg-accent/10'
            }`}
          >
            {isEditing ? (
              <textarea
                autoFocus
                defaultValue={el.content}
                onBlur={(e) => {
                  setEditingId(null);
                  onUpdateElement?.(el.id, e.target.value);
                }}
                className="w-full resize-none border-none bg-transparent p-0 outline-none"
                style={{ fontSize: 'inherit', color: 'inherit', textAlign: 'inherit' }}
              />
            ) : (
              el.content || 'Nhấp đúp để nhập văn bản'
            )}
          </div>
        );

      case 'shape':
        return (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: `${(el.x / 960) * 100}%`,
              top: `${(el.y / 540) * 100}%`,
              width: `${(el.width / 960) * 100}%`,
              height: `${(el.height / 540) * 100}%`,
              backgroundColor: el.fill || '#e2e8f0',
              border: el.stroke ? `2px solid ${el.stroke}` : 'none',
            }}
            className="rounded shadow-sm"
          />
        );

      case 'image':
        return (
          <img
            key={el.id}
            src={el.url}
            alt={el.content || 'Slide image'}
            style={{
              position: 'absolute',
              left: `${(el.x / 960) * 100}%`,
              top: `${(el.y / 540) * 100}%`,
              width: `${(el.width / 960) * 100}%`,
              height: `${(el.height / 540) * 100}%`,
              objectFit: 'contain',
            }}
            className="rounded"
          />
        );

      default:
        return null;
    }
  };

  const scale = zoom / 100;

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-auto bg-workspace p-8">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          className="relative aspect-[16/9] w-[960px] max-w-[960px] overflow-hidden rounded-lg border border-border bg-white shadow-xl dark:bg-slate-900"
          style={{ backgroundColor: slide.background || undefined }}
        >
          {slide.elements.map(renderElement)}
        </div>
      </div>
    </main>
  );
};
