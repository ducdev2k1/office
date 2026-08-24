import type { CollabUser } from '@office/collab-core';
import type { SheetCellRange } from '@/modules/collab/types/collab.types';

export interface SheetCommentItem {
  id: string;
  author: CollabUser;
  content: string;
  createdAt: string;
}

export interface SheetCommentThread {
  id: string;
  sheetId: string;
  cellAddress: string;
  range: SheetCellRange;
  resolved: boolean;
  comments: SheetCommentItem[];
  createdAt: string;
}
