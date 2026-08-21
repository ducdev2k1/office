import type { FUniver } from '@univerjs/presets';

export type SheetWorksheet = NonNullable<
  ReturnType<NonNullable<ReturnType<FUniver['getActiveWorkbook']>>['getActiveSheet']>
>;

export type SheetRange = NonNullable<ReturnType<SheetWorksheet['getActiveRange']>>;

export const copyRangeToClipboard = async (range: SheetRange | null) => {
  if (!range) return;
  try {
    const values = range.getValues() as unknown[][];
    const text = values.map((row) => row.join('\t')).join('\n');
    if (text) await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard fallback
  }
};

export const pasteClipboardToRange = async (range: SheetRange | null) => {
  if (!range) return;
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return;
    const rows = text.split(/\r?\n/).map((r) => r.split('\t'));
    if (rows.length === 1 && rows[0]?.length === 1 && rows[0][0] !== undefined) {
      range.setValue(rows[0][0]);
    } else {
      range.setValues(rows);
    }
  } catch {
    // Clipboard permission denied
  }
};

export const insertRowsAround = (
  ws: SheetWorksheet | null,
  range: SheetRange | null,
  above: boolean,
) => {
  if (!ws || !range) return;
  const count = range.getHeight() || 1;
  const rowIndex = range.getRow();
  if (above) {
    ws.insertRowsBefore(rowIndex, count);
  } else {
    ws.insertRowsAfter(rowIndex + count - 1, count);
  }
};

export const insertColumnsAround = (
  ws: SheetWorksheet | null,
  range: SheetRange | null,
  left: boolean,
) => {
  if (!ws || !range) return;
  const count = range.getWidth() || 1;
  const colIndex = range.getColumn();
  if (left) {
    ws.insertColumnsBefore(colIndex, count);
  } else {
    ws.insertColumnsAfter(colIndex + count - 1, count);
  }
};

export const deleteSelectedRows = (ws: SheetWorksheet | null, range: SheetRange | null) => {
  if (!ws || !range) return;
  ws.deleteRows(range.getRow(), range.getHeight() || 1);
};

export const deleteSelectedColumns = (ws: SheetWorksheet | null, range: SheetRange | null) => {
  if (!ws || !range) return;
  ws.deleteColumns(range.getColumn(), range.getWidth() || 1);
};

export const freezeWorksheet = (
  ws: SheetWorksheet | null,
  type: 'row1' | 'col1' | 'upToRow' | 'upToCol' | 'unfreeze',
  range: SheetRange | null,
) => {
  if (!ws) return;
  switch (type) {
    case 'row1':
      ws.setFrozenRows(1);
      break;
    case 'col1':
      ws.setFrozenColumns(1);
      break;
    case 'upToRow':
      if (range) ws.setFrozenRows(range.getRow() + (range.getHeight() || 1));
      break;
    case 'upToCol':
      if (range) ws.setFrozenColumns(range.getColumn() + (range.getWidth() || 1));
      break;
    case 'unfreeze':
      ws.cancelFreeze();
      break;
  }
};

export const sortRangeOrSheet = (
  ws: SheetWorksheet | null,
  range: SheetRange | null,
  ascending: boolean,
) => {
  if (!ws || !range) return;
  try {
    const colIndex = range.getColumn();
    (ws as unknown as { sort?: (col: number, asc: boolean) => void })?.sort?.(colIndex, ascending);
  } catch {
    // Sort fallback
  }
};
