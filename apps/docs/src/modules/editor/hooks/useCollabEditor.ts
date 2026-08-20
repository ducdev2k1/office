import { useEffect, useMemo } from 'react';
import { useCollabAwareness, useCollabRoom, useCollabStatus } from '@office/collab-core';
import { useCurrentUserProfile } from '@/modules/collab';
import { useDocsEditor } from '@/modules/editor/hooks/useDocsEditor';
import type { DocRecord } from '@/types/docs.types';

export const useCollabEditor = (
  activeDoc: DocRecord | undefined,
  updateContent: (html: string) => void,
) => {
  const { profile: currentUser, updateProfile } = useCurrentUserProfile();

  const collabRoomConfig = useMemo(() => {
    if (!activeDoc?.id) return null;
    return {
      docId: activeDoc.id,
      user: currentUser,
    };
  }, [activeDoc?.id, currentUser]);

  const collabRoom = useCollabRoom(collabRoomConfig);
  const { status: collabStatus, isSynced } = useCollabStatus(collabRoom.provider);
  const { collaborators, presences } = useCollabAwareness(collabRoom.provider);

  const collabConfig = useMemo(() => {
    if (!collabRoom.doc || !collabRoom.provider) return null;
    return {
      ydoc: collabRoom.doc,
      provider: collabRoom.provider,
      user: currentUser,
    };
  }, [collabRoom.doc, collabRoom.provider, currentUser]);

  const editor = useDocsEditor(
    activeDoc?.id ?? '',
    activeDoc?.content ?? '',
    updateContent,
    collabConfig,
  );

  // Periodic offline local cache update
  useEffect(() => {
    if (!editor || !collabConfig) return;

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
  }, [editor, collabConfig, updateContent]);

  return {
    editor,
    collabStatus,
    isSynced,
    collaborators,
    presences,
    currentUser,
    updateProfile,
    collabRoom,
  };
};
