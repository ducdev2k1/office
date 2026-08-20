import type { SlideDeckData, SlideItem } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@office/ui-kit';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SlideshowModalProps {
  deck: SlideDeckData;
  initialSlideIndex?: number;
  onClose: () => void;
}

export const SlideshowModal = ({
  deck,
  initialSlideIndex = 0,
  onClose,
}: SlideshowModalProps) => {
  const { t } = useTranslation('slides');
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isLaser, setIsLaser] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [isBlackout, setIsBlackout] = useState(false);
  const [isWhiteout, setIsWhiteout] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const autoPlayIntervalRef = useRef<number | null>(null);

  const slides = deck.slides;
  const totalSlides = slides.length;
  const currentSlide: SlideItem | undefined = slides[currentIndex];

  useEffect(() => {
    const el = containerRef.current;
    if (el && !document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) onClose();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [onClose]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setShowControls(true);
    setLaserPos({ x: e.clientX, y: e.clientY });

    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2500);
  }, []);

  const goToNext = useCallback(() => {
    setIsBlackout(false);
    setIsWhiteout(false);
    setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setIsBlackout(false);
    setIsWhiteout(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToSlide = useCallback((index: number) => {
    setIsBlackout(false);
    setIsWhiteout(false);
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isBlackout || isWhiteout) {
          setIsBlackout(false);
          setIsWhiteout(false);
          return;
        }
        onClose();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown' || e.key === 'n') {
        e.preventDefault();
        goToNext();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Backspace' || e.key === 'p') {
        e.preventDefault();
        goToPrev();
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        goToSlide(totalSlides - 1);
        return;
      }

      if (e.key.toLowerCase() === 'b' || e.key === '.') {
        e.preventDefault();
        setIsBlackout((prev) => !prev);
        setIsWhiteout(false);
        return;
      }

      if (e.key.toLowerCase() === 'w' || e.key === ',') {
        e.preventDefault();
        setIsWhiteout((prev) => !prev);
        setIsBlackout(false);
        return;
      }

      if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLaser((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, goToSlide, isBlackout, isWhiteout, onClose, totalSlides]);

  useEffect(() => {
    if (isAutoPlay) {
      autoPlayIntervalRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
      }, 4000);
    } else if (autoPlayIntervalRef.current) {
      window.clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    return () => {
      if (autoPlayIntervalRef.current) window.clearInterval(autoPlayIntervalRef.current);
    };
  }, [isAutoPlay, totalSlides]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black select-none ${
        isLaser ? 'cursor-none' : ''
      }`}
    >
      {isBlackout && (
        <div onClick={() => setIsBlackout(false)} className="absolute inset-0 z-40 flex items-center justify-center bg-black text-xs text-white/30">
          Nhấn phím B để tiếp tục trình chiếu
        </div>
      )}

      {isWhiteout && (
        <div onClick={() => setIsWhiteout(false)} className="absolute inset-0 z-40 flex items-center justify-center bg-white text-xs text-black/30">
          Nhấn phím W để tiếp tục trình chiếu
        </div>
      )}

      {isLaser && !isBlackout && !isWhiteout && (
        <div
          className="pointer-events-none fixed z-50 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444,0_0_20px_#ef4444]"
          style={{ left: laserPos.x, top: laserPos.y }}
        />
      )}

      {/* Slide 16:9 Canvas with CSS 3D/2D Transition Animation */}
      {currentSlide && (
        <div
          key={`${currentSlide.id}-${currentIndex}`}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('.slideshow-controls')) return;
            goToNext();
          }}
          className={`relative flex aspect-[16/9] max-h-screen max-w-full w-auto h-auto items-center justify-center overflow-hidden shadow-2xl slide-transition-${currentSlide.transition || 'fade'}`}
          style={{
            backgroundColor: currentSlide.background || '#ffffff',
            aspectRatio: '16/9',
            width: 'min(100vw, 177.78vh)',
            height: 'min(56.25vw, 100vh)',
          }}
        >
          {currentSlide.elements.map((el) => {
            const leftPercent = (el.x / 960) * 100;
            const topPercent = (el.y / 540) * 100;
            const widthPercent = (el.width / 960) * 100;
            const heightPercent = (el.height / 540) * 100;
            const rot = el.rotation ? `rotate(${el.rotation}deg)` : '';

            if (el.type === 'shape') {
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${widthPercent}%`,
                    height: `${heightPercent}%`,
                    backgroundColor: el.fill || '#3b82f6',
                    border: el.stroke ? `2px solid ${el.stroke}` : undefined,
                    borderRadius: el.borderRadius ? `${el.borderRadius}px` : '8px',
                    transform: rot || undefined,
                  }}
                />
              );
            }

            if (el.type === 'image') {
              return (
                <img
                  key={el.id}
                  src={el.url}
                  alt={el.content || 'Slide image'}
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${widthPercent}%`,
                    height: `${heightPercent}%`,
                    borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                    border: el.stroke ? `${el.strokeWidth || 2}px solid ${el.stroke}` : undefined,
                    transform: rot || undefined,
                  }}
                  className="object-contain pointer-events-none"
                />
              );
            }

            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${widthPercent}%`,
                  minHeight: `${heightPercent}%`,
                  fontSize: el.fontSize ? `calc(${(el.fontSize / 540) * 100}cqw * 0.5625 + ${el.fontSize * 0.8}px)` : '1.5rem',
                  color: el.color || '#0f172a',
                  textAlign: el.align || 'left',
                  fontWeight: el.fontWeight || 'normal',
                  fontStyle: el.fontStyle || 'normal',
                  backgroundColor: el.fill || undefined,
                  borderRadius: el.fill ? '6px' : undefined,
                  transform: rot || undefined,
                }}
                className="whitespace-pre-wrap p-2 leading-relaxed"
              >
                {el.content}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Control Bar */}
      <TooltipProvider>
        <div
          className={`slideshow-controls fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-neutral-900/85 px-3 py-1.5 backdrop-blur-md shadow-2xl transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className="h-8 w-8 rounded-full p-0 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-30"
                />
              }
            >
              <Icon name="chevron-left" size={16} />
            </TooltipTrigger>
            <TooltipContent>Trang trước (← / P)</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex h-8 items-center gap-1 px-2 text-xs font-semibold text-white/90 hover:text-white"
                >
                  <span>{currentIndex + 1} / {totalSlides}</span>
                  <Icon name="chevron-down" size={12} className="opacity-60" />
                </button>
              }
            />
            <DropdownMenuContent align="center" side="top" className="max-h-64 overflow-y-auto">
              {slides.map((s, idx) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => goToSlide(idx)}
                  className={idx === currentIndex ? 'bg-accent font-semibold' : ''}
                >
                  <span>Trang {idx + 1}: {s.title || 'Slide'}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentIndex === totalSlides - 1}
                  className="h-8 w-8 rounded-full p-0 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-30"
                />
              }
            >
              <Icon name="chevron-right" size={16} />
            </TooltipTrigger>
            <TooltipContent>Trang sau (→ / Space / N)</TooltipContent>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-white/20" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLaser((prev) => !prev)}
                  className={`h-8 w-8 rounded-full p-0 transition-colors ${
                    isLaser ? 'bg-red-600 text-white shadow-[0_0_10px_#ef4444]' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                />
              }
            >
              <Icon name="crosshair" size={15} />
            </TooltipTrigger>
            <TooltipContent>Bút laser ảo (L)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsBlackout((prev) => !prev);
                    setIsWhiteout(false);
                  }}
                  className={`h-8 w-8 rounded-full p-0 transition-colors ${
                    isBlackout ? 'bg-white/30 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                />
              }
            >
              <Icon name="moon" size={15} />
            </TooltipTrigger>
            <TooltipContent>Màn hình đen (B)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAutoPlay((prev) => !prev)}
                  className={`h-8 w-8 rounded-full p-0 transition-colors ${
                    isAutoPlay ? 'bg-[var(--o-kind-slides)] text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                />
              }
            >
              <Icon name={isAutoPlay ? 'pause' : 'play'} size={15} />
            </TooltipTrigger>
            <TooltipContent>{isAutoPlay ? 'Dừng tự động chạy' : 'Tự động chạy (4s)'}</TooltipContent>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-white/20" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full p-0 text-white/80 hover:bg-white/10 hover:text-white"
                />
              }
            >
              <Icon name="x" size={16} />
            </TooltipTrigger>
            <TooltipContent>Thoát trình chiếu (ESC)</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
