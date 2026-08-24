import { describe, expect, it } from 'vitest';
import type { DocGrant, DocRole } from '@/types/permissions.types';
import {
  createDocAbility,
  getHighestRole,
  isOwner,
  restrictAccessMode,
} from '@/utils/permissions.utils';

const makeGrant = (
  userId: string,
  role: DocRole,
  docId = 'doc-1',
  id = `grant-${userId}-${role}`,
): DocGrant => {
  const now = new Date().toISOString();
  return {
    id,
    title: userId,
    updatedAt: now,
    docId,
    userId,
    userName: userId,
    role,
    grantedAt: now,
  };
};

describe('getHighestRole', () => {
  it('returns null when user has no grant', () => {
    expect(getHighestRole([makeGrant('u1', 'editor')], 'u2')).toBeNull();
    expect(getHighestRole([], 'u1')).toBeNull();
    expect(getHighestRole([makeGrant('u1', 'viewer')], undefined)).toBeNull();
  });

  it('returns the strongest role among multiple grants', () => {
    const grants = [makeGrant('u1', 'viewer'), makeGrant('u1', 'owner')];
    expect(getHighestRole(grants, 'u1')).toBe('owner');
    const mixed = [
      makeGrant('u2', 'commenter'),
      makeGrant('u2', 'viewer'),
      makeGrant('u2', 'editor'),
    ];
    expect(getHighestRole(mixed, 'u2')).toBe('editor');
  });
});

describe('createDocAbility', () => {
  it('grants owner full management including share and delete', () => {
    const ability = createDocAbility([makeGrant('u1', 'owner')], 'u1');
    for (const action of ['update', 'share', 'delete', 'comment', 'manageHistory', 'read'] as const) {
      expect(ability.can(action, 'Doc')).toBe(true);
    }
  });

  it('allows editor to update but not share or delete', () => {
    const ability = createDocAbility([makeGrant('u1', 'editor')], 'u1');
    expect(ability.can('read', 'Doc')).toBe(true);
    expect(ability.can('update', 'Doc')).toBe(true);
    expect(ability.can('comment', 'Doc')).toBe(true);
    expect(ability.can('manageHistory', 'Doc')).toBe(true);
    expect(ability.can('share', 'Doc')).toBe(false);
    expect(ability.can('delete', 'Doc')).toBe(false);
  });

  it('restricts commenter to read and comment only', () => {
    const ability = createDocAbility([makeGrant('u1', 'commenter')], 'u1');
    expect(ability.can('read', 'Doc')).toBe(true);
    expect(ability.can('comment', 'Doc')).toBe(true);
    expect(ability.can('update', 'Doc')).toBe(false);
    expect(ability.can('share', 'Doc')).toBe(false);
  });

  it('gives viewer read-only access', () => {
    const ability = createDocAbility([makeGrant('u1', 'viewer')], 'u1');
    expect(ability.can('read', 'Doc')).toBe(true);
    expect(ability.can('update', 'Doc')).toBe(false);
    expect(ability.can('comment', 'Doc')).toBe(false);
  });

  it('denies everything for users without a grant', () => {
    const ability = createDocAbility([makeGrant('u1', 'editor')], 'stranger');
    expect(ability.can('read', 'Doc')).toBe(false);
    expect(ability.can('update', 'Doc')).toBe(false);
  });
});

describe('isOwner', () => {
  it('is true only for the owner', () => {
    expect(isOwner([makeGrant('u1', 'owner')], 'u1')).toBe(true);
    expect(isOwner([makeGrant('u1', 'editor')], 'u1')).toBe(false);
  });
});

describe('restrictAccessMode', () => {
  const grantsFor = (role: DocRole) => [makeGrant('u1', role)];

  it('keeps requested mode for owner and editor', () => {
    expect(restrictAccessMode('edit', grantsFor('owner'), 'u1')).toBe('edit');
    expect(restrictAccessMode('view', grantsFor('owner'), 'u1')).toBe('view');
    expect(restrictAccessMode('comment', grantsFor('editor'), 'u1')).toBe('comment');
    expect(restrictAccessMode('edit', grantsFor('editor'), 'u1')).toBe('edit');
  });

  it('caps commenter at comment mode', () => {
    expect(restrictAccessMode('edit', grantsFor('commenter'), 'u1')).toBe('comment');
    expect(restrictAccessMode('view', grantsFor('commenter'), 'u1')).toBe('view');
  });

  it('forces view mode for viewer and uninvited users', () => {
    expect(restrictAccessMode('edit', grantsFor('viewer'), 'u1')).toBe('view');
    expect(restrictAccessMode('edit', [], 'u1')).toBe('view');
    expect(restrictAccessMode('edit', grantsFor('owner'), undefined)).toBe('view');
  });
});
