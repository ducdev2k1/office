import { SlideThumbnailList } from '@/components/SlideThumbnailList';
import { SlideToolbar } from '@/components/SlideToolbar';
import { SlideViewer } from '@/components/SlideViewer';
import { SlidesHeader } from '@/components/SlidesHeader';
import { useSlides } from '@/hooks/useSlides';
import { useTheme } from '@/hooks/useTheme';
import { ShellLayout } from '@office/app-shell';
import { useTranslation } from '@office/i18n';
import { Skeleton } from '@office/ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('slides');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const slidesApi = useSlides();
  const [zoom, setZoom] = useState(100);
  const [isPresenting, setIsPresenting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (id && id !== slidesApi.activeId) {
      slidesApi.setActiveId(id);
    }
  }, [id, slidesApi]);

  const deck = slidesApi.activeDeck;
  const currentSlide = slidesApi.activeSlide;

  const handleUpdateElement = useCallback(
    (elementId: string, content: string) => {
      if (!deck || !deck.data || !currentSlide) return;
      const updatedElements = currentSlide.elements.map((el) =>
        el.id === elementId ? { ...el, content } : el,
      );
      const updatedSlides = deck.data.slides.map((s) =>
        s.id === currentSlide.id ? { ...s, elements: updatedElements } : s,
      );
      slidesApi.updateData({ ...deck.data, slides: updatedSlides });
    },
    [deck, currentSlide, slidesApi],
  );

  const handleExport = useCallback(async () => {
    if (!deck || !deck.data) return;
    try {
      setExporting(true);
      const { exportSlideFile } = await import('@/services/slides.service');
      const blob = await exportSlideFile(deck.data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deck.title.replace(/[\\/:*?"<>|]/g, '_') || 'presentation'}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert(t('exportError'));
    } finally {
      setExporting(false);
    }
  }, [deck, t]);


  // Fullscreen slideshow navigation
  useEffect(() => {
    if (!isPresenting) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPresenting(false);
      } else if (e.key === 'ArrowRight' || e.key === 'Space') {
        if (deck?.data && slidesApi.activeSlideIndex < deck.data.slides.length - 1) {
          slidesApi.setActiveSlideIndex(slidesApi.activeSlideIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (slidesApi.activeSlideIndex > 0) {
          slidesApi.setActiveSlideIndex(slidesApi.activeSlideIndex - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, deck, slidesApi]);

  if (slidesApi.loading) {
    return (
      <ShellLayout>
        <div className="flex h-screen flex-col">
          <div className="h-14 border-b border-border bg-card p-3">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex flex-1">
            <div className="w-52 border-r border-border p-3 space-y-3">
              <Skeleton className="h-24 w-full rounded" />
              <Skeleton className="h-24 w-full rounded" />
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
              <Skeleton className="h-[480px] w-[854px] rounded-lg" />
            </div>
          </div>
        </div>
      </ShellLayout>
    );
  }

  if (!deck) {
    return (
      <ShellLayout>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{t('editor.notFound')}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-primary underline"
          >
            {t('editor.backHome')}
          </button>
        </div>
      </ShellLayout>
    );
  }

  return (
    <ShellLayout>
      {/* Fullscreen slideshow overlay */}
      {isPresenting && currentSlide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={() => {
            if (deck?.data && slidesApi.activeSlideIndex < deck.data.slides.length - 1) {
              slidesApi.setActiveSlideIndex(slidesApi.activeSlideIndex + 1);
            } else {
              setIsPresenting(false);
            }
          }}
        >
          <div className="relative aspect-[16/9] w-full max-w-[1280px] p-8">
            <div
              className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-white shadow-2xl"
              style={{ backgroundColor: currentSlide.background || undefined }}
            >
              {currentSlide.elements.map((el) => (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${(el.x / 960) * 100}%`,
                    top: `${(el.y / 540) * 100}%`,
                    width: `${(el.width / 960) * 100}%`,
                    fontSize: el.fontSize ? `${(el.fontSize / 16) * 1.3}rem` : '1.5rem',
                    color: el.color || '#0f172a',
                    textAlign: el.align || 'left',
                  }}
                  className="p-2 font-medium"
                >
                  {el.content}
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 right-4 text-xs text-white/50">
              Nhấn ESC để thoát ({slidesApi.activeSlideIndex + 1}/{deck.data?.slides.length})
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <SlidesHeader
          title={deck.title}
          onTitleChange={slidesApi.updateTitle}
          theme={theme}
          onToggleTheme={toggleTheme}
          starred={deck.starred}
          onToggleStar={() => slidesApi.star(deck.id)}
          saveState={slidesApi.saveState}
          onOpenFromDevice={async (file) => {
            try {
              const newId = await slidesApi.importFile(file);
              navigate(`/edit/${newId}`);
            } catch {
              window.alert(t('openError'));
            }
          }}
          onExport={handleExport}
          exporting={exporting}
        />

        <SlideToolbar
          onAddSlide={slidesApi.addSlideToActiveDeck}
          onDuplicateSlide={slidesApi.duplicateActiveSlide}
          onDeleteSlide={slidesApi.deleteActiveSlide}
          onPresent={() => setIsPresenting(true)}
          canDelete={(deck.data?.slides.length ?? 0) > 1}
          zoom={zoom}
          onZoomChange={setZoom}
          onLoadSample={async (sample) => {
            try {
              const newId = await slidesApi.importSample(sample);
              navigate(`/edit/${newId}`);
            } catch {
              window.alert(t('openError'));
            }
          }}
        />


        <div className="flex flex-1 overflow-hidden">
          <SlideThumbnailList
            slides={deck.data?.slides ?? []}
            activeIndex={slidesApi.activeSlideIndex}
            onSelect={slidesApi.setActiveSlideIndex}
            onAddSlide={slidesApi.addSlideToActiveDeck}
          />
          <SlideViewer
            slide={currentSlide}
            zoom={zoom}
            onUpdateElement={handleUpdateElement}
          />
        </div>
      </div>
    </ShellLayout>
  );
};

export default EditorPage;
