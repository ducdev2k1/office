import { Button, Card, Icon } from '@office/ui-kit';
import type { TrackSuggestion } from '@office/tiptap-extensions';

interface SuggestionCardProps {
  suggestion: TrackSuggestion;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}

export const SuggestionCard = ({
  suggestion,
  onAccept,
  onReject,
  onClose,
}: SuggestionCardProps) => {
  const isInsert = suggestion.type === 'insert';
  const isDelete = suggestion.type === 'delete';

  const typeLabel = isInsert
    ? 'Đề xuất thêm văn bản'
    : isDelete
      ? 'Đề xuất xóa văn bản'
      : 'Đề xuất thay đổi văn bản';

  const typeColor = isInsert
    ? 'text-green-600 bg-green-50 dark:bg-green-950/50'
    : isDelete
      ? 'text-red-600 bg-red-50 dark:bg-red-950/50'
      : 'text-blue-600 bg-blue-50 dark:bg-blue-950/50';

  return (
    <Card className="p-3 shadow-lg border border-border bg-card max-w-sm space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {suggestion.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{suggestion.authorName}</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(suggestion.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-6 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <Icon name="x" className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-1">
        <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${typeColor}`}>
          {typeLabel}
        </span>
        <p className="text-xs text-foreground bg-muted/40 p-2 rounded border border-border/50 break-words font-mono">
          "{suggestion.text}"
        </p>
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onReject(suggestion.id)}
        >
          <Icon name="x" className="size-3 mr-1" />
          Từ chối
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs px-2.5 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => onAccept(suggestion.id)}
        >
          <Icon name="check" className="size-3 mr-1" />
          Chấp nhận
        </Button>
      </div>
    </Card>
  );
};
