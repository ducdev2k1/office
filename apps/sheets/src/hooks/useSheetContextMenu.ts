import { CONTEXT_MENU_ICONS } from '@/constants/contextMenu.constants';
import type { ContextMenuItem, ContextMenuPosition } from '@/types/contextMenu.types';
import {
  copyRangeToClipboard,
  deleteSelectedColumns,
  deleteSelectedRows,
  freezeWorksheet,
  insertColumnsAround,
  insertRowsAround,
  pasteClipboardToRange,
  sortRangeOrSheet,
  type SheetRange,
  type SheetWorksheet,
} from '@/utils/contextMenu.utils';
import { useTranslation } from '@office/i18n';
import type { FUniver } from '@univerjs/presets';
import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';

export interface UseSheetContextMenuOptions {
  univerAPI: FUniver | null;
  containerRef: RefObject<HTMLDivElement | null>;
  onInsertChart?: () => void;
}

export const useSheetContextMenu = ({
  univerAPI,
  containerRef,
  onInsertChart,
}: UseSheetContextMenuOptions) => {
  const { t } = useTranslation('sheets');
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);
  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);
  const [currentCoord, setCurrentCoord] = useState<{ row: number; col: number }>({
    row: 0,
    col: 0,
  });

  const getWorksheet = useCallback((): SheetWorksheet | null => {
    return (univerAPI?.getActiveWorkbook()?.getActiveSheet() as SheetWorksheet) ?? null;
  }, [univerAPI]);

  const getActiveRange = useCallback((): SheetRange | null => {
    const ws = getWorksheet();
    return (ws?.getActiveRange() || ws?.getSelection()?.getActiveRange() || null) as SheetRange | null;
  }, [getWorksheet]);

  const closeMenu = useCallback(() => {
    setPosition(null);
    setActiveSubmenuId(null);
  }, []);

  const runAndClose = useCallback(
    (action?: () => unknown | Promise<unknown>) => {
      void Promise.resolve(action?.()).then(() => {
        closeMenu();
      });
    },
    [closeMenu],
  );

  const handleCut = useCallback(async () => {
    const range = getActiveRange();
    await copyRangeToClipboard(range);
    range?.clearContent();
  }, [getActiveRange]);

  const handleCopy = useCallback(async () => {
    const range = getActiveRange();
    await copyRangeToClipboard(range);
  }, [getActiveRange]);

  const handlePaste = useCallback(async () => {
    const range = getActiveRange();
    await pasteClipboardToRange(range);
  }, [getActiveRange]);

  const handleInsertLink = useCallback(() => {
    const range = getActiveRange();
    if (!range) return;
    const url = window.prompt(t('toolbar.insert.linkPrompt'), 'https://');
    if (url) range.setValue(url);
  }, [getActiveRange, t]);

  const menuItems = useMemo<ContextMenuItem[]>(() => {
    const ws = getWorksheet();
    const range = getActiveRange();
    const rowNumber = currentCoord.row + 1;
    const colNumber = currentCoord.col + 1;

    return [
      {
        id: 'cut',
        label: t('contextMenu.cut'),
        icon: CONTEXT_MENU_ICONS.cut,
        shortcut: 'Ctrl+X',
        onClick: () => runAndClose(handleCut),
      },
      {
        id: 'copy',
        label: t('contextMenu.copy'),
        icon: CONTEXT_MENU_ICONS.copy,
        shortcut: 'Ctrl+C',
        onClick: () => runAndClose(handleCopy),
      },
      {
        id: 'paste',
        label: t('contextMenu.paste'),
        icon: CONTEXT_MENU_ICONS.paste,
        shortcut: 'Ctrl+V',
        onClick: () => runAndClose(handlePaste),
      },
      {
        id: 'pasteSpecial',
        label: t('contextMenu.pasteSpecial'),
        icon: CONTEXT_MENU_ICONS.pasteSpecial,
        dividerAfter: true,
        subitems: [
          {
            id: 'pasteValues',
            label: t('contextMenu.pasteValuesOnly'),
            icon: CONTEXT_MENU_ICONS.pasteValues,
            shortcut: 'Ctrl+Shift+V',
            onClick: () => runAndClose(handlePaste),
          },
          {
            id: 'pasteFormat',
            label: t('contextMenu.pasteFormatOnly'),
            icon: CONTEXT_MENU_ICONS.pasteFormat,
            onClick: () => runAndClose(handlePaste),
          },
        ],
      },
      {
        id: 'insert',
        label: t('contextMenu.insert'),
        icon: CONTEXT_MENU_ICONS.insert,
        subitems: [
          {
            id: 'insertRowAbove',
            label: t('contextMenu.insertRowAbove'),
            icon: CONTEXT_MENU_ICONS.rowAbove,
            onClick: () => runAndClose(() => insertRowsAround(ws, range, true)),
          },
          {
            id: 'insertRowBelow',
            label: t('contextMenu.insertRowBelow'),
            icon: CONTEXT_MENU_ICONS.rowBelow,
            onClick: () => runAndClose(() => insertRowsAround(ws, range, false)),
          },
          {
            id: 'insertColumnLeft',
            label: t('contextMenu.insertColumnLeft'),
            icon: CONTEXT_MENU_ICONS.colLeft,
            onClick: () => runAndClose(() => insertColumnsAround(ws, range, true)),
          },
          {
            id: 'insertColumnRight',
            label: t('contextMenu.insertColumnRight'),
            icon: CONTEXT_MENU_ICONS.colRight,
            onClick: () => runAndClose(() => insertColumnsAround(ws, range, false)),
          },
        ],
      },
      {
        id: 'delete',
        label: t('contextMenu.delete'),
        icon: CONTEXT_MENU_ICONS.delete,
        danger: true,
        dividerAfter: true,
        subitems: [
          {
            id: 'deleteRow',
            label: t('contextMenu.deleteRow'),
            icon: CONTEXT_MENU_ICONS.delete,
            danger: true,
            onClick: () => runAndClose(() => deleteSelectedRows(ws, range)),
          },
          {
            id: 'deleteColumn',
            label: t('contextMenu.deleteColumn'),
            icon: CONTEXT_MENU_ICONS.delete,
            danger: true,
            onClick: () => runAndClose(() => deleteSelectedColumns(ws, range)),
          },
        ],
      },
      {
        id: 'clear',
        label: t('contextMenu.clear'),
        icon: CONTEXT_MENU_ICONS.clear,
        dividerAfter: true,
        subitems: [
          {
            id: 'clearAll',
            label: t('contextMenu.clearAll'),
            icon: CONTEXT_MENU_ICONS.clearAll,
            onClick: () => runAndClose(() => range?.clear()),
          },
          {
            id: 'clearContents',
            label: t('contextMenu.clearContents'),
            icon: CONTEXT_MENU_ICONS.clearContents,
            onClick: () => runAndClose(() => range?.clearContent()),
          },
          {
            id: 'clearFormats',
            label: t('contextMenu.clearFormats'),
            icon: CONTEXT_MENU_ICONS.clearFormats,
            shortcut: 'Ctrl+\\',
            onClick: () => runAndClose(() => range?.clearFormat()),
          },
        ],
      },
      {
        id: 'freeze',
        label: t('contextMenu.freeze'),
        icon: CONTEXT_MENU_ICONS.freeze,
        subitems: [
          {
            id: 'freezeFirstRow',
            label: t('contextMenu.freezeFirstRow'),
            icon: CONTEXT_MENU_ICONS.freeze,
            onClick: () => runAndClose(() => freezeWorksheet(ws, 'row1', range)),
          },
          {
            id: 'freezeFirstColumn',
            label: t('contextMenu.freezeFirstColumn'),
            icon: CONTEXT_MENU_ICONS.freeze,
            onClick: () => runAndClose(() => freezeWorksheet(ws, 'col1', range)),
          },
          {
            id: 'freezeUpToRow',
            label: t('contextMenu.freezeUpToRow', { row: rowNumber }),
            icon: CONTEXT_MENU_ICONS.freeze,
            onClick: () => runAndClose(() => freezeWorksheet(ws, 'upToRow', range)),
          },
          {
            id: 'freezeUpToColumn',
            label: t('contextMenu.freezeUpToColumn', { col: colNumber }),
            icon: CONTEXT_MENU_ICONS.freeze,
            onClick: () => runAndClose(() => freezeWorksheet(ws, 'upToCol', range)),
          },
          {
            id: 'unfreeze',
            label: t('contextMenu.unfreeze'),
            icon: CONTEXT_MENU_ICONS.unfreeze,
            onClick: () => runAndClose(() => freezeWorksheet(ws, 'unfreeze', range)),
          },
        ],
      },
      {
        id: 'sort',
        label: t('contextMenu.sort'),
        icon: CONTEXT_MENU_ICONS.sortAsc,
        dividerAfter: true,
        subitems: [
          {
            id: 'sortAsc',
            label: t('contextMenu.sortAsc'),
            icon: CONTEXT_MENU_ICONS.sortAsc,
            onClick: () => runAndClose(() => sortRangeOrSheet(ws, range, true)),
          },
          {
            id: 'sortDesc',
            label: t('contextMenu.sortDesc'),
            icon: CONTEXT_MENU_ICONS.sortDesc,
            onClick: () => runAndClose(() => sortRangeOrSheet(ws, range, false)),
          },
        ],
      },
      {
        id: 'insertLink',
        label: t('contextMenu.insertLink'),
        icon: CONTEXT_MENU_ICONS.link,
        shortcut: 'Ctrl+K',
        onClick: () => runAndClose(handleInsertLink),
      },
      ...(onInsertChart
        ? [
            {
              id: 'insertChart',
              label: t('contextMenu.insertChart'),
              icon: CONTEXT_MENU_ICONS.chart,
              onClick: () => runAndClose(onInsertChart),
            },
          ]
        : []),
    ];
  }, [
    getWorksheet,
    getActiveRange,
    currentCoord,
    t,
    runAndClose,
    handleCut,
    handleCopy,
    handlePaste,
    handleInsertLink,
    onInsertChart,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const range = getActiveRange();
      if (range) {
        setCurrentCoord({
          row: range.getRow(),
          col: range.getColumn(),
        });
      }

      setPosition({ x: e.clientX, y: e.clientY });
      setActiveSubmenuId(null);
    };

    container.addEventListener('contextmenu', handleContextMenu, { capture: true });
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, [containerRef, getActiveRange]);

  useEffect(() => {
    if (!position) return;

    const handleOutside = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest?.('[data-sheet-context-menu]')) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    window.addEventListener('pointerdown', handleOutside, { capture: true });
    window.addEventListener('mousedown', handleOutside, { capture: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handleOutside, { capture: true });
      window.removeEventListener('mousedown', handleOutside, { capture: true });
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, closeMenu]);

  return {
    position,
    menuItems,
    activeSubmenuId,
    setActiveSubmenuId,
    closeMenu,
  };
};
