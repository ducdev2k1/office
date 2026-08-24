import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';

const STATS_DEBOUNCE_MS = 600;
const IDLE_TIMEOUT_MS = 300;

interface DocStats {
  wordCount: number;
  charCount: number;
}

export const useDocStats = (editor: Editor | null): DocStats => {
  const [stats, setStats] = useState<DocStats>({ wordCount: 0, charCount: 0 });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    let timer: number | null = null;
    let idleHandle: number | null = null;
    let cancelled = false;

    const compute = () => {
      if (cancelled || editor.isDestroyed) return;
      const counter = (
        editor.storage as {
          characterCount?: { words?: () => number; characters?: () => number };
        }
      ).characterCount;
      if (!counter) return;
      setStats({
        wordCount: counter.words?.() ?? 0,
        charCount: counter.characters?.() ?? 0,
      });
    };

    const schedule = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
        compute();
      }, STATS_DEBOUNCE_MS);
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

  return stats;
};
