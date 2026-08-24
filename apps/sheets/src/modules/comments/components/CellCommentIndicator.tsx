import type { SheetCommentThread } from '@/modules/comments/types/comments.types';
import { calculateRangePixelRect } from '@/modules/collab/utils/selectionBounds.utils';
import type { IWorksheetData } from '@univerjs/presets';

interface CellCommentIndicatorOverlayProps {
  threads: SheetCommentThread[];
  activeSheetId?: string;
  worksheetData?: Partial<IWorksheetData>;
  onSelectThread?: (thread: SheetCommentThread) => void;
}

export const CellCommentIndicatorOverlay = ({
  threads,
  activeSheetId = 'sheet-01',
  worksheetData,
  onSelectThread,
}: CellCommentIndicatorOverlayProps) => {
  const currentThreads = threads.filter(
    (th) => th.sheetId === activeSheetId && !th.resolved,
  );

  if (currentThreads.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-19">
      {currentThreads.map((thread) => {
        const rect = calculateRangePixelRect(thread.range, worksheetData);

        return (
          <button
            key={thread.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectThread?.(thread);
            }}
            className="absolute pointer-events-auto cursor-pointer group size-3 transition-transform hover:scale-125 focus:outline-hidden"
            style={{
              left: `${rect.left + rect.width - 8}px`,
              top: `${rect.top}px`,
            }}
            aria-label={`Comment on ${thread.cellAddress}`}
          >
            {/* Golden Triangle Corner */}
            <span
              className="absolute top-0 right-0 border-t-8 border-r-8 border-t-amber-500 border-r-transparent group-hover:border-t-amber-600"
              style={{
                borderLeft: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderTopColor: '#f59e0b',
                borderRightColor: '#f59e0b',
              }}
            />
          </button>
        );
      })}
    </div>
  );
};
