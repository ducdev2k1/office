import { describe, expect, it } from 'vitest';
import type { CollabUser } from '@office/collab-core';

describe('Follow Collaborator Logic', () => {
  const mockUser1: CollabUser = {
    id: 'user-1',
    name: 'Alice',
    color: '#2563eb',
    clientId: 101,
  };

  const mockUser2: CollabUser = {
    id: 'user-2',
    name: 'Bob',
    color: '#16a34a',
    clientId: 102,
  };

  it('correctly matches followed collaborator by clientId', () => {
    const collaborators = [mockUser1, mockUser2];
    const followedClientId = 101;
    const followed = collaborators.find((c) => c.clientId === followedClientId) ?? null;

    expect(followed).not.toBeNull();
    expect(followed?.name).toBe('Alice');
  });

  it('returns null when target clientId is not in collaborators list', () => {
    const collaborators = [mockUser2];
    const followedClientId = 101;
    const followed = collaborators.find((c) => c.clientId === followedClientId) ?? null;

    expect(followed).toBeNull();
  });

  it('handles follow toggling logic', () => {
    let followedClientId: number | null = null;

    const toggleFollow = (user: CollabUser) => {
      if (!user.clientId) return;
      if (followedClientId === user.clientId) {
        followedClientId = null;
      } else {
        followedClientId = user.clientId;
      }
    };

    toggleFollow(mockUser1);
    expect(followedClientId).toBe(101);

    toggleFollow(mockUser1);
    expect(followedClientId).toBeNull();

    toggleFollow(mockUser2);
    expect(followedClientId).toBe(102);
  });
});
