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
  { placement = 'bottom-start', strategy = 'absolute', offset: offsetVal = 6, anchor, reference }: PopupOptions,
): PopupController => {
  const refEl = reference ?? (anchor ? ({ getBoundingClientRect: () => anchor } as HTMLElement) : null);
  if (!refEl) {
    popupEl.style.display = 'none';
    return { update: () => {}, destroy: () => {} };
  }

  let cleanup: (() => void) | null = null;

  const update = (nextAnchor?: DOMRect | null) => {
    if (!refEl) return;
    const rect = nextAnchor ?? anchor;
    if (!rect) {
      popupEl.style.display = 'none';
      return;
    }
    const fakeEl = { getBoundingClientRect: () => rect } as HTMLElement;
    void computePosition(fakeEl, popupEl, {
      placement,
      strategy,
      middleware: [offset(offsetVal), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      popupEl.style.left = `${x}px`;
      popupEl.style.top = `${y}px`;
      popupEl.style.display = 'block';
    });
  };

  if (anchor) {
    cleanup = autoUpdate(refEl, popupEl, () => update());
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