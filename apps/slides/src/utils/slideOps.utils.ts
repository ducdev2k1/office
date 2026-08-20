import type { SlideDeckData, SlideElement } from '@/types/slides.types';

export const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const createNewElement = (partial: Partial<SlideElement>): SlideElement => ({
  id: `el-${crypto.randomUUID()}`,
  type: partial.type || 'text',
  x: partial.x ?? 280,
  y: partial.y ?? 180,
  width: partial.width ?? 400,
  height: partial.height ?? 120,
  rotation: partial.rotation ?? 0,
  content: partial.content ?? (partial.type === 'text' ? 'Văn bản mới' : undefined),
  fontSize: partial.fontSize ?? 20,
  color: partial.color ?? '#0f172a',
  fill: partial.fill,
  stroke: partial.stroke,
  strokeWidth: partial.strokeWidth,
  borderRadius: partial.borderRadius,
  shapeKind: partial.shapeKind,
  align: partial.align ?? 'left',
  url: partial.url,
  fontWeight: partial.fontWeight,
  fontStyle: partial.fontStyle,
  textDecoration: partial.textDecoration,
});

export const updateElementInDeck = (
  deck: SlideDeckData,
  slideIndex: number,
  elementId: string,
  patch: Partial<SlideElement>,
): SlideDeckData => {
  const updatedSlides = deck.slides.map((s, idx) => {
    if (idx !== slideIndex) return s;
    return {
      ...s,
      elements: s.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el)),
    };
  });
  return { ...deck, slides: updatedSlides };
};

export const deleteElementInDeck = (
  deck: SlideDeckData,
  slideIndex: number,
  elementId: string,
): SlideDeckData => {
  const updatedSlides = deck.slides.map((s, idx) => {
    if (idx !== slideIndex) return s;
    return {
      ...s,
      elements: s.elements.filter((el) => el.id !== elementId),
    };
  });
  return { ...deck, slides: updatedSlides };
};

export const reorderElementInDeck = (
  deck: SlideDeckData,
  slideIndex: number,
  elementId: string,
  mode: 'front' | 'back' | 'forward' | 'backward',
): SlideDeckData => {
  const slide = deck.slides[slideIndex];
  if (!slide) return deck;
  const elements = [...slide.elements];
  const idx = elements.findIndex((el) => el.id === elementId);
  if (idx === -1) return deck;
  const [el] = elements.splice(idx, 1);
  if (!el) return deck;

  if (mode === 'front') elements.push(el);
  else if (mode === 'back') elements.unshift(el);
  else if (mode === 'forward') elements.splice(Math.min(elements.length, idx + 1), 0, el);
  else if (mode === 'backward') elements.splice(Math.max(0, idx - 1), 0, el);

  const updatedSlides = deck.slides.map((s, sIdx) =>
    sIdx === slideIndex ? { ...s, elements } : s,
  );
  return { ...deck, slides: updatedSlides };
};

export const centerElementInDeck = (
  deck: SlideDeckData,
  slideIndex: number,
  elementId: string,
  axis: 'horizontal' | 'vertical' | 'both',
): SlideDeckData => {
  const slide = deck.slides[slideIndex];
  const el = slide?.elements.find((item) => item.id === elementId);
  if (!el) return deck;

  const patch: Partial<SlideElement> = {};
  if (axis === 'horizontal' || axis === 'both') {
    patch.x = Math.round((960 - el.width) / 2);
  }
  if (axis === 'vertical' || axis === 'both') {
    patch.y = Math.round((540 - el.height) / 2);
  }

  return updateElementInDeck(deck, slideIndex, elementId, patch);
};
