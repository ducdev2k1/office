import { useUniver } from '@/hooks/useUniver';
import { FloatingChartOverlay, type ChartPosition, type ChartSpec } from '@/modules/charts';
import type { FUniver, IWorkbookData } from '@univerjs/presets';
import { useEffect, useState, type MutableRefObject } from 'react';

export type GetWorkbookData = () => IWorkbookData | undefined;

export interface SheetEditorProps {
  initialData?: IWorkbookData;
  onDataChange?: (data: IWorkbookData) => void;
  onReady?: (api: FUniver) => void;
  getWorkbookDataRef?: MutableRefObject<GetWorkbookData | null>;
  charts?: ChartSpec[];
  selectedChartId?: string | null;
  activeSheetId?: string;
  isDark?: boolean;
  onSelectChart?: (id: string | null) => void;
  onDoubleClickChart?: (id: string) => void;
  onUpdateChartPosition?: (id: string, newPos: ChartPosition) => void;
  onDeleteChart?: (id: string) => void;
}

export const SheetEditor = ({
  initialData,
  onDataChange,
  onReady,
  getWorkbookDataRef,
  charts = [],
  selectedChartId = null,
  activeSheetId = 'sheet-01',
  isDark = false,
  onSelectChart = () => {},
  onDoubleClickChart = () => {},
  onUpdateChartPosition = () => {},
  onDeleteChart = () => {},
}: SheetEditorProps) => {
  const [currentWorkbookData, setCurrentWorkbookData] = useState<IWorkbookData | undefined>(
    initialData,
  );

  const handleInternalDataChange = (data: IWorkbookData) => {
    setCurrentWorkbookData(data);
    onDataChange?.(data);
  };

  const { containerRef, getWorkbookData } = useUniver({
    initialData,
    onDataChange: handleInternalDataChange,
    onReady,
  });

  useEffect(() => {
    if (getWorkbookDataRef) getWorkbookDataRef.current = getWorkbookData;
  }, [getWorkbookData, getWorkbookDataRef]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Univer Canvas */}
      <div ref={containerRef} className="h-full w-full" />

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
    </div>
  );
};
