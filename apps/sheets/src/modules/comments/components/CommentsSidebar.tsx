import type { SheetCommentThread } from '@/modules/comments/types/comments.types';
import { useTranslation } from '@office/i18n';
import { Button, Icon, cn } from '@office/ui-kit';
import { useState } from 'react';

interface CommentsSidebarProps {
  threads: SheetCommentThread[];
  isOpen: boolean;
  onClose: () => void;
  onSelectThread: (thread: SheetCommentThread) => void;
}

export const CommentsSidebar = ({
  threads,
  isOpen,
  onClose,
  onSelectThread,
}: CommentsSidebarProps) => {
  const { t } = useTranslation('sheets');
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  if (!isOpen) return null;

  const filteredThreads = threads.filter((th) => {
    if (filter === 'active') return !th.resolved;
    if (filter === 'resolved') return th.resolved;
    return true;
  });

  return (
    <aside className="flex h-full w-80 flex-col border-l border-border bg-card shadow-lg z-30 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Icon name="message-square" size={15} className="text-primary" />
          {t('comments.sidebarTitle')}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <Icon name="x" size={15} />
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-border p-2 gap-1 bg-muted/30">
        {(['all', 'active', 'resolved'] as const).map((f) => (
          <Button
            key={f}
            type="button"
            size="sm"
            variant={filter === f ? 'default' : 'ghost'}
            className="flex-1 text-[11px] h-7"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tất cả' : t(`comments.${f}`)}
          </Button>
        ))}
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredThreads.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-muted-foreground p-4">
            <Icon name="message-square-off" size={24} className="mb-2 opacity-40" />
            <p>{t('comments.noComments')}</p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const firstComment = thread.comments[0];
            const replyCount = thread.comments.length - 1;

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={cn(
                  'group cursor-pointer rounded-lg border border-border p-3 transition-all hover:border-primary/50 hover:bg-muted/30 space-y-1.5',
                  thread.resolved && 'opacity-60 bg-muted/10',
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-primary">{thread.cellAddress}</span>
                    {thread.resolved && (
                      <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] text-emerald-600 font-medium">
                        {t('comments.resolved')}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(thread.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {firstComment && (
                  <div className="text-xs text-foreground/80 line-clamp-2">
                    <span className="font-medium text-foreground">{firstComment.author.name}: </span>
                    {firstComment.content}
                  </div>
                )}

                {replyCount > 0 && (
                  <div className="text-[10px] font-medium text-primary/80 pt-1">
                    +{replyCount} câu trả lời
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
