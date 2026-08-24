import type { StoredDocument } from '@office/storage-adapter';

export type DocRole = 'owner' | 'editor' | 'commenter' | 'viewer';

export const DOC_ROLES: readonly DocRole[] = ['owner', 'editor', 'commenter', 'viewer'];

export interface DocGrant extends StoredDocument {
  docId: string;
  userId: string;
  userName: string;
  role: DocRole;
  grantedAt: string;
}

export const ROLE_RANK: Record<DocRole, number> = {
  owner: 3,
  editor: 2,
  commenter: 1,
  viewer: 0,
};
