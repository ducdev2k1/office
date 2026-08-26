import { useCallback, useState } from 'react';
import { indexToColumnLetter } from '@/modules/charts/utils/dataRangeParser.utils';
import type { SheetCommentThread } from '@/modules/comments';
import type { CollabUser } from '@office/collab-core';
import type { FUniver } from '@univerjs/presets';

interface UseCellCommentsOptions {
  univerAPI: FUniver | null;
  activeWorksheetId: string;
  currentUser: CollabUser;
}

export const useCellComments = ({
  univerAPI,
  activeWorksheetId,
  currentUser,
}: UseCellCommentsOptions) => {
  const [threads, setThreads] = useState<SheetCommentThread[]>([]);
  const [activeThread, setActiveThread] = useState<SheetCommentThread | null>(null);
  const [isCommentPopoverOpen, setIsCommentPopoverOpen] = useState(false);

  const handleOpenAddComment = useCallback(() => {
    const sheet = univerAPI?.getActiveWorkbook()?.getActiveSheet();
    const selection = sheet?.getSelection()?.getActiveRange();
    const range = selection
      ? selection.getRange()
      : { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
    const cellAddress = `${indexToColumnLetter(range.startColumn)}${range.startRow + 1}`;

    const newThread: SheetCommentThread = {
      id: `thread-${Date.now()}`,
      sheetId: activeWorksheetId,
      cellAddress,
      range: {
        startRow: range.startRow,
        endRow: range.endRow,
        startColumn: range.startColumn,
        endColumn: range.endColumn,
      },
      resolved: false,
      comments: [
        {
          id: `c-${Date.now()}`,
          author: currentUser,
          content: 'Bình luận trên ô này.',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setThreads((prev) => [...prev, newThread]);
    setActiveThread(newThread);
    setIsCommentPopoverOpen(true);
  }, [univerAPI, activeWorksheetId, currentUser]);

  const handleAddReply = useCallback((threadId: string, content: string) => {
    const replyItem = {
      id: `reply-${Date.now()}`,
      author: currentUser,
      content,
      createdAt: new Date().toISOString(),
    };
    setThreads((prev) =>
      prev.map((th) => (th.id === threadId ? { ...th, comments: [...th.comments, replyItem] } : th)),
    );
    setActiveThread((prev) =>
      prev && prev.id === threadId ? { ...prev, comments: [...prev.comments, replyItem] } : prev,
    );
  }, [currentUser]);

  const handleToggleResolve = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((th) => (th.id === threadId ? { ...th, resolved: !th.resolved } : th)),
    );
    setActiveThread((prev) =>
      prev && prev.id === threadId ? { ...prev, resolved: !prev.resolved } : prev,
    );
  }, []);

  const handleDeleteThread = useCallback((threadId: string) => {
    setThreads((prev) => prev.filter((th) => th.id !== threadId));
    setIsCommentPopoverOpen(false);
    setActiveThread(null);
  }, []);

  return {
    threads,
    activeThread,
    isCommentPopoverOpen,
    setIsCommentPopoverOpen,
    setActiveThread,
    handleOpenAddComment,
    handleAddReply,
    handleToggleResolve,
    handleDeleteThread,
  };
};
