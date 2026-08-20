import { SlideContextMenu } from '@/components/SlideContextMenu';
import { SlideThumbnailList } from '@/components/SlideThumbnailList';
import { SlideshowModal } from '@/components/SlideshowModal';
import { SlideToolbar } from '@/components/SlideToolbar';
import { SlideViewer } from '@/components/SlideViewer';
import { SlidesHeader } from '@/components/SlidesHeader';
import { SpeakerNotesDrawer } from '@/components/canvas/SpeakerNotesDrawer';
import { FindReplaceDialog } from '@/components/dialogs/FindReplaceDialog';
import { SlideBackgroundDialog } from '@/components/dialogs/SlideBackgroundDialog';
import { useSlideShortcuts } from '@/hooks/useSlideShortcuts';
import { useSlides } from '@/hooks/useSlides';
import { useTheme } from '@/hooks/useTheme';
import type { SlideElement } from '@/types/slides.types';
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
  const [isBackgroundDialogOpen, setIsBackgroundDialogOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    element?: SlideElement | null;
  } | null>(null);

  useEffect(() => {
    if (id && id !== slidesApi.activeId) {
      slidesApi.setActiveId(id);
    }
  }, [id, slidesApi]);

  const deck = slidesApi.activeDeck;
  const currentSlide = slidesApi.activeSlide;

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

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'h' || e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        setIsFindReplaceOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  useSlideShortcuts({
    enabled: !isPresenting,
    hasSelectedElement: slidesApi.selectedElement !== undefined,
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
    onCopy: slidesApi.copyElement,
    onCut: slidesApi.cutElement,
    onPaste: slidesApi.pasteElement,
    onDeleteElement: () => slidesApi.deleteElement(),
    onDuplicateElement: () => slidesApi.duplicateElement(),
    onEscape: () => slidesApi.setSelectedElementId(null),
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

      {/* Slide Background Dialog */}
      <SlideBackgroundDialog
        open={isBackgroundDialogOpen}
        onOpenChange={setIsBackgroundDialogOpen}
        currentBg={currentSlide?.background}
        onApplyBackground={slidesApi.applySlideBackground}
      />

      {/* Find and Replace Dialog */}
      <FindReplaceDialog
        open={isFindReplaceOpen}
        onOpenChange={setIsFindReplaceOpen}
        deck={deck.data}
        onUpdateDeckData={slidesApi.updateData}
        onSelectSlideIndex={slidesApi.setActiveSlideIndex}
        onSelectElementId={slidesApi.setSelectedElementId}
      />

      {/* Floating Context Menu */}
      {contextMenu && (
        <SlideContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetElement={contextMenu.element}
          canPaste={slidesApi.canPaste}
          canDeleteSlide={(deck.data.slides.length ?? 0) > 1}
          onClose={() => setContextMenu(null)}
          onCut={() => slidesApi.cutElement(contextMenu.element?.id)}
          onCopy={() => slidesApi.copyElement(contextMenu.element?.id)}
          onPaste={slidesApi.pasteElement}
          onDuplicate={() => slidesApi.duplicateElement(contextMenu.element?.id)}
          onDelete={() => slidesApi.deleteElement(contextMenu.element?.id)}
          onCenter={(axis) => slidesApi.centerElement(axis, contextMenu.element?.id)}
          onRotate={(deg) => slidesApi.rotateElement(deg, contextMenu.element?.id)}
          onReplaceImage={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    slidesApi.replaceImage(reader.result, contextMenu.element?.id);
                  }
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }}
          onBringForward={() => slidesApi.bringElementForward(contextMenu.element?.id)}
          onSendBackward={() => slidesApi.sendElementBackward(contextMenu.element?.id)}
          onBringToFront={() => slidesApi.bringElementToFront(contextMenu.element?.id)}
          onSendToBack={() => slidesApi.sendElementToBack(contextMenu.element?.id)}
          onAddSlide={slidesApi.addSlideToActiveDeck}
          onDuplicateSlide={slidesApi.duplicateActiveSlide}
          onDeleteSlide={slidesApi.deleteActiveSlide}
          onPresent={() => setIsPresenting(true)}
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
          currentTransition={currentSlide?.transition || 'fade'}
          currentTransitionDuration={currentSlide?.transitionDuration ?? 0.5}
          onChangeTransition={slidesApi.setSlideTransition}
          onChangeTransitionDuration={slidesApi.setSlideTransitionDuration}
          onSelectLayout={slidesApi.addSlideWithLayout}
          selectedElement={slidesApi.selectedElement}
          onAddTextBox={() =>
            slidesApi.addElement({
              type: 'text',
              content: t('editor.defaultNewText'),
              fontSize: 24,
              width: 400,
              height: 100,
              x: 280,
              y: 220,
            })
          }
          onAddShape={(shapeKind) =>
            slidesApi.addElement({
              type: 'shape',
              shapeKind,
              fill: '#3b82f6',
              width: 200,
              height: 150,
              x: 380,
              y: 195,
            })
          }
          onAddLine={slidesApi.addLine}
          onAddTable={slidesApi.addTable}
          onAddImage={(dataUrl) =>
            slidesApi.addElement({
              type: 'image',
              url: dataUrl,
              width: 360,
              height: 240,
              x: 300,
              y: 150,
            })
          }
          onOpenBackgroundDialog={() => setIsBackgroundDialogOpen(true)}
          onOpenFindReplace={() => setIsFindReplaceOpen(true)}
          onUpdateSelectedElement={(patch) => {
            if (slidesApi.selectedElementId) {
              slidesApi.updateElement(slidesApi.selectedElementId, patch);
            }
          }}
          onDeleteSelectedElement={() => slidesApi.deleteElement()}
          onDuplicateSelectedElement={() => slidesApi.duplicateElement()}
          onCenterSelectedElement={(axis) => slidesApi.centerElement(axis)}
          onRotateSelectedElement={(deg) => slidesApi.rotateElement(deg)}
          onReplaceImageSelectedElement={(url) => slidesApi.replaceImage(url)}
          onBringForward={slidesApi.bringElementForward}
          onSendBackward={slidesApi.sendElementBackward}
          onBringToFront={slidesApi.bringElementToFront}
          onSendToBack={slidesApi.sendElementToBack}
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
            onDuplicateSlide={(idx) => {
              slidesApi.setActiveSlideIndex(idx);
              slidesApi.duplicateActiveSlide();
            }}
            onDeleteSlide={(idx) => {
              slidesApi.setActiveSlideIndex(idx);
              slidesApi.deleteActiveSlide();
            }}
            onMoveSlide={slidesApi.moveSlide}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <SlideViewer
              slide={currentSlide}
              zoom={zoom}
              onZoomChange={setZoom}
              selectedElementId={slidesApi.selectedElementId}
              onSelectElement={slidesApi.setSelectedElementId}
              onUpdateElement={slidesApi.updateElement}
              onDeleteElement={slidesApi.deleteElement}
              onDuplicateElement={slidesApi.duplicateElement}
              onCenterElement={slidesApi.centerElement}
              onReplaceImage={slidesApi.replaceImage}
              onNextSlide={slidesApi.nextSlide}
              onPrevSlide={slidesApi.prevSlide}
              onOpenContextMenu={(x, y, el) => setContextMenu({ x, y, element: el })}
            />
            <SpeakerNotesDrawer
              notes={currentSlide?.notes}
              onUpdateNotes={slidesApi.updateSlideNotes}
            />
          </div>
        </div>
      </div>
    </ShellLayout>
  );
};

export default EditorPage;
