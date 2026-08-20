import { useTranslation } from '@office/i18n';
import type { IWorkbookData } from '@univerjs/presets';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChartPosition, ChartSpec } from '../types/charts.types';
import { extractDataFromWorkbook } from '../utils/dataRangeParser.utils';
import { FloatingChartContainer } from './FloatingChartContainer';

export interface FloatingChartOverlayProps {
  charts: ChartSpec[];
  selectedChartId: string | null;
  activeSheetId: string;
  workbookData?: IWorkbookData;
  isDark?: boolean;
  onSelectChart: (id: string | null) => void;
  onDoubleClickChart: (id: string) => void;
  onUpdateChartPosition: (id: string, newPos: ChartPosition) => void;
  onDeleteChart: (id: string) => void;
}

export const FloatingChartOverlay = ({
  charts,
  selectedChartId,
  activeSheetId,
  workbookData,
  isDark = false,
  onSelectChart,
  onDoubleClickChart,
  onUpdateChartPosition,
  onDeleteChart,
}: FloatingChartOverlayProps) => {
  const { t } = useTranslation('sheets');
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerBounds, setContainerBounds] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerBounds({
          width: entry.contentRect.width || 1920,
          height: entry.contentRect.height || 1080,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter charts that belong to current active worksheet
  const visibleCharts = charts.filter((c) => !c.sheetId || c.sheetId === activeSheetId);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === containerRef.current) {
        onSelectChart(null);
      }
    },
    [onSelectChart],
  );

  return (
    <div
      ref={containerRef}
      onClick={handleBackdropClick}
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {visibleCharts.map((spec) => {
        const data = extractDataFromWorkbook(workbookData, activeSheetId, spec, {
          series: t('chart.fallback.series'),
          category: t('chart.fallback.category'),
        });
        return (
          <div key={spec.id} className="pointer-events-auto contents">
            <FloatingChartContainer
              spec={spec}
              data={data}
              isSelected={selectedChartId === spec.id}
              isDark={isDark}
              containerBounds={containerBounds}
              onSelect={() => onSelectChart(spec.id)}
              onDoubleClick={() => onDoubleClickChart(spec.id)}
              onUpdatePosition={(newPos) => onUpdateChartPosition(spec.id, newPos)}
              onDelete={() => onDeleteChart(spec.id)}
            />
          </div>
        );
      })}
    </div>
  );
};
