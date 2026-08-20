import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { CommentsStore } from '@office/tiptap-extensions';
import type { CollabUser } from '@office/collab-core';

export const useEditorComments = (
  editor: Editor | null,
  commentsStore: CommentsStore,
  currentUser: CollabUser | undefined,
  onOpenComments: () => void,
) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [pendingComment, setPendingComment] = useState<{
    from: number;
    to: number;
    text: string;
  } | null>(null);

  const handleSelectCommentThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    onOpenComments();
  };

  const handleStartAddComment = () => {
    if (!editor || editor.state.selection.empty) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    setPendingComment({ from, to, text });
    onOpenComments();
  };

  const handleCommitPendingComment = (content: string) => {
    if (!pendingComment) return;
    commentsStore.addThread({
      fromIndex: pendingComment.from,
      toIndex: pendingComment.to,
      text: content,
      authorId: currentUser?.id || 'me',
      authorName: currentUser?.name || 'Bạn',
      highlightedText: pendingComment.text,
    });
    setPendingComment(null);
  };

  return {
    selectedThreadId,
    setSelectedThreadId,
    pendingComment,
    setPendingComment,
    handleSelectCommentThread,
    handleStartAddComment,
    handleCommitPendingComment,
  };
};
