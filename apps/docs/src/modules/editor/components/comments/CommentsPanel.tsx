import { useState } from 'react';
import { Button, Icon, Input } from '@office/ui-kit';
import type { CommentsStore, CommentThread } from '@office/tiptap-extensions';
import { CommentThreadCard } from './CommentThreadCard';

interface CommentsPanelProps {
  open: boolean;
  onClose: () => void;
  commentsStore: CommentsStore;
  threads: CommentThread[];
  currentUserId?: string;
  currentUserName?: string;
  selectedThreadId?: string | null;
  onSelectThread?: (threadId: string | null) => void;
  pendingComment?: { from: number; to: number; text: string } | null;
  onCancelPending?: () => void;
  onCommitPending?: (content: string) => void;
}

export const CommentsPanel = ({
  open,
  onClose,
  commentsStore,
  threads,
  currentUserId = 'user-me',
  currentUserName = 'Bạn',
  selectedThreadId,
  onSelectThread,
  pendingComment,
  onCancelPending,
  onCommitPending,
}: CommentsPanelProps) => {
  const [filter, setFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [newCommentText, setNewCommentText] = useState('');

  if (!open) return null;

  const filteredThreads = threads.filter((t) => {
    if (filter === 'active') return !t.resolved;
    if (filter === 'resolved') return t.resolved;
    return true;
  });

  const handleCreatePending = () => {
    if (!newCommentText.trim() || !onCommitPending) return;
    onCommitPending(newCommentText.trim());
    setNewCommentText('');
  };

  return (
    <aside
      className="docs-comments-panel absolute top-0 right-0 bottom-0 z-30 w-80 bg-card/95 backdrop-blur-md border-l border-border shadow-xl flex flex-col transition-all duration-300"
      aria-label="Thanh bình luận"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="comment" className="size-4.5 text-primary" />
          <span className="font-semibold text-sm text-foreground">Bình luận</span>
          <span className="rounded-full bg-primary/10 text-primary px-1.5 py-0.2 text-[11px] font-medium">
            {threads.filter((t) => !t.resolved).length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid place-items-center size-7 rounded text-muted-foreground hover:text-foreground hover:bg-hover transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-2 border-b border-border bg-muted/20">
        <Button
          type="button"
          variant={filter === 'active' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={() => setFilter('active')}
        >
          Đang mở
        </Button>
        <Button
          type="button"
          variant={filter === 'resolved' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={() => setFilter('resolved')}
        >
          Đã xong
        </Button>
        <Button
          type="button"
          variant={filter === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={() => setFilter('all')}
        >
          Tất cả
        </Button>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {/* Pending Comment Composer */}
        {pendingComment && (
          <div className="rounded-lg border-2 border-primary/60 bg-primary/5 p-3 text-xs space-y-2">
            <span className="text-[11px] font-medium text-primary">Bình luận trên đoạn chọn:</span>
            {pendingComment.text && (
              <div className="border-l-2 border-primary/50 pl-2 text-[11px] italic text-muted-foreground line-clamp-2">
                "{pendingComment.text}"
              </div>
            )}
            <Input
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Nhập nội dung bình luận..."
              className="h-8 text-xs bg-background"
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePending()}
              autoFocus
            />
            <div className="flex justify-end gap-1.5 pt-1">
              {onCancelPending && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={onCancelPending}
                >
                  Hủy
                </Button>
              )}
              <Button size="sm" className="h-6 text-xs px-2.5" onClick={handleCreatePending}>
                Đăng
              </Button>
            </div>
          </div>
        )}

        {/* Thread List */}
        {filteredThreads.map((thread) => (
          <CommentThreadCard
            key={thread.id}
            thread={thread}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isSelected={selectedThreadId === thread.id}
            onSelect={() => onSelectThread?.(thread.id)}
            onReply={(threadId, text) =>
              commentsStore.addReply({
                threadId,
                text,
                authorId: currentUserId,
                authorName: currentUserName,
              })
            }
            onToggleResolve={(threadId, resolved) =>
              commentsStore.setResolved(threadId, resolved)
            }
            onDelete={(threadId) => commentsStore.deleteThread(threadId)}
          />
        ))}

        {filteredThreads.length === 0 && !pendingComment && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Icon name="comment" size={32} className="opacity-30 mb-2" />
            <p className="text-xs">Chưa có bình luận nào</p>
            <p className="text-[11px] opacity-75 mt-1">
              Bôi đen đoạn văn bản và chọn "Bình luận" để bắt đầu thảo luận.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
