# Phase 2: xlsx-io export — `univerToExceljs` (snapshot → xlsx)

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 8h
- Mục tiêu: viết chiều export — nhận `IWorkbookData` (từ `univerAPI.getActiveWorkbook().save()` hoặc từ import) → tạo file xlsx qua ExcelJS. Đây là chiều bắt buộc để MVP có vòng tròn mở-sửa-lưu.

## Requirements

1. Tạo `packages/xlsx-io/src/univerToExceljs.utils.ts`:
   - `univerToExceljs(data: IWorkbookData): Promise<ArrayBuffer>` — build workbook, `wb.xlsx.writeBuffer()`.
   - Map ngược từng phần:
     - **Workbook**: `name` → `wb.title`.
     - **Sheets**: `sheetOrder` + `sheets[id]` → `wb.addWorksheet(name)`; đặt `ws.name` từ data; `rowCount`/`columnCount` → `ws.rowCount` (hoặc dùng cellData max).
     - **Cell value**: `cellData[row][col]` → `ws.getCell(row, col)`; nếu `f` có → `cell.value = { formula: f.slice(1), result: v }`; nếu `t === BOOLEAN` → boolean; `t === NUMBER` → number; else string.
     - **Style**: style id → `styles[id]` → `cell.font` (bold/italic/size/name/color/underline từ `bl/it/fs/ff/cl/ul`), `cell.fill` (từ `bg`), `cell.border` (từ `bd` t/r/b/l), `cell.alignment` (từ `ht/vt/tb`), `cell.numFmt` (từ `n.pattern`).
     - **Merge**: `mergeData` (startRow/startColumn/endRow/endColumn, end **exclusive**) → `ws.mergeCells(startRow, startColumn, endRow - 1, endColumn - 1)`.
     - **Row height / col width**: `rowData[r].h`, `columnData[c].w`.
2. Handle edge cases: cell trong merge (chỉ ghi giá trị ô top-left), hidden sheet (`hidden === 1` → `ws.state = 'hidden'`), tabColor nếu có.
3. Test: `packages/xlsx-io/src/__tests__/export.test.ts` — import sample-med → export → parse lại bằng ExcelJS → assert sheet name, cell A1 text, formula cell, merge range, style (bold header, fill, border), width.

## Success criteria

- `pnpm --filter @office/xlsx-io typecheck` pass.
- Test export pass: file export mở lại bằng ExcelJS đọc đúng nội dung chính (text, number, formula, merge, bold/fill).
- `wb.xlsx.writeBuffer()` trả ArrayBuffer hợp lệ (>0 bytes).

## Notes

- Formula export: khi `f` có nhưng `v` undefined → chỉ ghi `{ formula }`; ExcelJS cần `result` optional.
- Border enum `BorderStyleTypes` (1=THIN...) map ngược về chuỗi ExcelJS (`thin/medium/double/...`).
- Alignment `ht` (HorizontalAlign: 1=LEFT, 2=CENTER, 3=RIGHT), `vt` (1=TOP, 2=MIDDLE, 3=BOTTOM), `tb` (WrapStrategy.WRAP=3 → `wrapText: true`).