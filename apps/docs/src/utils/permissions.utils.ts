import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability';
import { ROLE_RANK, type DocGrant, type DocRole } from '@/types/permissions.types';

export type DocAction = 'read' | 'update' | 'comment' | 'manageHistory' | 'share' | 'delete';

export type DocAccessMode = 'view' | 'comment' | 'edit';

export type DocAbility = MongoAbility<[DocAction | 'manage', 'Doc']>;

const ROLE_ACTIONS: Record<Exclude<DocRole, 'owner'>, readonly DocAction[]> = {
  editor: ['read', 'update', 'comment', 'manageHistory'],
  commenter: ['read', 'comment', 'manageHistory'],
  viewer: ['read'],
};

const grantToActions = (role: DocRole): readonly (DocAction | 'manage')[] =>
  role === 'owner' ? ['manage'] : ROLE_ACTIONS[role];

export const getHighestRole = (grants: readonly DocGrant[], userId?: string): DocRole | null => {
  if (!userId) return null;
  const roles = grants.filter((grant) => grant.userId === userId).map((grant) => grant.role);
  if (roles.length === 0) return null;
  return roles.reduce((best, role) => (ROLE_RANK[role] > ROLE_RANK[best] ? role : best));
};

export const createDocAbility = (grants: readonly DocGrant[], userId?: string): DocAbility => {
  const { can, build } = new AbilityBuilder<DocAbility>(createMongoAbility);
  const role = getHighestRole(grants, userId);
  for (const action of role ? grantToActions(role) : []) {
    can(action, 'Doc');
  }
  return build();
};

export const restrictAccessMode = (
  requested: DocAccessMode,
  grants: readonly DocGrant[],
  userId?: string,
): DocAccessMode => {
  const role = getHighestRole(grants, userId);
  if (!role || role === 'viewer') return 'view';
  if (role === 'commenter') return requested === 'view' ? 'view' : 'comment';
  return requested;
};

export const isOwner = (grants: readonly DocGrant[], userId?: string): boolean =>
  getHighestRole(grants, userId) === 'owner';
