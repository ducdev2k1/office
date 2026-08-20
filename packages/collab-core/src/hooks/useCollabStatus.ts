import type { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect, useState } from 'react';
import type { CollabStatus } from '../types/collab.types';

export interface CollabStatusResult {
  status: CollabStatus;
  isSynced: boolean;
}

export const useCollabStatus = (
  provider: HocuspocusProvider | null | undefined,
): CollabStatusResult => {
  const [statusState, setStatusState] = useState<CollabStatusResult>({
    status: provider?.status === 'connected' ? 'connected' : 'connecting',
    isSynced: provider?.isSynced ?? false,
  });

  useEffect(() => {
    if (!provider) {
      setStatusState({ status: 'disconnected', isSynced: false });
      return;
    }

    const onStatus = ({ status }: { status: string }) => {
      setStatusState((prev) => ({
        ...prev,
        status:
          status === 'connected'
            ? 'connected'
            : status === 'connecting'
              ? 'connecting'
              : 'disconnected',
      }));
    };

    const onSynced = ({ state }: { state: boolean }) => {
      setStatusState((prev) => ({
        ...prev,
        isSynced: state,
      }));
    };

    provider.on('status', onStatus);
    provider.on('synced', onSynced);

    return () => {
      provider.off('status', onStatus);
      provider.off('synced', onSynced);
    };
  }, [provider]);

  return statusState;
};
