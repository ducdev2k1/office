import { useState } from 'react';
import { Button, Icon, Input } from '@office/ui-kit';
import type { CommentThread } from '@office/tiptap-extensions';

interface CommentThreadCardProps {
  thread: CommentThread;
  currentUserId?: string;
  currentUserName?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onReply: (threadId: string, text: string) => void;
  onToggleResolve: (threadId: string, resolved: boolean) => void;
  onDelete: (threadId: string) => void;
}

export const CommentThreadCard = ({
  thread,
  currentUserName = 'Bạn',
  isSelected = false,
  onSelect,
  onReply,
  onToggleResolve,
  onDelete,
}: CommentThreadCardProps) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const firstComment = thread.comments[0];
  const replies = thread.comments.slice(1);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply(thread.id, replyText.trim());
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border p-3 text-xs transition-all ${
        isSelected
          ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500 shadow-sm'
          : 'border-border bg-card hover:border-border/80 hover:shadow-xs'
      } ${thread.resolved ? 'opacity-60' : ''}`}
    >
      {/* Quote banner if available */}
      {thread.highlightedText && (
        <div className="mb-2 border-l-2 border-amber-500 pl-2 text-[11px] italic text-muted-foreground line-clamp-2">
          "{thread.highlightedText}"
        </div>
      )}

      {/* Main Comment */}
      {firstComment && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary font-bold">
                {firstComment.authorName.slice(0, 1).toUpperCase()}
              </span>
              <span>{firstComment.authorName}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(firstComment.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-foreground leading-relaxed pl-6.5 whitespace-pre-wrap">
            {firstComment.content}
          </p>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-2.5 space-y-2 border-t border-border/50 pt-2 pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-[11px]">
                  {reply.authorName}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {new Date(reply.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-foreground leading-normal whitespace-pre-wrap">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-3 flex items-center justify-between pt-1 border-t border-border/40">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] px-1.5 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onToggleResolve(thread.id, !thread.resolved);
            }}
          >
            <Icon
              name={thread.resolved ? 'check' : 'check'}
              className={`size-3 mr-1 ${thread.resolved ? 'text-green-500' : ''}`}
            />
            {thread.resolved ? 'Mở lại' : 'Giải quyết'}
          </Button>

          {!isReplying && !thread.resolved && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-1.5 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setIsReplying(true);
              }}
            >
              Trả lời
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] px-1 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(thread.id);
          }}
        >
          <Icon name="trash" className="size-3" />
        </Button>
      </div>

      {/* Reply input box */}
      {isReplying && !thread.resolved && (
        <div className="mt-2 flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Trả lời với tư cách ${currentUserName}...`}
            className="h-7 text-xs flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            autoFocus
          />
          <Button size="sm" className="h-7 text-xs px-2" onClick={handleSendReply}>
            Gửi
          </Button>
        </div>
      )}
    </div>
  );
};
