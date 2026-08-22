import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Placement,
  type Strategy,
} from '@floating-ui/dom';

export interface PopupOptions {
  placement?: Placement;
  strategy?: Strategy;
  offset?: number;
  /** Editor view DOM coordinates (screen) to anchor popup near a selection. */
  anchor?: DOMRect | null;
  /** Reference element (falls back to anchor rect). */
  reference?: HTMLElement | null;
}

export interface PopupController {
  update: (anchor?: DOMRect | null) => void;
  destroy: () => void;
}

export const mountPopup = (
  popupEl: HTMLElement,
  { placement = 'bottom-start', strategy = 'fixed', offset: offsetVal = 6, anchor, reference }: PopupOptions,
): PopupController => {
  let currentAnchor = anchor;
  const getRef = () => reference ?? (currentAnchor ? ({ getBoundingClientRect: () => currentAnchor } as HTMLElement) : null);
  
  if (!getRef()) {
    popupEl.style.display = 'none';
    return { update: () => {}, destroy: () => {} };
  }

  let cleanup: (() => void) | null = null;

  const update = (nextAnchor?: DOMRect | null) => {
    if (nextAnchor !== undefined) {
      currentAnchor = nextAnchor;
    }
    const ref = getRef();
    if (!ref || !currentAnchor) {
      popupEl.style.display = 'none';
      return;
    }
    const fakeEl = { getBoundingClientRect: () => currentAnchor! } as HTMLElement;
    void computePosition(fakeEl, popupEl, {
      placement,
      strategy,
      middleware: [offset(offsetVal), flip(), shift({ padding: 12 })],
    }).then(({ x, y }) => {
      popupEl.style.position = strategy;
      popupEl.style.left = `${x}px`;
      popupEl.style.top = `${y}px`;
      popupEl.style.display = 'flex';
    });
  };

  const initialRef = getRef();
  if (initialRef) {
    cleanup = autoUpdate(initialRef, popupEl, () => update());
  }

  return {
    update,
    destroy: () => {
      cleanup?.();
      popupEl.style.display = 'none';
    },
  };
};

export const getSelectionRect = (): DOMRect | null => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  return range.getBoundingClientRect();
};

export const getNodeRect = (node: Node): DOMRect | null => {
  if (node instanceof Element) return node.getBoundingClientRect();
  const range = document.createRange();
  range.selectNode(node);
  return range.getBoundingClientRect();
};