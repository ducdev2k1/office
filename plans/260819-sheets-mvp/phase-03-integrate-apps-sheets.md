# Phase 3: Tích hợp apps/sheets — export button + lưu IndexedDB

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 5h
- Mục tiêu: chuyển apps/sheets sang dùng `@office/xlsx-io` (bỏ converter cục bộ), thêm nút **Export XLSX**, lưu workbook qua `storage-adapter` (IndexedDB) — hoàn thiện vòng tròn mở-sửa-lưu cục bộ.

## Requirements

1. **Xóa converter cục bộ**: `apps/sheets/src/utils/exceljsToUniver.utils.ts` bị xóa (logic đã vào xlsx-io). Cập nhật `apps/sheets/src/services/xlsx.service.ts` → import từ `@office/xlsx-io`.
2. **Export**: `apps/sheets/src/services/xlsx.service.ts` thêm `exportWorkbook(data: IWorkbookData): Promise<Blob>` → `univerToExceljs` → `new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })`.
3. **EditorPage**: thêm nút "Export XLSX" cạnh "Open XLSX". Handler: `univerAPI.getActiveWorkbook()?.save()` → export → tải về (`URL.createObjectURL` + link download) hoặc trigger file picker lưu (dùng `showSaveFilePicker` nếu có, fallback download).
4. **Lưu IndexedDB**: dùng `createDocumentStore()` từ `@office/storage-adapter`. Lưu bản ghi `{ id, title, updatedAt, kind: 'sheets', data: IWorkbookData }` (mở rộng StoredDocument). Bấm Export → lưu bản ghi IndexedDB song song. Nếu chưa có doc record schema cho sheets, mở rộng `StoredDocument` thêm field optional `data?`.
5. **useUniver**: thêm `getWorkbookData(): IWorkbookData | undefined` helper (wrap `univerAPI.getActiveWorkbook()?.save()`), giữ nguyên pattern mount 1 lần + `key` remount.
6. **i18n**: thêm key `export`, `saved` vào namespace `sheets` (vi/en).

## Success criteria

- `pnpm --filter @office/sheets typecheck` pass (không còn converter cục bộ).
- `pnpm --filter @office/sheets build` pass.
- Puppeteer smoke test: mở page → Open sample-med → click Export → download event xảy ra, file nhận được >0 bytes.
- IndexedDB: sau Export có bản ghi sheets trong store.

## Notes

- Giữ `key={workbook?.id ?? 'empty'}` remount — đã chứng minh hoạt động.
- `storage-adapter` hiện chỉ có `IndexedDbStore` + `createDocumentStore` — dùng trực tiếp; nếu cần field `data`, mở rộng type `StoredDocument` (thêm `data?: unknown`) — thay đổi nhỏ, an toàn cho docs cũ.
- Nút Export disabled khi chưa có workbook.
