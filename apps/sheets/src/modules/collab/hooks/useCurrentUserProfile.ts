import { useCallback, useState } from 'react';
import { getRandomUserColor, sanitizeCollabUser, type CollabUser } from '@office/collab-core';

const STORAGE_KEY = 'onemail_collab_profile';

const getInitialProfile = (): CollabUser => {
  if (typeof window === 'undefined') {
    return sanitizeCollabUser({ id: 'user-default', name: 'User' });
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CollabUser>;
      return sanitizeCollabUser(parsed);
    }
  } catch (err) {
    console.warn('[useCurrentUserProfile] Failed to read cached profile:', err);
  }

  const randomId = `user-${Math.random().toString(36).slice(2, 9)}`;
  const randomNum = Math.floor(100 + Math.random() * 900);
  const defaultUser: CollabUser = {
    id: randomId,
    name: `User ${randomNum}`,
    color: getRandomUserColor(randomId),
  };

  const clean = sanitizeCollabUser(defaultUser);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.warn('[useCurrentUserProfile] Failed to save initial profile:', err);
  }

  return clean;
};

export const useCurrentUserProfile = () => {
  const [profile, setProfile] = useState<CollabUser>(getInitialProfile);

  const updateProfile = useCallback((partial: Partial<CollabUser>) => {
    setProfile((prev: CollabUser) => {
      const next = sanitizeCollabUser({
        ...prev,
        ...partial,
        id: prev.id, // Preserve consistent user ID
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('[useCurrentUserProfile] Failed to persist profile update:', err);
      }
      return next;
    });
  }, []);

  return {
    profile,
    updateProfile,
  };
};
