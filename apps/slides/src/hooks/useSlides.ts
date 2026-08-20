import {
  createBlankDeckData,
  createBlankSlideDeck,
  deleteSlideRecord,
  getStorageUsageBytes,
  importSlideFile,
  loadSamplePptx,
  loadSlides,
  saveSlides,
} from '@/services/slides.service';
import type { SlideDeckData, SlideDocRecord, SlideItem } from '@/types/slides.types';
import type { FileRecord } from '@office/file-home';
import { useTranslation } from '@office/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface SlidesState {
  slides: SlideDocRecord[];
  files: FileRecord[];
  loading: boolean;
  activeId: string;
  activeDeck: SlideDocRecord | undefined;
  activeSlideIndex: number;
  activeSlide: SlideItem | undefined;
  saveState: 'loading' | 'saving' | 'saved';
  storageBytes: number;
  canUndo: boolean;
  canRedo: boolean;
  setActiveId: (id: string) => void;
  setActiveSlideIndex: (index: number) => void;
  updateData: (data: SlideDeckData, addToHistory?: boolean) => void;
  updateTitle: (title: string) => void;
  addDeck: (title?: string) => string;
  importFile: (file: File) => Promise<string>;
  importSample: (sampleName: 'sample-basic.pptx' | 'sample-medium.pptx' | 'sample-advanced.pptx') => Promise<string>;
  star: (id: string) => void;
  rename: (id: string, title: string) => void;
  duplicate: (id: string) => void;
  trash: (id: string) => void;
  restore: (id: string) => void;
  deleteForever: (id: string) => void;
  markOpened: (id: string) => void;
  addSlideToActiveDeck: () => void;
  deleteActiveSlide: () => void;
  duplicateActiveSlide: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  firstSlide: () => void;
  lastSlide: () => void;
  undo: () => void;
  redo: () => void;
}

const now = (): string => new Date().toISOString();
const MAX_HISTORY = 30;

