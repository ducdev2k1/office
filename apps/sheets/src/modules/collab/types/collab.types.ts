import type { CollabStatus, CollabUser } from '@office/collab-core';
import type { IWorkbookData } from '@univerjs/presets';
import type { ChartSpec } from '@/modules/charts/types/charts.types';

export interface SheetCellRange {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

export interface SheetCollaboratorSelection {
  sheetId: string;
  range: SheetCellRange;
  updatedAt?: number;
}

export interface SheetCollaboratorPresence {
  clientId: number;
  user: CollabUser;
  selection?: SheetCollaboratorSelection | null;
}

export interface CollabSheetConfig {
  docId: string;
  initialData?: IWorkbookData;
  initialCharts?: ChartSpec[];
  readOnly?: boolean;
}

export interface UseCollabSheetReturn {
  collabStatus: CollabStatus;
  isSynced: boolean;
  collaborators: CollabUser[];
  presences: SheetCollaboratorPresence[];
  currentUser: CollabUser;
  updateProfile: (partial: Partial<CollabUser>) => void;
  broadcastSelection: (sheetId: string, range: SheetCellRange) => void;
  syncLocalWorkbook: (data: IWorkbookData) => void;
  syncLocalCharts: (charts: ChartSpec[]) => void;
}
