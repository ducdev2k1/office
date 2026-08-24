import type { EditorView } from '@tiptap/pm/view';
import type { LineMeasurement } from './pagination.utils';

const MAX_MEASURED_LINES = 500;

export const resolveContentNodeDom = (view: EditorView, offset: number): HTMLElement | null => {
  try {
    const pos = Math.min(offset + 1, view.state.doc.content.size);
    const domInfo = view.domAtPos(pos);
    let candidate = (
      domInfo.node.nodeType === Node.ELEMENT_NODE ? domInfo.node : domInfo.node.parentElement
    ) as HTMLElement | null;

    while (candidate && candidate.parentElement && candidate.parentElement !== view.dom) {
      candidate = candidate.parentElement;
    }
    if (
      candidate &&
      candidate.parentElement === view.dom &&
      !candidate.classList.contains('ProseMirror-widget') &&
      candidate.id !== 'pages'
    ) {
      return candidate;
    }
  } catch {
    /* fallback to nodeDOM */
  }

  const fallback = view.nodeDOM(offset) as HTMLElement | null;
  if (
    fallback &&
    fallback.parentElement === view.dom &&
    !fallback.classList.contains('ProseMirror-widget') &&
    fallback.id !== 'pages'
  ) {
    return fallback;
  }

  return null;
};

export const measureLines = (view: EditorView, nodeDom: HTMLElement): LineMeasurement[] => {
  const rects: { top: number; bottom: number; left: number; height: number }[] = [];
  const walker = document.createTreeWalker(nodeDom, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();
  const range = document.createRange();

  while (textNode) {
    range.selectNodeContents(textNode);
    const clientRects = range.getClientRects();
    for (let i = 0; i < clientRects.length; i++) {
      const r = clientRects[i];
      if (r && r.width > 0 && r.height > 0) {
        rects.push({ top: r.top, bottom: r.bottom, left: r.left, height: r.height });
      }
    }
    textNode = walker.nextNode();
  }

  if (rects.length === 0 || rects.length > MAX_MEASURED_LINES) return [];

  rects.sort((a, b) => a.top - b.top || a.left - b.left);
  const grouped: { top: number; bottom: number; left: number; height: number }[] = [];
  for (const r of rects) {
    const last = grouped[grouped.length - 1];
    if (last && r.top <= last.bottom + 1.5 && r.bottom >= last.top - 1.5) {
      last.top = Math.min(last.top, r.top);
      last.bottom = Math.max(last.bottom, r.bottom);
      last.left = Math.min(last.left, r.left);
      last.height = last.bottom - last.top;
    } else {
      grouped.push({ ...r });
    }
  }

  const domRect = nodeDom.getBoundingClientRect();
  const lines: LineMeasurement[] = [];

  for (const line of grouped) {
    const midY = line.top + line.height / 2;
    const posObj = view.posAtCoords({ left: line.left + 2, top: midY });
    const pos = posObj?.pos;
    if (pos === undefined || pos === null) return [];

    lines.push({
      top: line.top - domRect.top,
      bottom: line.bottom - domRect.top,
      pos,
    });
  }

  return lines;
};

export interface CachedBlockMetrics {
  height: number;
  marginTop: number;
  marginBottom: number;
  lines?: LineMeasurement[];
}

interface CacheEntry extends CachedBlockMetrics {
  epoch: number;
}

const blockCache = new WeakMap<HTMLElement, CacheEntry>();
let measurementEpoch = 0;

/** Vô hiệu hoá toàn bộ cache đo block — gọi khi font/page setup/viewMode đổi. */
export const bumpBlockCache = (): void => {
  measurementEpoch += 1;
};

export const getCachedBlockMetrics = (el: HTMLElement | null): CachedBlockMetrics | null => {
  if (!el || !el.isConnected) return null;
  const entry = blockCache.get(el);
  if (!entry || entry.epoch !== measurementEpoch) return null;
  return {
    height: entry.height,
    marginTop: entry.marginTop,
    marginBottom: entry.marginBottom,
    lines: entry.lines,
  };
};

export const measureBlockDom = (el: HTMLElement): CachedBlockMetrics => {
  const style = getComputedStyle(el);
  const metrics = {
    height: el.offsetHeight,
    marginTop: parseFloat(style.marginTop) || 0,
    marginBottom: parseFloat(style.marginBottom) || 0,
  };
  blockCache.set(el, { ...metrics, lines: undefined, epoch: measurementEpoch });
  return metrics;
};

export const setCachedBlockLines = (el: HTMLElement, lines: LineMeasurement[]): void => {
  const entry = blockCache.get(el);
  if (entry && entry.epoch === measurementEpoch) {
    entry.lines = lines;
  }
};
