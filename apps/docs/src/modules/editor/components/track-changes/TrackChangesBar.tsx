import { Button, Icon, Separator } from '@office/ui-kit';
import type { TrackSuggestion } from '@office/tiptap-extensions';

interface TrackChangesBarProps {
  isSuggesting: boolean;
  onToggleSuggesting: () => void;
  pendingSuggestions: TrackSuggestion[];
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSelectNext: () => void;
  onSelectPrev: () => void;
}

export const TrackChangesBar = ({
  isSuggesting,
  onToggleSuggesting,
  pendingSuggestions,
  onAcceptAll,
  onRejectAll,
  onSelectNext,
  onSelectPrev,
}: TrackChangesBarProps) => {
  const count = pendingSuggestions.length;

  if (!isSuggesting && count === 0) return null;

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-border bg-card/95 px-3.5 py-1.5 shadow-md backdrop-blur text-xs">
      <div className="flex items-center gap-1.5 font-medium text-foreground">
        <span
          className={`size-2 rounded-full ${isSuggesting ? 'bg-amber-500 animate-pulse' : 'bg-muted-foreground'}`}
        />
        <span>{isSuggesting ? 'Đang ở chế độ Đề xuất' : 'Có đề xuất chờ duyệt'}</span>
        {count > 0 && (
          <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.2 text-[11px] font-bold text-primary">
            {count}
          </span>
        )}
      </div>

      <Separator orientation="vertical" className="h-4 w-px bg-border/60" />

      {count > 0 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-full text-muted-foreground hover:text-foreground"
            onClick={onSelectPrev}
            title="Đề xuất trước"
          >
            <Icon name="chevron-left" className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-full text-muted-foreground hover:text-foreground"
            onClick={onSelectNext}
            title="Đề xuất tiếp theo"
          >
            <Icon name="chevron-right" className="size-3.5" />
          </Button>

          <Separator orientation="vertical" className="h-4 w-px bg-border/60 mx-0.5" />

          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/40"
            onClick={onAcceptAll}
          >
            Duyệt tất cả
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRejectAll}
          >
            Từ chối tất cả
          </Button>
        </div>
      )}

      <Button
        variant={isSuggesting ? 'secondary' : 'outline'}
        size="sm"
        className="h-6 text-[11px] px-2 ml-1"
        onClick={onToggleSuggesting}
      >
        {isSuggesting ? 'Tắt đề xuất' : 'Bật đề xuất'}
      </Button>
    </div>
  );
};
