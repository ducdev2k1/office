import type { CollabUser } from '../types/collab.types';
import { getInitials, getRandomUserColor } from './color.utils';

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const escapeHtmlText = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const sanitizeCollabUser = (rawUser: Partial<CollabUser> | null | undefined): CollabUser => {
  const id =
    rawUser?.id && typeof rawUser.id === 'string' && rawUser.id.trim()
      ? rawUser.id.trim().slice(0, 64)
      : `user-${Math.random().toString(36).slice(2, 9)}`;

  const rawName =
    rawUser?.name && typeof rawUser.name === 'string' ? rawUser.name.trim() : 'Anonymous';

  // Strip tags and limit name length
  const cleanName =
    rawName
      .replace(/<[^>]*>?/gm, '')
      .slice(0, 50)
      .trim() || 'Anonymous';

  const rawColor = rawUser?.color && typeof rawUser.color === 'string' ? rawUser.color.trim() : '';
  const color = HEX_COLOR_REGEX.test(rawColor) ? rawColor : getRandomUserColor(id);

  let avatarUrl: string | undefined = undefined;
  if (rawUser?.avatarUrl && typeof rawUser.avatarUrl === 'string') {
    const trimmed = rawUser.avatarUrl.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
      avatarUrl = trimmed;
    }
  }

  const initials =
    rawUser?.initials && typeof rawUser.initials === 'string' && rawUser.initials.trim()
      ? rawUser.initials.trim().slice(0, 4).toUpperCase()
      : getInitials(cleanName);

  return {
    id,
    name: cleanName,
    color,
    avatarUrl,
    initials,
  };
};
