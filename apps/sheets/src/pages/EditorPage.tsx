import { SheetEditor, type GetWorkbookData } from '@/components/SheetEditor';
import { SheetsHeader } from '@/components/SheetsHeader';
import { SheetsStatusbar } from '@/components/SheetsStatusbar';
import { useCellComments } from '@/hooks/useCellComments';
import { useFloatingImagesState } from '@/hooks/useFloatingImagesState';
import { useSelectionAggregate } from '@/hooks/useSelectionAggregate';
import { useSheetChartsState } from '@/hooks/useSheetChartsState';
import { useSheets } from '@/hooks/useSheets';
import { useTheme } from '@/hooks/useTheme';
import { ChartInspector } from '@/modules/charts';
import { ShareDialog, useCollabSheet } from '@/modules/collab';
import type { SheetCellRange } from '@/modules/collab/types/collab.types';
import { CellCommentPopover, CommentsSidebar } from '@/modules/comments';
import { InsertImageDialog } from '@/modules/images';
import { SheetsToolbar } from '@/modules/toolbar';
import { exportXlsxFile } from '@/services/xlsx.service';
import { getStoredLocale, useTranslation } from '@office/i18n';
import { Button, Skeleton } from '@office/ui-kit';
import { prepareExportSnapshot } from '@office/xlsx-io';
import { LocaleType, type FUniver, type IWorkbookData } from '@univerjs/presets';
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const PrintPreviewModal = lazy(() =>
  import('@/modules/print').then((m) => ({ default: m.PrintPreviewModal })),
);

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
  const [selectionRange, setSelectionRange] = useState<SheetCellRange | null>(null);
  const getWorkbookDataRef = useRef<GetWorkbookData | null>(null);
  const univerLocale = useMemo(
    () => (getStoredLocale() === 'vi' ? LocaleType.VI_VN : LocaleType.EN_US),
    [],
  );

  useEffect(() => {
    if (id) {
      setActiveId(id);
      markOpened(id);
    }
  }, [id, setActiveId, markOpened]);

  const activeWorksheetId =
    univerAPI?.getActiveWorkbook()?.getActiveSheet()?.getSheetId() ||
    activeSheet?.data?.sheetOrder?.[0] ||
    'sheet-01';

  const handleRemoteDataChange = useCallback(
    (workbook: IWorkbookData) => {
      updateData(workbook);
    },
    [updateData],
  );

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

  const chartsState = useSheetChartsState({
    activeWorksheetId,
    updateCharts,
    syncLocalCharts,
  });
  const imagesState = useFloatingImagesState({ activeWorksheetId });
  const commentsState = useCellComments({ univerAPI, activeWorksheetId, currentUser });

  const aggregate = useSelectionAggregate(univerAPI, selectionRange);

  const { replaceCharts } = chartsState;
  useEffect(() => {
    replaceCharts(activeSheet?.charts);
  }, [activeSheet?.id, activeSheet?.charts, replaceCharts]);

  const handleInternalDataChange = useCallback(
    (data: IWorkbookData) => {
      updateData(data);
      syncLocalWorkbook(data);
    },
    [updateData, syncLocalWorkbook],
  );

  const handleSelectionChange = useCallback(
    (sheetId: string, range: SheetCellRange) => {
      setSelectionRange(range);
      broadcastSelection(sheetId, range);
    },
    [broadcastSelection],
  );

  const { handleOpenAddComment } = commentsState;
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
    if (!activeSheet) return;
    setExporting(true);
    try {
      const data = univerAPI ? await prepareExportSnapshot(univerAPI) : getWorkbookDataRef.current?.();
      const snapshot = data ?? activeSheet?.data;
      if (!snapshot) return;
      const blob = await exportXlsxFile(activeSheet.id, snapshot, chartsState.charts);
      const filename = `${activeSheet?.title || 'workbook'}.xlsx`;
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('[sheets] export failed:', error);
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
        onInsertChart={chartsState.handleInsertChart}
        onInsertImage={() => setIsInsertImageDialogOpen(true)}
        onAddComment={commentsState.handleOpenAddComment}
        onOpenCommentsSidebar={() => setIsCommentsSidebarOpen(true)}
      />
      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <SheetEditor
            key={`${activeSheet.id}:${univerLocale}`}
            initialData={activeSheet.data}
            onDataChange={handleInternalDataChange}
            onSelectionChange={handleSelectionChange}
            onReady={setUniverAPI}
            getWorkbookDataRef={getWorkbookDataRef}
            locale={univerLocale}
            charts={chartsState.charts}
            selectedChartId={chartsState.selectedChartId}
            images={imagesState.images}
            selectedImageId={imagesState.selectedImageId}
            threads={commentsState.threads}
            activeSheetId={activeWorksheetId}
            isDark={false}
            presences={presences}
            currentUserId={currentUser.id}
            onSelectChart={chartsState.handleSelectChart}
            onDoubleClickChart={(chartId) => {
              chartsState.handleSelectChart(chartId);
              chartsState.setIsInspectorOpen(true);
            }}
            onUpdateChartPosition={chartsState.handleUpdateChartPosition}
            onDeleteChart={chartsState.handleDeleteChart}
            onInsertChart={chartsState.handleInsertChart}
            onSelectImage={imagesState.setSelectedImageId}
            onUpdateImagePosition={imagesState.handleUpdateImagePosition}
            onDeleteImage={imagesState.handleDeleteImage}
            onSelectCommentThread={(thread) => {
              commentsState.setActiveThread(thread);
              commentsState.setIsCommentPopoverOpen(true);
            }}
          />
        </div>

        <ChartInspector
          spec={chartsState.selectedChart}
          isOpen={chartsState.isInspectorOpen}
          onClose={() => chartsState.setIsInspectorOpen(false)}
          onUpdateSpec={chartsState.handleUpdateChartSpec}
          onDeleteChart={() =>
            chartsState.selectedChartId &&
            chartsState.handleDeleteChart(chartsState.selectedChartId)
          }
        />

        <CommentsSidebar
          threads={commentsState.threads}
          isOpen={isCommentsSidebarOpen}
          onClose={() => setIsCommentsSidebarOpen(false)}
          onSelectThread={(thread) => {
            commentsState.setActiveThread(thread);
            commentsState.setIsCommentPopoverOpen(true);
          }}
        />
      </main>

      <SheetsStatusbar aggregate={aggregate} />

      <ShareDialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        sheetId={activeSheet.id}
      />

      <Suspense fallback={null}>
        <PrintPreviewModal
          open={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          workbookData={getWorkbookDataRef.current?.() ?? activeSheet.data}
          activeSheetId={activeWorksheetId}
          documentTitle={activeSheet.title}
        />
      </Suspense>

      <InsertImageDialog
        open={isInsertImageDialogOpen}
        onClose={() => setIsInsertImageDialogOpen(false)}
        onInsertImage={imagesState.handleInsertImage}
      />

      <CellCommentPopover
        thread={commentsState.activeThread}
        currentUser={currentUser}
        isOpen={commentsState.isCommentPopoverOpen}
        onClose={() => commentsState.setIsCommentPopoverOpen(false)}
        onAddReply={commentsState.handleAddReply}
        onToggleResolve={commentsState.handleToggleResolve}
        onDeleteThread={commentsState.handleDeleteThread}
      />
    </div>
  );
};

export default EditorPage;
