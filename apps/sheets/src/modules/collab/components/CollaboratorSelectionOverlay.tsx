import type { SheetCollaboratorPresence } from '@/modules/collab/types/collab.types';
import { calculateRangePixelRect } from '@/modules/collab/utils/selectionBounds.utils';
import type { IWorkbookData } from '@univerjs/presets';

interface CollaboratorSelectionOverlayProps {
  presences: SheetCollaboratorPresence[];
  currentUserId?: string;
  activeSheetId?: string;
  workbookData?: IWorkbookData;
}

export const CollaboratorSelectionOverlay = ({
  presences,
  currentUserId,
  activeSheetId = 'sheet-01',
  workbookData,
}: CollaboratorSelectionOverlayProps) => {
  const currentWorksheet = workbookData?.sheets?.[activeSheetId];

  const remotePresences = presences.filter(
    (p) => p.user?.id !== currentUserId && p.selection && p.selection.sheetId === activeSheetId,
  );

  if (remotePresences.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
      {remotePresences.map((presence) => {
        if (!presence.selection) return null;
        const rect = calculateRangePixelRect(presence.selection.range, currentWorksheet);
        const color = presence.user.color || '#3b82f6';

        return (
          <div
            key={presence.clientId ?? presence.user.id}
            className="absolute transition-all duration-150 ease-out"
            style={{
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              border: `2px solid ${color}`,
              backgroundColor: `${color}18`, // 10% opacity fill
            }}
          >
            {/* User Name Tag Badge */}
            <div
              className="absolute -top-5.5 left-[-2px] px-1.5 py-0.5 rounded-t-sm text-[10px] font-medium text-white shadow-xs whitespace-nowrap select-none flex items-center gap-1"
              style={{ backgroundColor: color }}
            >
              <span>{presence.user.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
