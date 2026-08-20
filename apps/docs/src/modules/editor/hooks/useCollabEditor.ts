import { useEffect, useMemo, useState } from 'react';
import { useCollabAwareness, useCollabRoom, useCollabStatus } from '@office/collab-core';
import { CommentsStore, type CommentThread } from '@office/tiptap-extensions';
import { useCurrentUserProfile } from '@/modules/collab';
import { useDocsEditor } from '@/modules/editor/hooks/useDocsEditor';
import type { DocRecord } from '@/types/docs.types';

export const useCollabEditor = (
  activeDoc: DocRecord | undefined,
  updateContent: (html: string) => void,
  isReadOnly = false,
  onSelectCommentThread?: (threadId: string) => void,
) => {
  const { profile: currentUser, updateProfile } = useCurrentUserProfile();

  const collabRoomConfig = useMemo(() => {
    if (!activeDoc?.id) return null;
    return {
      docId: activeDoc.id,
      user: currentUser,
      readOnly: isReadOnly,
    };
  }, [activeDoc?.id, currentUser, isReadOnly]);

  const collabRoom = useCollabRoom(collabRoomConfig);
  const { status: collabStatus, isSynced } = useCollabStatus(collabRoom.provider);
  const { collaborators, presences } = useCollabAwareness(collabRoom.provider);

  const commentsStore = useMemo(
    () => new CommentsStore(collabRoom.doc),
    [collabRoom.doc],
  );
  const [threads, setThreads] = useState<CommentThread[]>(() => commentsStore.getThreads());

  useEffect(() => {
    commentsStore.setYDoc(collabRoom.doc);
    setThreads(commentsStore.getThreads());

    const unsubscribe = commentsStore.subscribe(() => {
      setThreads([...commentsStore.getThreads()]);
    });
    return unsubscribe;
  }, [commentsStore, collabRoom.doc]);

  const collabConfig = useMemo(() => {
    if (!collabRoom.doc || !collabRoom.provider) return null;
    const users = () =>
      collaborators
        .filter((c) => c.name)
        .map((c) => ({ id: c.id, name: c.name }));
    return {
      ydoc: collabRoom.doc,
      provider: collabRoom.provider,
      user: currentUser,
      users,
    };
  }, [collabRoom.doc, collabRoom.provider, currentUser, collaborators]);

  const editor = useDocsEditor(
    activeDoc?.id ?? '',
    activeDoc?.content ?? '',
    updateContent,
    collabConfig,
    commentsStore,
    onSelectCommentThread,
  );

  // Periodic offline local cache update (only when editing)
  useEffect(() => {
    if (!editor || !collabConfig || isReadOnly) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const handleUpdate = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!editor.isDestroyed) {
          updateContent(editor.getHTML());
        }
      }, 2000);
    };

    editor.on('update', handleUpdate);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      editor.off('update', handleUpdate);
    };
  }, [editor, collabConfig, updateContent, isReadOnly]);

  return {
    editor,
    collabStatus,
    isSynced,
    collaborators,
    presences,
    currentUser,
    updateProfile,
    collabRoom,
    commentsStore,
    threads,
  };
};
