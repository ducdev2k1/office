import { useCallback, useRef, useState } from 'react';
import {
  createDefaultChartSpec,
  type ChartPosition,
  type ChartSpec,
} from '@/modules/charts';

interface UseSheetChartsStateOptions {
  activeWorksheetId: string;
  updateCharts: (charts: ChartSpec[]) => void;
  syncLocalCharts: (charts: ChartSpec[]) => void;
}

export const useSheetChartsState = ({
  activeWorksheetId,
  updateCharts,
  syncLocalCharts,
}: UseSheetChartsStateOptions) => {
  const [charts, setCharts] = useState<ChartSpec[]>([]);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const chartsRef = useRef<ChartSpec[]>(charts);
  chartsRef.current = charts;

  const commit = useCallback(
    (next: ChartSpec[]) => {
      chartsRef.current = next;
      setCharts(next);
      updateCharts(next);
      syncLocalCharts(next);
    },
    [syncLocalCharts, updateCharts],
  );

  const replaceCharts = useCallback((next: ChartSpec[] | undefined) => {
    chartsRef.current = next ?? [];
    setCharts(next ?? []);
  }, []);

  const handleInsertChart = useCallback(() => {
    const defaultRange = 'A1:C6';
    const newChart = createDefaultChartSpec(activeWorksheetId, defaultRange, 'column');
    commit([...chartsRef.current, newChart]);
    setSelectedChartId(newChart.id);
    setIsInspectorOpen(true);
  }, [activeWorksheetId, commit]);

  const handleUpdateChartPosition = useCallback(
    (chartId: string, newPos: ChartPosition) => {
      commit(chartsRef.current.map((c) => (c.id === chartId ? { ...c, position: newPos } : c)));
    },
    [commit],
  );

  const handleUpdateChartSpec = useCallback(
    (partial: Partial<ChartSpec>) => {
      if (!selectedChartId) return;
      commit(
        chartsRef.current.map((c) => (c.id === selectedChartId ? { ...c, ...partial } : c)),
      );
    },
    [commit, selectedChartId],
  );

  const handleDeleteChart = useCallback(
    (chartId: string) => {
      commit(chartsRef.current.filter((c) => c.id !== chartId));
      setSelectedChartId((currentId) => (currentId === chartId ? null : currentId));
      setIsInspectorOpen(false);
    },
    [commit],
  );

  const handleSelectChart = useCallback((chartId: string | null) => {
    setSelectedChartId(chartId);
    if (!chartId) setIsInspectorOpen(false);
  }, []);

  const selectedChart = charts.find((c) => c.id === selectedChartId) || null;

  return {
    charts,
    selectedChart,
    selectedChartId,
    isInspectorOpen,
    setIsInspectorOpen,
    replaceCharts,
    handleInsertChart,
    handleUpdateChartPosition,
    handleUpdateChartSpec,
    handleDeleteChart,
    handleSelectChart,
  };
};
