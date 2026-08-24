import { SheetContextMenu } from '@/components/SheetContextMenu';
import { useSheetContextMenu } from '@/hooks/useSheetContextMenu';
import { useUniver } from '@/hooks/useUniver';
import { FloatingChartOverlay, type ChartPosition, type ChartSpec } from '@/modules/charts';
import {
  CollaboratorSelectionOverlay,
  type SheetCellRange,
  type SheetCollaboratorPresence,
} from '@/modules/collab';
import {
  CellCommentIndicatorOverlay,
  type SheetCommentThread,
} from '@/modules/comments';
import {
  FloatingImageOverlay,
  type FloatingImageSpec,
  type ImagePosition,
} from '@/modules/images';
import type { FUniver, IWorkbookData } from '@univerjs/presets';
import { useEffect, useState, type MutableRefObject } from 'react';

export type GetWorkbookData = () => IWorkbookData | undefined;

export interface SheetEditorProps {
  initialData?: IWorkbookData;
  onDataChange?: (data: IWorkbookData) => void;
  onSelectionChange?: (sheetId: string, range: SheetCellRange) => void;
  onReady?: (api: FUniver) => void;
  getWorkbookDataRef?: MutableRefObject<GetWorkbookData | null>;
  charts?: ChartSpec[];
  selectedChartId?: string | null;
  images?: FloatingImageSpec[];
  selectedImageId?: string | null;
  threads?: SheetCommentThread[];
  activeSheetId?: string;
  isDark?: boolean;
  presences?: SheetCollaboratorPresence[];
  currentUserId?: string;
  onSelectChart?: (id: string | null) => void;
  onDoubleClickChart?: (id: string) => void;
  onUpdateChartPosition?: (id: string, newPos: ChartPosition) => void;
  onDeleteChart?: (id: string) => void;
  onInsertChart?: () => void;
  onSelectImage?: (id: string | null) => void;
  onUpdateImagePosition?: (id: string, newPos: ImagePosition) => void;
  onDeleteImage?: (id: string) => void;
  onSelectCommentThread?: (thread: SheetCommentThread) => void;
}

export const SheetEditor = ({
  initialData,
  onDataChange,
  onSelectionChange,
  onReady,
  getWorkbookDataRef,
  charts = [],
  selectedChartId = null,
  images = [],
  selectedImageId = null,
  threads = [],
  activeSheetId = 'sheet-01',
  isDark = false,
  presences = [],
  currentUserId,
  onSelectChart = () => {},
  onDoubleClickChart = () => {},
  onUpdateChartPosition = () => {},
  onDeleteChart = () => {},
  onInsertChart,
  onSelectImage = () => {},
  onUpdateImagePosition = () => {},
  onDeleteImage = () => {},
  onSelectCommentThread = () => {},
}: SheetEditorProps) => {
  const [currentWorkbookData, setCurrentWorkbookData] = useState<IWorkbookData | undefined>(
    initialData,
  );

  const handleInternalDataChange = (data: IWorkbookData) => {
    setCurrentWorkbookData(data);
    onDataChange?.(data);
  };

  const { containerRef, univerAPI, getWorkbookData } = useUniver({
    initialData,
    onDataChange: handleInternalDataChange,
    onSelectionChange,
    onReady,
    isDark,
  });

  const {
    position: contextMenuPosition,
    menuItems: contextMenuItems,
    activeSubmenuId,
    setActiveSubmenuId,
    closeMenu: closeContextMenu,
  } = useSheetContextMenu({
    univerAPI,
    containerRef,
    onInsertChart,
  });

  useEffect(() => {
    if (getWorkbookDataRef) getWorkbookDataRef.current = getWorkbookData;
  }, [getWorkbookData, getWorkbookDataRef]);

  const activeWorksheet = currentWorkbookData?.sheets?.[activeSheetId];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Univer Canvas */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Collaborator Selection Overlays */}
      <CollaboratorSelectionOverlay
        presences={presences}
        currentUserId={currentUserId}
        activeSheetId={activeSheetId}
        workbookData={currentWorkbookData || initialData}
      />

      {/* Cell Comments Indicators */}
      <CellCommentIndicatorOverlay
        threads={threads}
        activeSheetId={activeSheetId}
        worksheetData={activeWorksheet}
        onSelectThread={onSelectCommentThread}
      />

      {/* Floating Chart Overlay */}
      <FloatingChartOverlay
        charts={charts}
        selectedChartId={selectedChartId}
        activeSheetId={activeSheetId}
        workbookData={currentWorkbookData || initialData}
        isDark={isDark}
        onSelectChart={onSelectChart}
        onDoubleClickChart={onDoubleClickChart}
        onUpdateChartPosition={onUpdateChartPosition}
        onDeleteChart={onDeleteChart}
      />

      {/* Floating Image Overlay */}
      <FloatingImageOverlay
        images={images}
        selectedImageId={selectedImageId}
        activeSheetId={activeSheetId}
        onSelectImage={onSelectImage}
        onUpdateImagePosition={onUpdateImagePosition}
        onDeleteImage={onDeleteImage}
      />

      {/* Custom Context Menu */}
      <SheetContextMenu
        position={contextMenuPosition}
        items={contextMenuItems}
        activeSubmenuId={activeSubmenuId}
        onSetActiveSubmenuId={setActiveSubmenuId}
        onClose={closeContextMenu}
      />
    </div>
  );
};
