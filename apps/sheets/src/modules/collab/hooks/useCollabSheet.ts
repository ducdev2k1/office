import type { ChartSpec } from '@/modules/charts/types/charts.types';
import { useCurrentUserProfile } from '@/modules/collab/hooks/useCurrentUserProfile';
import type {
  CollabSheetConfig,
  SheetCollaboratorPresence,
  SheetCollaboratorSelection,
  UseCollabSheetReturn,
} from '@/modules/collab/types/collab.types';
import {
  exportWorkbookFromYDoc,
  initYDocFromWorkbook,
  syncLocalChartsToYDoc,
  syncLocalWorkbookToYDoc,
} from '@/modules/collab/utils/sheetYjsSync.utils';
import { useCollabAwareness, useCollabRoom, useCollabStatus } from '@office/collab-core';
import type { IWorkbookData } from '@univerjs/presets';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseCollabSheetOptions extends CollabSheetConfig {
  onRemoteDataChange?: (workbook: IWorkbookData, charts: ChartSpec[]) => void;
}

export const useCollabSheet = ({
  docId,
  initialData,
  initialCharts = [],
  readOnly = false,
  onRemoteDataChange,
}: UseCollabSheetOptions): UseCollabSheetReturn => {
  const { profile: currentUser, updateProfile } = useCurrentUserProfile();
  const onRemoteChangeRef = useRef(onRemoteDataChange);
  const isApplyingRemoteRef = useRef(false);

  useEffect(() => {
    onRemoteChangeRef.current = onRemoteDataChange;
  }, [onRemoteDataChange]);

  const collabRoomConfig = useMemo(() => {
    if (!docId) return null;
    return {
      docId,
      user: currentUser,
      readOnly,
    };
  }, [docId, currentUser, readOnly]);

  const collabRoom = useCollabRoom(collabRoomConfig);
  const { status: collabStatus, isSynced } = useCollabStatus(collabRoom.provider);
  const { collaborators } = useCollabAwareness(collabRoom.provider);
  const [presences, setPresences] = useState<SheetCollaboratorPresence[]>([]);

  // 1. Initialise YDoc when room syncs
  useEffect(() => {
    if (!collabRoom.doc || !isSynced) return;

    const doc = collabRoom.doc;
    const exported = exportWorkbookFromYDoc(doc);
    if (!exported && initialData) {
      initYDocFromWorkbook(doc, initialData, initialCharts);
    } else if (exported && onRemoteChangeRef.current) {
      isApplyingRemoteRef.current = true;
      onRemoteChangeRef.current(exported.workbook, exported.charts);
      window.setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 300);
    }
  }, [collabRoom.doc, isSynced, initialData, initialCharts]);

  // 2. Observe remote changes from YDoc
  useEffect(() => {
    if (!collabRoom.doc) return;
    const doc = collabRoom.doc;
    const rootMap = doc.getMap('sheet_root');

    let debounceTimer: number | null = null;
    const observer = () => {
      if (isApplyingRemoteRef.current) return;
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        const result = exportWorkbookFromYDoc(doc);
        if (result && onRemoteChangeRef.current) {
          isApplyingRemoteRef.current = true;
          onRemoteChangeRef.current(result.workbook, result.charts);
          window.setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 300);
        }
      }, 200);
    };

    rootMap.observeDeep(observer);
    return () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      rootMap.unobserveDeep(observer);
    };
  }, [collabRoom.doc]);

  // 3. Track Awareness states (presences & selections)
  useEffect(() => {
    const awareness = collabRoom.provider?.awareness;
    if (!awareness) return;

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const nextPresences: SheetCollaboratorPresence[] = [];

      states.forEach((state: Record<string, any>, clientId: number) => {
        if (!state?.user) return;
        nextPresences.push({
          clientId,
          user: state.user,
          selection: state.selection as SheetCollaboratorSelection | undefined,
        });
      });

      setPresences(nextPresences);
    };

    awareness.on('change', handleAwarenessChange);
    handleAwarenessChange();

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [collabRoom.provider]);

  // 4. Broadcast local selection to awareness
  const broadcastSelection = useCallback(
    (sheetId: string, range: { startRow: number; endRow: number; startColumn: number; endColumn: number }) => {
      const awareness = collabRoom.provider?.awareness;
      if (!awareness) return;
      awareness.setLocalStateField('selection', {
        sheetId,
        range,
        updatedAt: Date.now(),
      });
    },
    [collabRoom.provider],
  );

  // 5. Local workbook sync to YDoc
  const syncLocalWorkbook = useCallback(
    (data: IWorkbookData) => {
      if (!collabRoom.doc || isApplyingRemoteRef.current || readOnly) return;
      syncLocalWorkbookToYDoc(collabRoom.doc, data);
    },
    [collabRoom.doc, readOnly],
  );

  // 6. Local charts sync to YDoc
  const syncLocalCharts = useCallback(
    (charts: ChartSpec[]) => {
      if (!collabRoom.doc || isApplyingRemoteRef.current || readOnly) return;
      syncLocalChartsToYDoc(collabRoom.doc, charts);
    },
    [collabRoom.doc, readOnly],
  );

  return {
    collabStatus,
    isSynced,
    collaborators,
    presences,
    currentUser,
    updateProfile,
    broadcastSelection,
    syncLocalWorkbook,
    syncLocalCharts,
  };
};