export const useSlides = (): SlidesState => {
  const { t } = useTranslation('slides');
  const [slides, setSlides] = useState<SlideDocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(() => 'deck-sample-intro');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [saveState, setSaveState] = useState<'loading' | 'saving' | 'saved'>('loading');

  const [undoStack, setUndoStack] = useState<SlideDeckData[]>([]);
  const [redoStack, setRedoStack] = useState<SlideDeckData[]>([]);

  const activeDeck =
    slides.find((s) => s.id === activeId && !s.deletedAt) ??
    slides.find((s) => !s.deletedAt);
  const activeDeckRef = useRef(activeDeck);

  const activeSlide = activeDeck?.data?.slides[activeSlideIndex] ?? activeDeck?.data?.slides[0];

  useEffect(() => {
    void loadSlides().then((loaded) => {
      setSlides(loaded);
      const first = loaded.find((s) => !s.deletedAt);
      const urlId = window.location.pathname.match(/^\/edit\/([^/]+)/)?.[1];
      const hasUrlDeck = urlId !== undefined && loaded.some((s) => s.id === urlId && !s.deletedAt);
      setActiveId(hasUrlDeck ? urlId : first?.id ?? loaded[0]?.id ?? '');
      setLoading(false);
      setSaveState('saved');
    });
  }, []);

  useEffect(() => {
    activeDeckRef.current = activeDeck;
  }, [activeDeck]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timeout = window.setTimeout(() => void saveSlides(slides), 400);
    return () => window.clearTimeout(timeout);
  }, [slides]);

  const updateDeck = useCallback((id: string, updater: (deck: SlideDocRecord) => SlideDocRecord): void => {
    setSlides((current) => current.map((s) => (s.id === id ? updater(s) : s)));
  }, []);

  const updateData = useCallback(
    (data: SlideDeckData, addToHistory = true): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck) return;

      if (addToHistory && currentDeck.data) {
        setUndoStack((prev) => [...prev.slice(-MAX_HISTORY), JSON.parse(JSON.stringify(currentDeck.data))]);
        setRedoStack([]);
      }

      setSaveState('saving');
      updateDeck(currentDeck.id, (s) => ({
        ...s,
        data,
        updatedAt: now(),
      }));
      window.setTimeout(() => setSaveState('saved'), 300);
    },
    [updateDeck],
  );

  const undo = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data || undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    if (!previousState) return;

    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(currentDeck.data))]);
    updateData(previousState, false);
  }, [undoStack, updateData]);

  const redo = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data || redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    if (!nextState) return;

    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(currentDeck.data))]);
    updateData(nextState, false);
  }, [redoStack, updateData]);

  const updateTitle = useCallback((title: string): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck) return;
    const cleanTitle = title.trim() || t('untitled');
    updateDeck(currentDeck.id, (s) => ({
      ...s,
      title: cleanTitle,
      data: s.data ? { ...s.data, name: cleanTitle } : undefined,
      updatedAt: now(),
    }));
  }, [updateDeck, t]);

  const addDeck = useCallback((title?: string): string => {
    const nextDeck = createBlankSlideDeck(title);
    setSlides((current) => [nextDeck, ...current]);
    setActiveId(nextDeck.id);
    setActiveSlideIndex(0);
    setUndoStack([]);
    setRedoStack([]);
    return nextDeck.id;
  }, []);

  const importFile = useCallback(async (file: File): Promise<string> => {
    const nextDeck = await importSlideFile(file);
    setSlides((current) => [nextDeck, ...current]);
    setActiveId(nextDeck.id);
    setActiveSlideIndex(0);
    setUndoStack([]);
    setRedoStack([]);
    return nextDeck.id;
  }, []);

  const importSample = useCallback(async (sampleName: 'sample-basic.pptx' | 'sample-medium.pptx' | 'sample-advanced.pptx'): Promise<string> => {
    const nextDeck = await loadSamplePptx(sampleName);
    setSlides((current) => [nextDeck, ...current]);
    setActiveId(nextDeck.id);
    setActiveSlideIndex(0);
    setUndoStack([]);
    setRedoStack([]);
    return nextDeck.id;
  }, []);

  const star = useCallback((id: string): void => {
    updateDeck(id, (s) => ({ ...s, starred: !s.starred }));
  }, [updateDeck]);

  const rename = useCallback((id: string, title: string): void => {
    const cleanTitle = title.trim() || t('untitled');
    updateDeck(id, (s) => ({
      ...s,
      title: cleanTitle,
      data: s.data ? { ...s.data, name: cleanTitle } : undefined,
      updatedAt: now(),
    }));
  }, [updateDeck, t]);

  const duplicate = useCallback((id: string): void => {
    setSlides((current) => {
      const source = current.find((s) => s.id === id);
      if (!source) return current;
      const copyId = `deck-${crypto.randomUUID()}`;
      const copyTitle = t('copyOf', { title: source.title });
      const copyData = source.data ? { ...source.data, id: copyId, name: copyTitle } : undefined;
      const copy: SlideDocRecord = {
        ...source,
        id: copyId,
        title: copyTitle,
        createdAt: now(),
        updatedAt: now(),
        lastOpenedAt: now(),
        starred: false,
        deletedAt: null,
        data: copyData ? JSON.parse(JSON.stringify(copyData)) : undefined,
      };
      return [copy, ...current];
    });
  }, [t]);

  const trash = useCallback((id: string): void => {
    updateDeck(id, (s) => ({ ...s, deletedAt: now() }));
  }, [updateDeck]);

  const restore = useCallback((id: string): void => {
    updateDeck(id, (s) => ({ ...s, deletedAt: null, updatedAt: now() }));
  }, [updateDeck]);

  const deleteForever = useCallback((id: string): void => {
    setSlides((current) => current.filter((s) => s.id !== id));
    void deleteSlideRecord(id);
  }, []);

  const markOpened = useCallback((id: string): void => {
    updateDeck(id, (s) => ({ ...s, lastOpenedAt: now() }));
  }, [updateDeck]);

  const addSlideToActiveDeck = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data) return;
    const newSlide: SlideItem = {
      id: `slide-${crypto.randomUUID()}`,
      title: `Trang ${currentDeck.data.slides.length + 1}`,
      background: '#ffffff',
      elements: [
        {
          id: `el-${crypto.randomUUID()}`,
          type: 'text',
          x: 60,
          y: 60,
          width: 840,
          height: 60,
          content: 'Tiêu Đề Trang Chiếu Mới',
          fontSize: 28,
          color: '#0f172a',
          align: 'left',
        },
      ],
    };
    const updatedDeckData: SlideDeckData = {
      ...currentDeck.data,
      slides: [...currentDeck.data.slides, newSlide],
    };
    updateData(updatedDeckData);
    setActiveSlideIndex(updatedDeckData.slides.length - 1);
  }, [updateData]);

  const deleteActiveSlide = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data || currentDeck.data.slides.length <= 1) return;
    const nextSlides = currentDeck.data.slides.filter((_, idx) => idx !== activeSlideIndex);
    const updatedDeckData: SlideDeckData = {
      ...currentDeck.data,
      slides: nextSlides,
    };
    updateData(updatedDeckData);
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
  }, [activeSlideIndex, updateData]);

  const duplicateActiveSlide = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data || !activeSlide) return;
    const clonedSlide: SlideItem = {
      ...JSON.parse(JSON.stringify(activeSlide)),
      id: `slide-${crypto.randomUUID()}`,
      title: `${activeSlide.title || 'Slide'} (Bản sao)`,
    };
    const nextSlides = [...currentDeck.data.slides];
    nextSlides.splice(activeSlideIndex + 1, 0, clonedSlide);
    const updatedDeckData: SlideDeckData = {
      ...currentDeck.data,
      slides: nextSlides,
    };
    updateData(updatedDeckData);
    setActiveSlideIndex(activeSlideIndex + 1);
  }, [activeSlide, activeSlideIndex, updateData]);

  const nextSlide = useCallback((): void => {
    const count = activeDeckRef.current?.data?.slides.length ?? 0;
    if (count > 0) {
      setActiveSlideIndex((prev) => Math.min(count - 1, prev + 1));
    }
  }, []);

  const prevSlide = useCallback((): void => {
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const firstSlide = useCallback((): void => {
    setActiveSlideIndex(0);
  }, []);

  const lastSlide = useCallback((): void => {
    const count = activeDeckRef.current?.data?.slides.length ?? 0;
    if (count > 0) {
      setActiveSlideIndex(count - 1);
    }
  }, []);

  const files = useMemo<FileRecord[]>(() => slides, [slides]);
  const storageBytes = useMemo(() => getStorageUsageBytes(slides), [slides]);

  return {
    slides,
    files,
    loading,
    activeId,
    activeDeck,
    activeSlideIndex,
    activeSlide,
    saveState,
    storageBytes,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    setActiveId,
    setActiveSlideIndex,
    updateData,
    updateTitle,
    addDeck,
    importFile,
    importSample,
    star,
    rename,
    duplicate,
    trash,
    restore,
    deleteForever,
    markOpened,
    addSlideToActiveDeck,
    deleteActiveSlide,
    duplicateActiveSlide,
    nextSlide,
    prevSlide,
    firstSlide,
    lastSlide,
    undo,
    redo,
  };
};
