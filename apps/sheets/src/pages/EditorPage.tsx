import { SheetEditor, type GetWorkbookData } from '@/components/SheetEditor';
import { SheetsHeader } from '@/components/SheetsHeader';
import { useSheets } from '@/hooks/useSheets';
import { useTheme } from '@/hooks/useTheme';
import {
  ChartInspector,
  createDefaultChartSpec,
  type ChartPosition,
  type ChartSpec,
} from '@/modules/charts';
import { SheetsToolbar } from '@/modules/toolbar';
import { exportXlsxFile } from '@/services/xlsx.service';
import { useTranslation } from '@office/i18n';
import { Button, Skeleton } from '@office/ui-kit';
import type { FUniver, IWorkbookData } from '@univerjs/presets';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const EditorPage = () => {
  const { t } = useTranslation('sheets');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    activeSheet,
    loading,
    saveState,
    setActiveId,
    updateData,
    updateCharts,
    updateTitle,
    star,
    importFile,
    markOpened,
  } = useSheets();

  const [exporting, setExporting] = useState(false);
  const [univerAPI, setUniverAPI] = useState<FUniver | null>(null);
  const getWorkbookDataRef = useRef<GetWorkbookData | null>(null);

  // Charts State
  const [charts, setCharts] = useState<ChartSpec[]>([]);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setActiveId(id);
      markOpened(id);
    }
  }, [id, setActiveId, markOpened]);

  // Sync charts from activeSheet when loaded
  useEffect(() => {
    if (activeSheet?.charts) {
      setCharts(activeSheet.charts);
    } else {
      setCharts([]);
    }
  }, [activeSheet?.id, activeSheet?.charts]);

  const activeWorksheetId =
    univerAPI?.getActiveWorkbook()?.getActiveSheet()?.getSheetId() ||
    activeSheet?.data?.sheetOrder?.[0] ||
    'sheet-01';

  const selectedChart = charts.find((c) => c.id === selectedChartId) || null;

  const handleInsertChart = useCallback(() => {
    const defaultRange = 'A1:C6';
    const newChart = createDefaultChartSpec(activeWorksheetId, defaultRange, 'column');
    const nextCharts = [...charts, newChart];
    setCharts(nextCharts);
    setSelectedChartId(newChart.id);
    setIsInspectorOpen(true);
    updateCharts(nextCharts);
  }, [activeWorksheetId, charts, updateCharts]);

  const handleUpdateChartPosition = useCallback(
    (chartId: string, newPos: ChartPosition) => {
      const nextCharts = charts.map((c) => (c.id === chartId ? { ...c, position: newPos } : c));
      setCharts(nextCharts);
      updateCharts(nextCharts);
    },
    [charts, updateCharts],
  );

  const handleUpdateChartSpec = useCallback(
    (partial: Partial<ChartSpec>) => {
      if (!selectedChartId) return;
      const nextCharts = charts.map((c) => (c.id === selectedChartId ? { ...c, ...partial } : c));
      setCharts(nextCharts);
      updateCharts(nextCharts);
    },
    [charts, selectedChartId, updateCharts],
  );

  const handleDeleteChart = useCallback(
    (chartId: string) => {
      const nextCharts = charts.filter((c) => c.id !== chartId);
      setCharts(nextCharts);
      if (selectedChartId === chartId) {
        setSelectedChartId(null);
        setIsInspectorOpen(false);
      }
      updateCharts(nextCharts);
    },
    [charts, selectedChartId, updateCharts],
  );

  const handleExport = async () => {
    const data = getWorkbookDataRef.current?.() ?? activeSheet?.data;
    if (!data) return;
    setExporting(true);
    try {
      const blob = await exportXlsxFile(data, charts);
      const filename = `${activeSheet?.title || 'workbook'}.xlsx`;
      downloadBlob(blob, filename);
    } catch {
      window.alert(t('exportError'));
    } finally {
      setExporting(false);
    }
  };

  const handleOpenFromDevice = async (file: File) => {
    try {
      const nextId = await importFile(file);
      navigate(`/edit/${nextId}`);
    } catch {
      window.alert(t('openError'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col bg-background">
        <div className="h-14 border-b border-border p-3">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (!activeSheet) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">{t('editor.notFound')}</p>
        <Button onClick={() => navigate('/')}>{t('editor.backHome')}</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-screen w-full flex-col overflow-hidden bg-background">
      <SheetsHeader
        title={activeSheet.title}
        onTitleChange={updateTitle}
        theme={theme}
        onToggleTheme={toggleTheme}
        starred={activeSheet.starred}
        onToggleStar={() => star(activeSheet.id)}
        saveState={saveState}
        onOpenFromDevice={(file) => void handleOpenFromDevice(file)}
        onExport={() => void handleExport()}
        exporting={exporting}
      />
      <SheetsToolbar
        univerAPI={univerAPI}
        onPrint={() => window.print()}
        onInsertChart={handleInsertChart}
      />
      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <SheetEditor
            key={activeSheet.id}
            initialData={activeSheet.data}
            onDataChange={updateData}
            onReady={setUniverAPI}
            getWorkbookDataRef={getWorkbookDataRef}
            charts={charts}
            selectedChartId={selectedChartId}
            activeSheetId={activeWorksheetId}
            isDark={theme === 'dark'}
            onSelectChart={(id) => {
              setSelectedChartId(id);
              if (!id) setIsInspectorOpen(false);
            }}
            onDoubleClickChart={(id) => {
              setSelectedChartId(id);
              setIsInspectorOpen(true);
            }}
            onUpdateChartPosition={handleUpdateChartPosition}
            onDeleteChart={handleDeleteChart}
          />
        </div>

        {/* Right Sidebar Chart Inspector */}
        <ChartInspector
          spec={selectedChart}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateSpec={handleUpdateChartSpec}
          onDeleteChart={() => selectedChartId && handleDeleteChart(selectedChartId)}
        />
      </main>
    </div>
  );
};

export default EditorPage;
