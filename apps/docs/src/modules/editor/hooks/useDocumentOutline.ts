import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { getOutlineFromDoc } from '@/utils/outline.utils';
import type { OutlineItem } from '@/types/common.types';

const OUTLINE_DEBOUNCE_MS = 800;
const IDLE_TIMEOUT_MS = 300;

export const useDocumentOutline = (editor: Editor | null): OutlineItem[] => {
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    let timer: number | null = null;
    let idleHandle: number | null = null;
    let cancelled = false;

    const compute = () => {
      if (cancelled || editor.isDestroyed) return;
      setOutline(getOutlineFromDoc(editor.state.doc));
    };

    const schedule = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
        compute();
      }, OUTLINE_DEBOUNCE_MS);
    };

    idleHandle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(compute, { timeout: IDLE_TIMEOUT_MS })
        : (window.setTimeout(compute, 50) as unknown as number);

    editor.on('update', schedule);
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
      if (idleHandle !== null) {
        if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle);
        else window.clearTimeout(idleHandle);
      }
      editor.off('update', schedule);
    };
  }, [editor]);

  return outline;
};
