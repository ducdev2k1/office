import { useEffect, useMemo, useState } from 'react';
import type * as Y from 'yjs';
import { CommentsStore, type CommentThread } from '@office/tiptap-extensions';

export const useComments = (ydoc?: Y.Doc | null) => {
  const commentsStore = useMemo(() => new CommentsStore(ydoc), [ydoc]);
  const [threads, setThreads] = useState<CommentThread[]>(() => commentsStore.getThreads());

  useEffect(() => {
    commentsStore.setYDoc(ydoc);
    setThreads(commentsStore.getThreads());

    const unsubscribe = commentsStore.subscribe(() => {
      setThreads([...commentsStore.getThreads()]);
    });
    return unsubscribe;
  }, [commentsStore, ydoc]);

  return {
    commentsStore,
    threads,
  };
};
