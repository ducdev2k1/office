import type { Editor } from '@tiptap/core';
import type { CollabUser, HocuspocusProvider } from '@office/collab-core';
import { relativePositionToAbsolutePosition, ySyncPluginKey } from '@tiptap/y-tiptap';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';

interface UseFollowCollaboratorOptions {
  editor: Editor | null;
  provider: HocuspocusProvider | null | undefined;
  collaborators: CollabUser[];
}

export const useFollowCollaborator = ({
  editor,
  provider,
  collaborators,
}: UseFollowCollaboratorOptions) => {
  const [followedClientId, setFollowedClientId] = useState<number | null>(null);
  const followedClientIdRef = useRef<number | null>(null);
  followedClientIdRef.current = followedClientId;

  const followedUser =
    collaborators.find((c) => c.clientId === followedClientId) ?? null;
  const followedUserRef = useRef<CollabUser | null>(null);
  followedUserRef.current = followedUser;

  const rafIdRef = useRef<number | null>(null);

  const stopFollow = useCallback(() => {
    setFollowedClientId(null);
    followedClientIdRef.current = null;
    followedUserRef.current = null;
    if (typeof document !== 'undefined') {
      document
        .querySelectorAll('.collaboration-cursor--following')
        .forEach((el) => el.classList.remove('collaboration-cursor--following'));
    }
  }, []);

  const findCaretElement = useCallback((): HTMLElement | null => {
    if (typeof document === 'undefined') return null;
    const targetId = followedClientIdRef.current;
    const targetUser = followedUserRef.current;
    if (!targetId && !targetUser) return null;

    // 1. By clientId attribute
    if (targetId) {
      const byClientId = document.querySelector(
        `.collaboration-cursor__caret[data-client-id="${targetId}"]`,
      ) as HTMLElement | null;
      if (byClientId) return byClientId;
    }

    // 2. By userId attribute
    if (targetUser?.id) {
      const byUserId = document.querySelector(
        `.collaboration-cursor__caret[data-user-id="${targetUser.id}"]`,
      ) as HTMLElement | null;
      if (byUserId) return byUserId;
    }

    // 3. By user name attribute or label text
    if (targetUser?.name) {
      const byUserName = document.querySelector(
        `.collaboration-cursor__caret[data-user-name="${targetUser.name}"]`,
      ) as HTMLElement | null;
      if (byUserName) return byUserName;

      const allCarets = Array.from(
        document.querySelectorAll('.collaboration-cursor__caret'),
      ) as HTMLElement[];
      const matched = allCarets.find((caret) => {
        const label = caret.querySelector('.collaboration-cursor__label');
        return label?.textContent?.trim() === targetUser.name.trim();
      });
      if (matched) return matched;
    }

    return null;
  }, []);

  // Compute exact target screen top position
  const getTargetScrollTop = useCallback((): number | null => {
    if (typeof document === 'undefined') return null;
    const paperWrap = document.querySelector('.paper-wrap') as HTMLElement | null;
    if (!paperWrap) return null;

    const wrapRect = paperWrap.getBoundingClientRect();

    // 1. Try DOM caret element
    const caret = findCaretElement();
    if (caret) {
      const caretRect = caret.getBoundingClientRect();
      if (caretRect.height > 0 || caretRect.top > 0) {
        return (
          paperWrap.scrollTop + (caretRect.top - wrapRect.top) - wrapRect.height / 2
        );
      }
    }

    // 2. Try Yjs awareness relative cursor position -> ProseMirror coordinates
    const targetId = followedClientIdRef.current;
    if (editor && provider?.awareness && provider?.document && targetId) {
      const state = provider.awareness.getStates().get(targetId) as
        | { cursor?: { anchor?: Y.RelativePosition; head?: Y.RelativePosition } }
        | undefined;

      const relPos = state?.cursor?.head ?? state?.cursor?.anchor;
      if (relPos) {
        try {
          const ystate = ySyncPluginKey.getState(editor.state);
          let absPos: number | null = null;
          if (ystate?.binding?.mapping && ystate?.type) {
            absPos = relativePositionToAbsolutePosition(
              ystate.doc,
              ystate.type,
              relPos,
              ystate.binding.mapping,
            );
          }

          if (absPos === null || absPos === undefined) {
            const decoded = Y.createAbsolutePositionFromRelativePosition(
              relPos,
              provider.document,
            );
            if (decoded && typeof decoded.index === 'number') {
              absPos = decoded.index;
            }
          }

          if (typeof absPos === 'number' && absPos >= 0) {
            const maxPos = editor.state.doc.content.size;
            const clampedPos = Math.max(0, Math.min(absPos, maxPos));
            const coords = editor.view.coordsAtPos(clampedPos);
            if (coords && (coords.top > 0 || coords.bottom > 0)) {
              return (
                paperWrap.scrollTop + (coords.top - wrapRect.top) - wrapRect.height / 2
              );
            }
          }
        } catch {
          // Ignore pos decoding fallback error
        }
      }
    }

    return null;
  }, [editor, findCaretElement, provider]);

  // Scroll smoothly to followed user's cursor
  const scrollToTarget = useCallback(
    (smooth = true) => {
      if (typeof document === 'undefined') return;

      const caret = findCaretElement();
      document
        .querySelectorAll('.collaboration-cursor--following')
        .forEach((el) => {
          if (el !== caret) el.classList.remove('collaboration-cursor--following');
        });

      if (caret) {
        caret.classList.add('collaboration-cursor--following');
      }

      const targetScrollTop = getTargetScrollTop();
      if (targetScrollTop !== null) {
        const paperWrap = document.querySelector('.paper-wrap') as HTMLElement | null;
        if (paperWrap) {
          paperWrap.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: smooth ? 'smooth' : 'auto',
          });
        }
      }
    },
    [findCaretElement, getTargetScrollTop],
  );

  const startFollow = useCallback(
    (user: CollabUser) => {
      if (!user.clientId) return;
      setFollowedClientId(user.clientId);
      followedClientIdRef.current = user.clientId;
      followedUserRef.current = user;

      // Immediate synchronous jump + smooth retries to ensure exact centering
      scrollToTarget(false);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        scrollToTarget(true);
      });
      setTimeout(() => scrollToTarget(true), 60);
      setTimeout(() => scrollToTarget(true), 150);
      setTimeout(() => scrollToTarget(true), 300);
    },
    [scrollToTarget],
  );

  const toggleFollow = useCallback(
    (user: CollabUser) => {
      if (!user.clientId) return;
      if (followedClientIdRef.current === user.clientId) {
        stopFollow();
      } else {
        startFollow(user);
      }
    },
    [startFollow, stopFollow],
  );

  // Handle follow tracking when awareness updates
  useEffect(() => {
    if (!provider?.awareness || !followedClientId) return;

    const awareness = provider.awareness;
    const handleAwarenessUpdate = () => {
      if (followedClientIdRef.current) {
        scrollToTarget(true);
      }
    };

    scrollToTarget(true);
    awareness.on('change', handleAwarenessUpdate);

    return () => {
      awareness.off('change', handleAwarenessUpdate);
    };
  }, [provider, followedClientId, scrollToTarget]);

  // Track editor transactions
  useEffect(() => {
    if (!editor || !followedClientId) return;

    const handleTransaction = () => {
      if (followedClientIdRef.current) {
        scrollToTarget(true);
      }
    };

    editor.on('transaction', handleTransaction);
    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor, followedClientId, scrollToTarget]);

  // Break follow on manual user interaction
  useEffect(() => {
    if (!followedClientId || typeof window === 'undefined') return;

    const handleManualScroll = () => {
      stopFollow();
    };

    const handleEditorMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('.follow-banner') ||
        target?.closest('.collaborator-avatar-btn')
      ) {
        return;
      }
      stopFollow();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        stopFollow();
        return;
      }
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }
      stopFollow();
    };

    window.addEventListener('wheel', handleManualScroll, { passive: true });
    window.addEventListener('touchmove', handleManualScroll, { passive: true });
    window.addEventListener('mousedown', handleEditorMouseDown, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('wheel', handleManualScroll);
      window.removeEventListener('touchmove', handleManualScroll);
      window.removeEventListener('mousedown', handleEditorMouseDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [followedClientId, stopFollow]);

  // If followed user leaves room, stop follow
  useEffect(() => {
    if (followedClientId && !followedUser) {
      stopFollow();
    }
  }, [followedClientId, followedUser, stopFollow]);

  return {
    followedUser,
    followedClientId,
    startFollow,
    stopFollow,
    toggleFollow,
  };
};
