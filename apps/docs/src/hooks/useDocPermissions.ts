import { useCallback, useEffect, useMemo, useState } from 'react';
import { listGrantsByDoc, subscribeGrantsChanged } from '@/services/docGrants.service';
import type { DocGrant } from '@/types/permissions.types';
import { createDocAbility, getHighestRole, type DocAbility } from '@/utils/permissions.utils';

interface UseDocPermissionsResult {
  grants: DocGrant[];
  myRole: ReturnType<typeof getHighestRole>;
  ability: DocAbility;
  can: (action: Parameters<DocAbility['can']>[0]) => boolean;
  reload: () => Promise<void>;
}

export const useDocPermissions = (
  docId: string | null | undefined,
  userId?: string,
): UseDocPermissionsResult => {
  const [grants, setGrants] = useState<DocGrant[]>([]);

  const reload = useCallback(async () => {
    if (!docId) {
      setGrants([]);
      return;
    }
    try {
      setGrants(await listGrantsByDoc(docId));
    } catch (err) {
      console.warn('[useDocPermissions] Failed to load grants:', err);
      setGrants([]);
    }
  }, [docId]);

  useEffect(() => {
    void reload();
    return docId ? subscribeGrantsChanged(docId, () => void reload()) : undefined;
  }, [reload]);

  const myRole = useMemo(() => getHighestRole(grants, userId), [grants, userId]);
  const ability = useMemo(() => createDocAbility(grants, userId), [grants, userId]);
  const can = useCallback((action: Parameters<DocAbility['can']>[0]) => ability.can(action, 'Doc'), [ability]);

  return { grants, myRole, ability, can, reload };
};
