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
import { indexToColumnLetter } from '@/modules/charts/utils/dataRangeParser.utils';
import { ShareDialog, useCollabSheet } from '@/modules/collab';
import {
  CellCommentPopover,
  CommentsSidebar,
  type SheetCommentThread,
} from '@/modules/comments';
import {
  InsertImageDialog,
  type FloatingImageSpec,
  type ImagePosition,
} from '@/modules/images';
import { PrintPreviewModal } from '@/modules/print';
import { SheetsToolbar } from '@/modules/toolbar';
import { exportXlsxFile } from '@/services/xlsx.service';
import { prepareExportSnapshot } from '@office/xlsx-io';
import { useTranslation } from '@office/i18n';
import { Button, Skeleton } from '@office/ui-kit';
import type { FUniver, IWorkbookData } from '@univerjs/presets';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

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
  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get('access') === 'view';
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
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isInsertImageDialogOpen, setIsInsertImageDialogOpen] = useState(false);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);
  const [univerAPI, setUniverAPI] = useState<FUniver | null>(null);
  const getWorkbookDataRef = useRef<GetWorkbookData | null>(null);

  // Charts State
  const [charts, setCharts] = useState<ChartSpec[]>([]);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Floating Images State
  const [images, setImages] = useState<FloatingImageSpec[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Comments State
  const [threads, setThreads] = useState<SheetCommentThread[]>([]);
  const [activeThread, setActiveThread] = useState<SheetCommentThread | null>(null);
  const [isCommentPopoverOpen, setIsCommentPopoverOpen] = useState(false);

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

  // Remote change handler for CRDT
  const handleRemoteDataChange = useCallback(
    (workbook: IWorkbookData, remoteCharts: ChartSpec[]) => {
      updateData(workbook);
      setCharts(remoteCharts);
    },
    [updateData],
  );

  // Collab Room Hook
  const {
    collabStatus,
    collaborators,
    presences,
    currentUser,
    updateProfile,
    broadcastSelection,
    syncLocalWorkbook,
    syncLocalCharts,
  } = useCollabSheet({
    docId: activeSheet?.id || '',
    initialData: activeSheet?.data,
    initialCharts: activeSheet?.charts,
    readOnly: isReadOnly,
    onRemoteDataChange: handleRemoteDataChange,
  });

  const handleInternalDataChange = useCallback(
    (data: IWorkbookData) => {
      updateData(data);
      syncLocalWorkbook(data);
    },
    [updateData, syncLocalWorkbook],
  );

  const selectedChart = charts.find((c) => c.id === selectedChartId) || null;

  // Chart handlers
  const handleInsertChart = useCallback(() => {
    const defaultRange = 'A1:C6';
    const newChart = createDefaultChartSpec(activeWorksheetId, defaultRange, 'column');
    const nextCharts = [...charts, newChart];
    setCharts(nextCharts);
    setSelectedChartId(newChart.id);
    setIsInspectorOpen(true);
    updateCharts(nextCharts);
    syncLocalCharts(nextCharts);
  }, [activeWorksheetId, charts, updateCharts, syncLocalCharts]);

  const handleUpdateChartPosition = useCallback(
    (chartId: string, newPos: ChartPosition) => {
      const nextCharts = charts.map((c) => (c.id === chartId ? { ...c, position: newPos } : c));
      setCharts(nextCharts);
      updateCharts(nextCharts);
      syncLocalCharts(nextCharts);
    },
    [charts, updateCharts, syncLocalCharts],
  );

  const handleUpdateChartSpec = useCallback(
    (partial: Partial<ChartSpec>) => {
      if (!selectedChartId) return;
      const nextCharts = charts.map((c) => (c.id === selectedChartId ? { ...c, ...partial } : c));
      setCharts(nextCharts);
      updateCharts(nextCharts);
      syncLocalCharts(nextCharts);
    },
    [charts, selectedChartId, updateCharts, syncLocalCharts],
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
      syncLocalCharts(nextCharts);
    },
    [charts, selectedChartId, updateCharts, syncLocalCharts],
  );

  // Floating Image handlers
  const handleInsertImage = useCallback(
    (url: string, title?: string) => {
      const newImg: FloatingImageSpec = {
        id: `img-${Date.now()}`,
        url,
        title,
        sheetId: activeWorksheetId,
        position: {
          offsetX: 80,
          offsetY: 100,
          width: 260,
          height: 180,
        },
        createdAt: new Date().toISOString(),
      };
      setImages((prev) => [...prev, newImg]);
      setSelectedImageId(newImg.id);
    },
    [activeWorksheetId],
  );

  const handleUpdateImagePosition = useCallback((id: string, newPos: ImagePosition) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, position: newPos } : img)));
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setSelectedImageId(null);
  }, []);

  // Comment Handlers
  const handleOpenAddComment = useCallback(() => {
    const activeSheet = univerAPI?.getActiveWorkbook()?.getActiveSheet();
    const selection = activeSheet?.getSelection()?.getActiveRange();
    const range = selection
      ? selection.getRange()
      : { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
    const cellAddress = `${indexToColumnLetter(range.startColumn)}${range.startRow + 1}`;

    const newThread: SheetCommentThread = {
      id: `thread-${Date.now()}`,
      sheetId: activeWorksheetId,
      cellAddress,
      range: {
        startRow: range.startRow,
        endRow: range.endRow,
        startColumn: range.startColumn,
        endColumn: range.endColumn,
      },
      resolved: false,
      comments: [
        {
          id: `c-${Date.now()}`,
          author: currentUser,
          content: 'Bình luận trên ô này.',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setThreads((prev) => [...prev, newThread]);
    setActiveThread(newThread);
    setIsCommentPopoverOpen(true);
  }, [univerAPI, activeWorksheetId, currentUser]);

  const handleAddReply = useCallback(
    (threadId: string, content: string) => {
      const replyItem = {
        id: `reply-${Date.now()}`,
        author: currentUser,
        content,
        createdAt: new Date().toISOString(),
      };
      setThreads((prev) =>
        prev.map((th) =>
          th.id === threadId ? { ...th, comments: [...th.comments, replyItem] } : th,
        ),
      );
      setActiveThread((prev) =>
        prev && prev.id === threadId
          ? { ...prev, comments: [...prev.comments, replyItem] }
          : prev,
      );
    },
    [currentUser],
  );

  const handleToggleResolve = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((th) => (th.id === threadId ? { ...th, resolved: !th.resolved } : th)),
    );
    setActiveThread((prev) =>
      prev && prev.id === threadId ? { ...prev, resolved: !prev.resolved } : prev,
    );
  }, []);

  const handleDeleteThread = useCallback((threadId: string) => {
    setThreads((prev) => prev.filter((th) => th.id !== threadId));
    setIsCommentPopoverOpen(false);
    setActiveThread(null);
  }, []);

  // Global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPrintModalOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleOpenAddComment();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenAddComment]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = univerAPI ? await prepareExportSnapshot(univerAPI) : getWorkbookDataRef.current?.();
      const snapshot = data ?? activeSheet?.data;
      if (!snapshot) return;
      const blob = await exportXlsxFile(snapshot, charts);
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
        collabStatus={collabStatus}
        collaborators={collaborators}
        currentUser={currentUser}
        onUpdateProfile={updateProfile}
        onOpenShare={() => setIsShareDialogOpen(true)}
      />
      <SheetsToolbar
        univerAPI={univerAPI}
        onPrint={() => setIsPrintModalOpen(true)}
        onInsertChart={handleInsertChart}
        onInsertImage={() => setIsInsertImageDialogOpen(true)}
        onAddComment={handleOpenAddComment}
        onOpenCommentsSidebar={() => setIsCommentsSidebarOpen(true)}
      />
      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <SheetEditor
            key={activeSheet.id}
            initialData={activeSheet.data}
            onDataChange={handleInternalDataChange}
            onSelectionChange={broadcastSelection}
            onReady={setUniverAPI}
            getWorkbookDataRef={getWorkbookDataRef}
            charts={charts}
            selectedChartId={selectedChartId}
            images={images}
            selectedImageId={selectedImageId}
            threads={threads}
            activeSheetId={activeWorksheetId}
            isDark={false}
            presences={presences}
            currentUserId={currentUser.id}
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
            onInsertChart={handleInsertChart}
            onSelectImage={setSelectedImageId}
            onUpdateImagePosition={handleUpdateImagePosition}
            onDeleteImage={handleDeleteImage}
            onSelectCommentThread={(thread) => {
              setActiveThread(thread);
              setIsCommentPopoverOpen(true);
            }}
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

        {/* Right Sidebar Comments */}
        <CommentsSidebar
          threads={threads}
          isOpen={isCommentsSidebarOpen}
          onClose={() => setIsCommentsSidebarOpen(false)}
          onSelectThread={(thread) => {
            setActiveThread(thread);
            setIsCommentPopoverOpen(true);
          }}
        />
      </main>

      {/* Share Dialog */}
      <ShareDialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        sheetId={activeSheet.id}
      />

      {/* Print Preview & PDF Export Modal */}
      <PrintPreviewModal
        open={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        workbookData={getWorkbookDataRef.current?.() ?? activeSheet.data}
        activeSheetId={activeWorksheetId}
        documentTitle={activeSheet.title}
      />

      {/* Insert Floating Image Dialog */}
      <InsertImageDialog
        open={isInsertImageDialogOpen}
        onClose={() => setIsInsertImageDialogOpen(false)}
        onInsertImage={handleInsertImage}
      />

      {/* Cell Comment Thread Popover */}
      <CellCommentPopover
        thread={activeThread}
        currentUser={currentUser}
        isOpen={isCommentPopoverOpen}
        onClose={() => setIsCommentPopoverOpen(false)}
        onAddReply={handleAddReply}
        onToggleResolve={handleToggleResolve}
        onDeleteThread={handleDeleteThread}
      />
    </div>
  );
};

export default EditorPage;
