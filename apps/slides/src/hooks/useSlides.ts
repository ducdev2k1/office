import {
  createBlankSlideDeck,
  deleteSlideRecord,
  getStorageUsageBytes,
  importSlideFile,
  loadSamplePptx,
  loadSlides,
  saveSlideDeck,
  saveSlides,
} from '@/services/slides.service';
import type {
  SlideDeckData,
  SlideDocRecord,
  SlideElement,
  SlideItem,
  SlideLayoutType,
  SlideLineKind,
  SlideTransitionType,
} from '@/types/slides.types';
import { createSlideWithLayout } from '@/utils/slideLayouts.utils';
import {
  centerElementInDeck,
  cloneDeep,
  createNewElement,
  deleteElementInDeck,
  reorderElementInDeck,
  updateElementInDeck,
} from '@/utils/slideOps.utils';
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
  canPaste: boolean;
  setActiveId: (id: string) => void;
  setActiveSlideIndex: (index: number) => void;
  setSelectedElementId: (id: string | null) => void;
  updateData: (data: SlideDeckData, addToHistory?: boolean) => void;
  updateTitle: (title: string) => void;
  addDeck: (title?: string) => string;
  importFile: (file: File) => Promise<string>;
  importSample: (
    sampleName: 'sample-basic.pptx' | 'sample-medium.pptx' | 'sample-advanced.pptx',
  ) => Promise<string>;
  star: (id: string) => void;
  rename: (id: string, title: string) => void;
  duplicate: (id: string) => void;
  trash: (id: string) => void;
  restore: (id: string) => void;
  deleteForever: (id: string) => void;
  markOpened: (id: string) => void;
  addSlideToActiveDeck: () => void;
  addSlideWithLayout: (layout: SlideLayoutType) => void;
  deleteActiveSlide: () => void;
  duplicateActiveSlide: () => void;
  moveSlide: (fromIndex: number, toIndex: number) => void;
  setSlideBackground: (bg: string, index?: number) => void;
  applySlideBackground: (bg: string, applyToAll?: boolean) => void;
  updateSlideNotes: (notes: string, index?: number) => void;
  setSlideTransition: (transition: SlideTransitionType, applyToAll?: boolean) => void;
  setSlideTransitionDuration: (duration: number, applyToAll?: boolean) => void;
  addElement: (element: Partial<SlideElement>) => string;
  addLine: (kind: SlideLineKind) => string;
  addTable: (rows?: number, cols?: number) => string;
  updateElement: (elementId: string, patch: Partial<SlideElement>) => void;
  deleteElement: (elementId?: string) => void;
  duplicateElement: (elementId?: string) => void;
  copyElement: (elementId?: string) => void;
  cutElement: (elementId?: string) => void;
  pasteElement: () => void;
  centerElement: (axis: 'horizontal' | 'vertical' | 'both', elementId?: string) => void;
  rotateElement: (deltaDeg?: number, elementId?: string) => void;
  replaceImage: (url: string, elementId?: string) => void;
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
  const [clipboard, setClipboard] = useState<SlideElement | null>(null);

  const activeDeck =
    slides.find((s) => s.id === activeId && !s.deletedAt) ?? slides.find((s) => !s.deletedAt);
  const activeDeckRef = useRef(activeDeck);

  const activeSlide = activeDeck?.data?.slides[activeSlideIndex] ?? activeDeck?.data?.slides[0];
  const selectedElement = activeSlide?.elements.find((el) => el.id === selectedElementId);

  useEffect(() => {
    void loadSlides().then((loaded) => {
      setSlides(loaded);
      const first = loaded.find((s) => !s.deletedAt);
      const urlId = window.location.pathname.match(/^\/edit\/([^/]+)/)?.[1];
      const hasUrlDeck = urlId !== undefined && loaded.some((s) => s.id === urlId && !s.deletedAt);
      setActiveId(hasUrlDeck ? urlId : (first?.id ?? loaded[0]?.id ?? ''));
      setLoading(false);
      setSaveState('saved');
    });
  }, []);

  useEffect(() => {
    activeDeckRef.current = activeDeck;
  }, [activeDeck]);

  // Autosave: Chi ghi ban ghi activeDeck qua put() don diem de giam thieu Disk I/O va giam lag
  useEffect(() => {
    if (!activeDeck || loading) return;
    setSaveState('saving');
    const timeout = window.setTimeout(async () => {
      await saveSlideDeck(activeDeck);
      setSaveState('saved');
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [activeDeck, loading]);

  const updateDeck = useCallback(
    (id: string, updater: (deck: SlideDocRecord) => SlideDocRecord): void => {
      setSlides((current) => current.map((s) => (s.id === id ? updater(s) : s)));
    },
    [],
  );

  const updateData = useCallback(
    (data: SlideDeckData, addToHistory = true): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data) return;
      const currentData = currentDeck.data;
      if (addToHistory) {
        setUndoStack((prev) => [...prev.slice(-MAX_HISTORY), cloneDeep(currentData)]);
        setRedoStack([]);
      }
      updateDeck(currentDeck.id, (s) => ({ ...s, data, updatedAt: now() }));
    },
    [updateDeck],
  );

  const undo = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck?.data || undoStack.length === 0) return;
    const currentData = currentDeck.data;
    const previousState = undoStack[undoStack.length - 1];
    if (!previousState) return;
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, cloneDeep(currentData)]);
    updateData(previousState, false);
  }, [undoStack, updateData]);

  const redo = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck?.data || redoStack.length === 0) return;
    const currentData = currentDeck.data;
    const nextState = redoStack[redoStack.length - 1];
    if (!nextState) return;
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, cloneDeep(currentData)]);
    updateData(nextState, false);
  }, [redoStack, updateData]);

  const updateTitle = useCallback(
    (title: string): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck) return;
      const cleanTitle = title.trim() || t('untitled');
      updateDeck(currentDeck.id, (s) => ({
        ...s,
        title: cleanTitle,
        data: s.data ? { ...s.data, name: cleanTitle } : undefined,
        updatedAt: now(),
      }));
    },
    [updateDeck, t],
  );

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

  const importSample = useCallback(
    async (
      sampleName: 'sample-basic.pptx' | 'sample-medium.pptx' | 'sample-advanced.pptx',
    ): Promise<string> => {
      const nextDeck = await loadSamplePptx(sampleName);
      setSlides((current) => [nextDeck, ...current]);
      setActiveId(nextDeck.id);
      setActiveSlideIndex(0);
      setSelectedElementId(null);
      setUndoStack([]);
      setRedoStack([]);
      return nextDeck.id;
    },
    [],
  );

  const star = useCallback(
    (id: string): void => {
      updateDeck(id, (s) => ({ ...s, starred: !s.starred }));
    },
    [updateDeck],
  );

  const rename = useCallback(
    (id: string, title: string): void => {
      const cleanTitle = title.trim() || t('untitled');
      updateDeck(id, (s) => ({
        ...s,
        title: cleanTitle,
        data: s.data ? { ...s.data, name: cleanTitle } : undefined,
        updatedAt: now(),
      }));
    },
    [updateDeck, t],
  );

  const duplicate = useCallback(
    (id: string): void => {
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
          data: copyData ? cloneDeep(copyData) : undefined,
        };
        return [copy, ...current];
      });
    },
    [t],
  );

  const trash = useCallback(
    (id: string): void => {
      updateDeck(id, (s) => ({ ...s, deletedAt: now() }));
    },
    [updateDeck],
  );

  const restore = useCallback(
    (id: string): void => {
      updateDeck(id, (s) => ({ ...s, deletedAt: null, updatedAt: now() }));
    },
    [updateDeck],
  );

  const deleteForever = useCallback((id: string): void => {
    setSlides((current) => current.filter((s) => s.id !== id));
    void deleteSlideRecord(id);
  }, []);

  const markOpened = useCallback(
    (id: string): void => {
      updateDeck(id, (s) => ({ ...s, lastOpenedAt: now() }));
    },
    [updateDeck],
  );

  const addSlideToActiveDeck = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck?.data) return;
    const newSlide: SlideItem = {
      id: `slide-${crypto.randomUUID()}`,
      title: `${currentDeck.data.slides.length + 1}`,
      background: '#ffffff',
      transition: 'fade',
      elements: [
        createNewElement({
          type: 'text',
          x: 60,
          y: 60,
          width: 840,
          height: 60,
          content: t('editor.defaultNewTitle'),
          fontSize: 28,
        }),
      ],
    };
    const updatedDeckData: SlideDeckData = {
      ...currentDeck.data,
      slides: [...currentDeck.data.slides, newSlide],
    };
    updateData(updatedDeckData);
    setActiveSlideIndex(updatedDeckData.slides.length - 1);
    setSelectedElementId(null);
  }, [t, updateData]);

  const deleteActiveSlide = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck?.data || currentDeck.data.slides.length <= 1) return;
    const nextSlides = currentDeck.data.slides.filter((_, idx) => idx !== activeSlideIndex);
    updateData({ ...currentDeck.data, slides: nextSlides });
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    setSelectedElementId(null);
  }, [activeSlideIndex, updateData]);

  const duplicateActiveSlide = useCallback((): void => {
    const currentDeck = activeDeckRef.current;
    if (!currentDeck?.data || !activeSlide) return;
    const clonedSlide: SlideItem = {
      ...cloneDeep(activeSlide),
      id: `slide-${crypto.randomUUID()}`,
      title: t('copyOf', { title: activeSlide.title || 'Slide' }),
    };
    const nextSlides = [...currentDeck.data.slides];
    nextSlides.splice(activeSlideIndex + 1, 0, clonedSlide);
    updateData({ ...currentDeck.data, slides: nextSlides });
    setActiveSlideIndex(activeSlideIndex + 1);
    setSelectedElementId(null);
  }, [activeSlide, activeSlideIndex, updateData]);

  const moveSlide = useCallback(
    (fromIndex: number, toIndex: number): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data) return;
      const slidesList = [...currentDeck.data.slides];
      if (
        fromIndex < 0 ||
        fromIndex >= slidesList.length ||
        toIndex < 0 ||
        toIndex >= slidesList.length
      )
        return;
      const [moved] = slidesList.splice(fromIndex, 1);
      if (!moved) return;
      slidesList.splice(toIndex, 0, moved);
      updateData({ ...currentDeck.data, slides: slidesList });
      setActiveSlideIndex(toIndex);
    },
    [updateData],
  );

  const setSlideBackground = useCallback(
    (bg: string, index?: number): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data) return;
      const targetIndex = index ?? activeSlideIndex;
      const slidesList = currentDeck.data.slides.map((s, idx) =>
        idx === targetIndex ? { ...s, background: bg } : s,
      );
      updateData({ ...currentDeck.data, slides: slidesList });
    },
    [activeSlideIndex, updateData],
  );

  const setSlideTransition = useCallback(
    (transition: SlideTransitionType, applyToAll = false): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data) return;
      const slidesList = currentDeck.data.slides.map((s, idx) => {
        if (applyToAll || idx === activeSlideIndex) {
          return { ...s, transition };
        }
        return s;
      });
      updateData({ ...currentDeck.data, slides: slidesList });
    },
    [activeSlideIndex, updateData],
  );

  const setSlideTransitionDuration = useCallback(
    (transitionDuration: number, applyToAll = false): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data) return;
      const slidesList = currentDeck.data.slides.map((s, idx) => {
        if (applyToAll || idx === activeSlideIndex) {
          return { ...s, transitionDuration };
        }
        return s;
      });
      updateData({ ...currentDeck.data, slides: slidesList });
    },
    [activeSlideIndex, updateData],
  );

  const addElement = useCallback(
    (partial: Partial<SlideElement>): string => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data || !activeSlide) return '';
      const newElement = createNewElement(partial);
      const updatedSlides = currentDeck.data.slides.map((s, idx) =>
        idx === activeSlideIndex ? { ...s, elements: [...s.elements, newElement] } : s,
      );
      updateData({ ...currentDeck.data, slides: updatedSlides });
      setSelectedElementId(newElement.id);
      return newElement.id;
    },
    [activeSlide, activeSlideIndex, updateData],
  );

  const addSlideWithLayout = useCallback(
    (layout: SlideLayoutType): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data) return;
      const newSlide = createSlideWithLayout(layout, currentDeck.data.slides.length, t);
      const updatedDeckData: SlideDeckData = {
        ...currentDeck.data,
        slides: [...currentDeck.data.slides, newSlide],
      };
      updateData(updatedDeckData);
      setActiveSlideIndex(updatedDeckData.slides.length - 1);
      setSelectedElementId(null);
    },
    [t, updateData],
  );

  const updateSlideNotes = useCallback(
    (notes: string, index?: number): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data) return;
      const targetIndex = index ?? activeSlideIndex;
      const slidesList = currentDeck.data.slides.map((s, idx) =>
        idx === targetIndex ? { ...s, notes } : s,
      );
      updateData({ ...currentDeck.data, slides: slidesList });
    },
    [activeSlideIndex, updateData],
  );

  const applySlideBackground = useCallback(
    (bg: string, applyToAll = false): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data) return;
      const slidesList = currentDeck.data.slides.map((s, idx) => {
        if (applyToAll || idx === activeSlideIndex) {
          return {
            ...s,
            background: bg,
            backgroundGradient: bg.includes('gradient') ? bg : undefined,
          };
        }
        return s;
      });
      updateData({ ...currentDeck.data, slides: slidesList });
    },
    [activeSlideIndex, updateData],
  );

  const addLine = useCallback(
    (kind: SlideLineKind): string => {
      return addElement({
        type: 'line',
        lineKind: kind,
        x: 280,
        y: 260,
        width: 400,
        height: 40,
        stroke: '#0f172a',
        strokeWidth: 3,
      });
    },
    [addElement],
  );

  const addTable = useCallback(
    (rows = 3, cols = 3): string => {
      const cells = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) =>
          r === 0 ? `Tiêu đề ${c + 1}` : `Ô ${r + 1},${c + 1}`,
        ),
      );
      return addElement({
        type: 'table',
        x: 180,
        y: 120,
        width: 600,
        height: 240,
        tableData: { rows, cols, cells, headerRow: true },
      });
    },
    [addElement],
  );

  const updateElement = useCallback(
    (elementId: string, patch: Partial<SlideElement>): void => {
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data || !activeSlide) return;
      const updatedDeck = updateElementInDeck(currentDeck.data, activeSlideIndex, elementId, patch);
      updateData(updatedDeck);
    },
    [activeSlide, activeSlideIndex, updateData],
  );

  const deleteElement = useCallback(
    (elementId?: string): void => {
      const targetId = elementId || selectedElementId;
      if (!targetId) return;
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data || !activeSlide) return;
      const updatedDeck = deleteElementInDeck(currentDeck.data, activeSlideIndex, targetId);
      updateData(updatedDeck);
      setSelectedElementId(null);
    },
    [activeSlide, activeSlideIndex, selectedElementId, updateData],
  );

  const duplicateElement = useCallback(
    (elementId?: string): void => {
      const targetId = elementId || selectedElementId;
      if (!targetId) return;
      const currentDeck = activeDeckRef.current;
      if (!currentDeck?.data || !activeSlide) return;
      const sourceEl = activeSlide.elements.find((el) => el.id === targetId);
      if (!sourceEl) return;
      const newId = `el-${crypto.randomUUID()}`;
      const cloned: SlideElement = {
        ...cloneDeep(sourceEl),
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
    },
    [activeSlide, activeSlideIndex, selectedElementId, updateData],
  );

  const copyElement = useCallback(
    (elementId?: string): void => {
      const targetId = elementId || selectedElementId;
      if (!targetId || !activeSlide) return;
      const el = activeSlide.elements.find((item) => item.id === targetId);
      if (el) setClipboard(cloneDeep(el));
    },
    [activeSlide, selectedElementId],
  );

  const cutElement = useCallback(
    (elementId?: string): void => {
      const targetId = elementId || selectedElementId;
      if (!targetId || !activeSlide) return;
      const el = activeSlide.elements.find((item) => item.id === targetId);
      if (el) {
        setClipboard(cloneDeep(el));
        deleteElement(targetId);
      }
    },
    [activeSlide, deleteElement, selectedElementId],
  );

  const pasteElement = useCallback((): void => {
    if (!clipboard) return;
    const cloned = cloneDeep(clipboard);
    cloned.id = `el-${crypto.randomUUID()}`;
    cloned.x = Math.min(900, cloned.x + 20);
    cloned.y = Math.min(480, cloned.y + 20);
    addElement(cloned);
  }, [addElement, clipboard]);

  const centerElement = useCallback(
    (axis: 'horizontal' | 'vertical' | 'both', elementId?: string): void => {
      const targetId = elementId || selectedElementId;
      if (!targetId || !activeDeckRef.current?.data) return;
      const updated = centerElementInDeck(
        activeDeckRef.current.data,
        activeSlideIndex,
        targetId,
        axis,
      );
      updateData(updated);
    },
    [activeSlideIndex, selectedElementId, updateData],
  );

  const rotateElement = useCallback(
    (deltaDeg = 90, elementId?: string): void => {
      const targetId = elementId || selectedElementId;
      if (!targetId || !activeSlide) return;
      const el = activeSlide.elements.find((item) => item.id === targetId);
      if (!el) return;
      const currentRot = el.rotation || 0;
      updateElement(targetId, { rotation: (currentRot + deltaDeg) % 360 });
    },
    [activeSlide, selectedElementId, updateElement],
  );

  const replaceImage = useCallback(
    (url: string, elementId?: string): void => {
      const targetId = elementId || selectedElementId;
      if (!targetId) return;
      updateElement(targetId, { url });
    },
    [selectedElementId, updateElement],
  );

  const bringElementForward = useCallback(
    (id?: string) => {
      const targetId = id || selectedElementId;
      if (targetId && activeDeckRef.current?.data) {
        updateData(
          reorderElementInDeck(activeDeckRef.current.data, activeSlideIndex, targetId, 'forward'),
        );
      }
    },
    [activeSlideIndex, selectedElementId, updateData],
  );

  const sendElementBackward = useCallback(
    (id?: string) => {
      const targetId = id || selectedElementId;
      if (targetId && activeDeckRef.current?.data) {
        updateData(
          reorderElementInDeck(activeDeckRef.current.data, activeSlideIndex, targetId, 'backward'),
        );
      }
    },
    [activeSlideIndex, selectedElementId, updateData],
  );

  const bringElementToFront = useCallback(
    (id?: string) => {
      const targetId = id || selectedElementId;
      if (targetId && activeDeckRef.current?.data) {
        updateData(
          reorderElementInDeck(activeDeckRef.current.data, activeSlideIndex, targetId, 'front'),
        );
      }
    },
    [activeSlideIndex, selectedElementId, updateData],
  );

  const sendElementToBack = useCallback(
    (id?: string) => {
      const targetId = id || selectedElementId;
      if (targetId && activeDeckRef.current?.data) {
        updateData(
          reorderElementInDeck(activeDeckRef.current.data, activeSlideIndex, targetId, 'back'),
        );
      }
    },
    [activeSlideIndex, selectedElementId, updateData],
  );

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
    canPaste: clipboard !== null,
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
    addSlideWithLayout,
    deleteActiveSlide,
    duplicateActiveSlide,
    moveSlide,
    setSlideBackground,
    applySlideBackground,
    updateSlideNotes,
    setSlideTransition,
    setSlideTransitionDuration,
    addElement,
    addLine,
    addTable,
    updateElement,
    deleteElement,
    duplicateElement,
    copyElement,
    cutElement,
    pasteElement,
    centerElement,
    rotateElement,
    replaceImage,
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
