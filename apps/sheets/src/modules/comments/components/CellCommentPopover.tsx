import type { SheetCommentThread } from '@/modules/comments/types/comments.types';
import type { CollabUser } from '@office/collab-core';
import { useTranslation } from '@office/i18n';
import { Button, Icon, Textarea, cn } from '@office/ui-kit';
import { useState, type FormEvent } from 'react';

interface CellCommentPopoverProps {
  thread: SheetCommentThread | null;
  currentUser: CollabUser;
  isOpen: boolean;
  onClose: () => void;
  onAddReply: (threadId: string, content: string) => void;
  onToggleResolve: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
}

export const CellCommentPopover = ({
  thread,
  currentUser,
  isOpen,
  onClose,
  onAddReply,
  onToggleResolve,
  onDeleteThread,
}: CellCommentPopoverProps) => {
  const { t } = useTranslation('sheets');
  const [replyText, setReplyText] = useState('');

  if (!isOpen || !thread) return null;

  const handleReplySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(thread.id, replyText.trim());
    setReplyText('');
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-12 right-12 z-50 w-84 rounded-lg border border-border bg-card p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="grid size-5 place-items-center rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Icon name="message-square" size={12} />
          </span>
          <span className="font-semibold text-xs text-foreground">
            {thread.cellAddress || 'Cell Comment'}
          </span>
          {thread.resolved && (
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
              {t('comments.resolved')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <Icon name="x" size={14} />
          </Button>
        </div>
      </div>

      {/* Comment Items Conversation */}
      <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
        {thread.comments.map((comment) => (
          <div key={comment.id} className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className="grid size-5.5 place-items-center rounded-full text-[10px] font-semibold text-white shrink-0"
                  style={{ backgroundColor: comment.author.color || '#3b82f6' }}
                >
                  {comment.author.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-medium text-foreground">{comment.author.name}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(comment.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="pl-7 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        ))}
      </div>

      {/* Reply Input Form */}
      <form onSubmit={handleReplySubmit} className="space-y-2 pt-1 border-t border-border/80">
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={t('comments.replyPlaceholder')}
          className="min-h-16 text-xs resize-none"
          autoFocus
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[11px] px-2"
              onClick={() => onToggleResolve(thread.id)}
            >
              <Icon name="check" size={12} className="mr-1" />
              {thread.resolved ? t('comments.reopen') : t('comments.resolve')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2 text-destructive hover:bg-destructive/10"
              onClick={() => onDeleteThread(thread.id)}
            >
              <Icon name="trash" size={12} />
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!replyText.trim()}
            style={{ backgroundColor: 'var(--o-kind-sheets)' }}
            className="h-7 text-[11px] text-white"
          >
            {t('comments.reply')}
          </Button>
        </div>
      </form>
    </div>
  );
};
