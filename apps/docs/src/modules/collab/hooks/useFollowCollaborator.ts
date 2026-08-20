import type { Editor } from '@tiptap/core';
import type { CollabUser, HocuspocusProvider } from '@office/collab-core';
import { useCallback, useEffect, useRef, useState } from 'react';

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

    // 3. By user name in label
    if (targetUser?.name) {
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

  // Scroll smoothly to followed user's cursor
  const scrollToTarget = useCallback(() => {
    if (typeof document === 'undefined') return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const caret = findCaretElement();

      // Update following class
      document
        .querySelectorAll('.collaboration-cursor--following')
        .forEach((el) => {
          if (el !== caret) el.classList.remove('collaboration-cursor--following');
        });

      if (caret) {
        caret.classList.add('collaboration-cursor--following');

        const paperWrap = document.querySelector('.paper-wrap') as HTMLElement | null;
        if (paperWrap) {
          const wrapRect = paperWrap.getBoundingClientRect();
          const caretRect = caret.getBoundingClientRect();
          const targetScrollTop =
            paperWrap.scrollTop + (caretRect.top - wrapRect.top) - wrapRect.height / 2;

          paperWrap.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth',
          });
        }
      }
    });
  }, [findCaretElement]);

  const startFollow = useCallback(
    (user: CollabUser) => {
      if (!user.clientId) return;
      setFollowedClientId(user.clientId);
      followedClientIdRef.current = user.clientId;
      followedUserRef.current = user;

      // Immediate attempt + follow-up retries to catch newly rendered cursor DOM
      scrollToTarget();
      setTimeout(scrollToTarget, 60);
      setTimeout(scrollToTarget, 180);
      setTimeout(scrollToTarget, 350);
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
        scrollToTarget();
      }
    };

    scrollToTarget();
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
        scrollToTarget();
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
      // Do not break if clicking follow banner or avatar
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
      // Modifier keys don't break follow
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
