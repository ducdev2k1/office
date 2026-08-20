import { SlideThumbnailList } from '@/components/SlideThumbnailList';
import { SlideshowModal } from '@/components/SlideshowModal';
import { SlideToolbar } from '@/components/SlideToolbar';
import { SlideViewer } from '@/components/SlideViewer';
import { SlidesHeader } from '@/components/SlidesHeader';
import { useSlideShortcuts } from '@/hooks/useSlideShortcuts';
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

  // Attach Google Slides keyboard shortcuts in editor mode
  useSlideShortcuts({
    enabled: !isPresenting,
    onPresent: () => setIsPresenting(true),
    onAddSlide: slidesApi.addSlideToActiveDeck,
    onDuplicateSlide: slidesApi.duplicateActiveSlide,
    onDeleteSlide: slidesApi.deleteActiveSlide,
    onNextSlide: slidesApi.nextSlide,
    onPrevSlide: slidesApi.prevSlide,
    onFirstSlide: slidesApi.firstSlide,
    onLastSlide: slidesApi.lastSlide,
    onUndo: slidesApi.undo,
    onRedo: slidesApi.redo,
  });

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

  if (!deck || !deck.data) {
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
      {/* Fullscreen slideshow modal */}
      {isPresenting && (
        <SlideshowModal
          deck={deck.data}
          initialSlideIndex={slidesApi.activeSlideIndex}
          onClose={() => setIsPresenting(false)}
        />
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
          onUndo={slidesApi.undo}
          onRedo={slidesApi.redo}
          canUndo={slidesApi.canUndo}
          canRedo={slidesApi.canRedo}
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
