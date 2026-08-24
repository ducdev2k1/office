import { createDocumentStore } from '@office/storage-adapter';
import type { CollabUser } from '@office/collab-core';
import type { DocGrant, DocRole } from '@/types/permissions.types';

export interface DocGrantDraft {
  userId: string;
  userName: string;
  role: DocRole;
}

export const docGrantsStore = createDocumentStore<DocGrant>('doc-grants');

const GRANTS_CHANGED_EVENT = 'office-doc-grants-changed';

export const notifyGrantsChanged = (docId: string): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(GRANTS_CHANGED_EVENT, { detail: { docId } }));
};

export const subscribeGrantsChanged = (docId: string, listener: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ docId: string }>).detail;
    if (detail?.docId === docId) listener();
  };
  window.addEventListener(GRANTS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(GRANTS_CHANGED_EVENT, handler);
};

export const listGrantsByDoc = async (docId: string): Promise<DocGrant[]> => {
  const all = await docGrantsStore.list();
  return all
    .filter((grant) => grant.docId === docId)
    .sort((a, b) => (a.grantedAt < b.grantedAt ? -1 : 1));
};

export const ensureOwnerGrant = async (docId: string, user: CollabUser): Promise<void> => {
  const grants = await listGrantsByDoc(docId);
  if (grants.length > 0) return;
  const now = new Date().toISOString();
  await docGrantsStore.put({
    id: `grant-${crypto.randomUUID()}`,
    title: user.name,
    updatedAt: now,
    docId,
    userId: user.id,
    userName: user.name,
    role: 'owner',
    grantedAt: now,
  });
  notifyGrantsChanged(docId);
};

export const addGrant = async (docId: string, draft: DocGrantDraft): Promise<void> => {
  const now = new Date().toISOString();
  const grants = await listGrantsByDoc(docId);
  const existing = grants.find((grant) => grant.userId === draft.userId);
  if (existing) {
    await docGrantsStore.put({ ...existing, ...draft, title: draft.userName, updatedAt: now });
    notifyGrantsChanged(docId);
    return;
  }
  await docGrantsStore.put({
    id: `grant-${crypto.randomUUID()}`,
    title: draft.userName,
    updatedAt: now,
    docId,
    grantedAt: now,
    ...draft,
  });
  notifyGrantsChanged(docId);
};

const countOwnersExcluding = async (docId: string, grantId: string): Promise<number> => {
  const grants = await listGrantsByDoc(docId);
  return grants.filter((grant) => grant.role === 'owner' && grant.id !== grantId).length;
};

export const updateGrantRole = async (docId: string, grantId: string, role: DocRole): Promise<void> => {
  const ownersLeft = await countOwnersExcluding(docId, grantId);
  if (role !== 'owner' && ownersLeft === 0) {
    throw new Error('A document must keep at least one owner');
  }
  const grant = await docGrantsStore.get(grantId);
  if (!grant) throw new Error('Grant not found');
  await docGrantsStore.put({ ...grant, role, updatedAt: new Date().toISOString() });
  notifyGrantsChanged(docId);
};

export const removeGrant = async (docId: string, grantId: string): Promise<void> => {
  const ownersLeft = await countOwnersExcluding(docId, grantId);
  if (ownersLeft === 0) {
    throw new Error('A document must keep at least one owner');
  }
  await docGrantsStore.delete(grantId);
  notifyGrantsChanged(docId);
};
