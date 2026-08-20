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
import type { SlideDeckData, SlideDocRecord, SlideElement, SlideItem } from '@/types/slides.types';
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
  selectedElementId: string | null;
  selectedElement: SlideElement | undefined;
  saveState: 'loading' | 'saving' | 'saved';
  storageBytes: number;
  canUndo: boolean;
  canRedo: boolean;
  setActiveId: (id: string) => void;
  setActiveSlideIndex: (index: number) => void;
  setSelectedElementId: (id: string | null) => void;
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
  moveSlide: (fromIndex: number, toIndex: number) => void;
  setSlideBackground: (bg: string, index?: number) => void;
  addElement: (element: Partial<SlideElement>) => string;
  updateElement: (elementId: string, patch: Partial<SlideElement>) => void;
  deleteElement: (elementId?: string) => void;
  duplicateElement: (elementId?: string) => void;
  bringElementForward: (elementId?: string) => void;
  sendElementBackward: (elementId?: string) => void;
  bringElementToFront: (elementId?: string) => void;
  sendElementToBack: (elementId?: string) => void;
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
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'loading' | 'saving' | 'saved'>('loading');

  const [undoStack, setUndoStack] = useState<SlideDeckData[]>([]);
  const [redoStack, setRedoStack] = useState<SlideDeckData[]>([]);

  const activeDeck =
    slides.find((s) => s.id === activeId && !s.deletedAt) ??
    slides.find((s) => !s.deletedAt);
  const activeDeckRef = useRef(activeDeck);

  const activeSlide = activeDeck?.data?.slides[activeSlideIndex] ?? activeDeck?.data?.slides[0];
  const selectedElement = activeSlide?.elements.find((el) => el.id === selectedElementId);

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
    setSelectedElementId(null);
    setUndoStack([]);
    setRedoStack([]);
    return nextDeck.id;
  }, []);

  const importFile = useCallback(async (file: File): Promise<string> => {
    const nextDeck = await importSlideFile(file);
    setSlides((current) => [nextDeck, ...current]);
    setActiveId(nextDeck.id);
    setActiveSlideIndex(0);
    setSelectedElementId(null);
    setUndoStack([]);
    setRedoStack([]);
    return nextDeck.id;
  }, []);

  const importSample = useCallback(async (sampleName: 'sample-basic.pptx' | 'sample-medium.pptx' | 'sample-advanced.pptx'): Promise<string> => {
    const nextDeck = await loadSamplePptx(sampleName);
    setSlides((current) => [nextDeck, ...current]);
    setActiveId(nextDeck.id);
    setActiveSlideIndex(0);
    setSelectedElementId(null);
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
    setSelectedElementId(null);
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
    setSelectedElementId(null);
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
    setSelectedElementId(null);
  }, [activeSlide, activeSlideIndex, updateData]);

  const moveSlide = useCallback((fromIndex: number, toIndex: number): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data) return;
    const slidesList = [...currentDeck.data.slides];
    if (fromIndex < 0 || fromIndex >= slidesList.length || toIndex < 0 || toIndex >= slidesList.length) return;
    const [moved] = slidesList.splice(fromIndex, 1);
    if (!moved) return;
    slidesList.splice(toIndex, 0, moved);
    updateData({ ...currentDeck.data, slides: slidesList });
    setActiveSlideIndex(toIndex);
  }, [updateData]);

  const setSlideBackground = useCallback((bg: string, index?: number): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data) return;
    const targetIndex = index ?? activeSlideIndex;
    const slidesList = currentDeck.data.slides.map((s, idx) =>
      idx === targetIndex ? { ...s, background: bg } : s,
    );
    updateData({ ...currentDeck.data, slides: slidesList });
  }, [activeSlideIndex, updateData]);

  const addElement = useCallback((partial: Partial<SlideElement>): string => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data || !activeSlide) return '';
    const newId = `el-${crypto.randomUUID()}`;
    const newElement: SlideElement = {
      id: newId,
      type: partial.type || 'text',
      x: partial.x ?? 280,
      y: partial.y ?? 180,
      width: partial.width ?? 400,
      height: partial.height ?? 120,
      content: partial.content ?? (partial.type === 'text' ? 'Văn bản mới' : undefined),
      fontSize: partial.fontSize ?? 20,
      color: partial.color ?? '#0f172a',
      fill: partial.fill,
      stroke: partial.stroke,
      strokeWidth: partial.strokeWidth,
      shapeKind: partial.shapeKind,
      align: partial.align ?? 'left',
      url: partial.url,
      fontWeight: partial.fontWeight,
      fontStyle: partial.fontStyle,
      textDecoration: partial.textDecoration,
    };
    const updatedSlides = currentDeck.data.slides.map((s, idx) =>
      idx === activeSlideIndex ? { ...s, elements: [...s.elements, newElement] } : s,
    );
    updateData({ ...currentDeck.data, slides: updatedSlides });
    setSelectedElementId(newId);
    return newId;
  }, [activeSlide, activeSlideIndex, updateData]);

  const updateElement = useCallback((elementId: string, patch: Partial<SlideElement>): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data || !activeSlide) return;
    const updatedSlides = currentDeck.data.slides.map((s, idx) => {
      if (idx !== activeSlideIndex) return s;
      return {
        ...s,
        elements: s.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el)),
      };
    });
    updateData({ ...currentDeck.data, slides: updatedSlides });
  }, [activeSlide, activeSlideIndex, updateData]);

  const deleteElement = useCallback((elementId?: string): void => {
    const targetId = elementId || selectedElementId;
    if (!targetId) return;
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data || !activeSlide) return;
    const updatedSlides = currentDeck.data.slides.map((s, idx) => {
      if (idx !== activeSlideIndex) return s;
      return {
        ...s,
        elements: s.elements.filter((el) => el.id !== targetId),
      };
    });
    updateData({ ...currentDeck.data, slides: updatedSlides });
    setSelectedElementId(null);
  }, [activeSlide, activeSlideIndex, selectedElementId, updateData]);

  const duplicateElement = useCallback((elementId?: string): void => {
    const targetId = elementId || selectedElementId;
    if (!targetId) return;
    const currentDeck = activeDeckRef.current;
    if (!currentDeck || !currentDeck.data || !activeSlide) return;
    const sourceEl = activeSlide.elements.find((el) => el.id === targetId);
    if (!sourceEl) return;
    const newId = `el-${crypto.randomUUID()}`;
    const cloned: SlideElement = {
      ...JSON.parse(JSON.stringify(sourceEl)),
      id: newId,
      x: Math.min(900, sourceEl.x + 20),
      y: Math.min(480, sourceEl.y + 20),
    };
    const updatedSlides = currentDeck.data.slides.map((s, idx) => {
      if (idx !== activeSlideIndex) return s;
      return { ...s, elements: [...s.elements, cloned] };
    });
    updateData({ ...currentDeck.data, slides: updatedSlides });
    setSelectedElementId(newId);
  }, [activeSlide, activeSlideIndex, selectedElementId, updateData]);

  const reorderElement = useCallback(
    (mode: 'front' | 'back' | 'forward' | 'backward', elementId?: string): void => {
      const targetId = elementId || selectedElementId;
      if (!targetId) return;
      const currentDeck = activeDeckRef.current;
      if (!currentDeck || !currentDeck.data || !activeSlide) return;
      const elements = [...activeSlide.elements];
      const idx = elements.findIndex((el) => el.id === targetId);
      if (idx === -1) return;
      const [el] = elements.splice(idx, 1);
      if (!el) return;

      if (mode === 'front') elements.push(el);
      else if (mode === 'back') elements.unshift(el);
      else if (mode === 'forward') elements.splice(Math.min(elements.length, idx + 1), 0, el);
      else if (mode === 'backward') elements.splice(Math.max(0, idx - 1), 0, el);

      const updatedSlides = currentDeck.data.slides.map((s, sIdx) =>
        sIdx === activeSlideIndex ? { ...s, elements } : s,
      );
      updateData({ ...currentDeck.data, slides: updatedSlides });
    },
    [activeSlide, activeSlideIndex, selectedElementId, updateData],
  );

  const bringElementForward = useCallback((id?: string) => reorderElement('forward', id), [reorderElement]);
  const sendElementBackward = useCallback((id?: string) => reorderElement('backward', id), [reorderElement]);
  const bringElementToFront = useCallback((id?: string) => reorderElement('front', id), [reorderElement]);
  const sendElementToBack = useCallback((id?: string) => reorderElement('back', id), [reorderElement]);

  const nextSlide = useCallback((): void => {
    const count = activeDeckRef.current?.data?.slides.length ?? 0;
    if (count > 0) {
      setActiveSlideIndex((prev) => Math.min(count - 1, prev + 1));
      setSelectedElementId(null);
    }
  }, []);

  const prevSlide = useCallback((): void => {
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
    setSelectedElementId(null);
  }, []);

  const firstSlide = useCallback((): void => {
    setActiveSlideIndex(0);
    setSelectedElementId(null);
  }, []);

  const lastSlide = useCallback((): void => {
    const count = activeDeckRef.current?.data?.slides.length ?? 0;
    if (count > 0) {
      setActiveSlideIndex(count - 1);
      setSelectedElementId(null);
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
    selectedElementId,
    selectedElement,
    saveState,
    storageBytes,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    setActiveId,
    setActiveSlideIndex,
    setSelectedElementId,
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
    moveSlide,
    setSlideBackground,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    bringElementForward,
    sendElementBackward,
    bringElementToFront,
    sendElementToBack,
    nextSlide,
    prevSlide,
    firstSlide,
    lastSlide,
    undo,
    redo,
  };
};
