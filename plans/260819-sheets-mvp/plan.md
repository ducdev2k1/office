---
title: 'Sheets MVP - xlsx-io import/export + tich hop apps/sheets'
description: '4 phase: xlsx-io import (ExcelJS -> snapshot), xlsx-io export (snapshot -> ExcelJS), tich hop apps/sheets (export button + IndexedDB), verify round-trip. Kết quả: apps/sheets mở/sửa/lưu xlsx cục bộ.'
status: completed
priority: P1
effort: 23h
branch: main
tags: [feature, sheets, xlsx-io, exceljs, univer]
created: 2026-08-19
---

# Plan: Sheets MVP — xlsx-io import/export + tích hợp apps/sheets

## Overview

Sau khảo sát GO (`docs/report-sheets-univer-survey.md`), xây MVP Sheets: hoàn thiện `@office/xlsx-io` (đang placeholder) thành package import/export xlsx qua ExcelJS, chuyển converter đã chứng minh từ `apps/sheets` vào package dùng chung, thêm chiều **export** (snapshot → xlsx), tích hợp vào `apps/sheets` (nút Open/Export + lưu IndexedDB qua `storage-adapter`), verify bằng round-trip test.

Tuân thủ AGENTS.md: relative import trong package, path alias `@/*` trong apps, arrow function, const, ≤400 dòng/file, file suffix convention.

## Phases

| #  | Phase                                                                   | File                               | Effort | Status     |
|----|-------------------------------------------------------------------------|------------------------------------|--------|------------|
| 1  | xlsx-io import: chuyển `exceljsToUniver` vào package + test              | `phase-01-xlsx-import.md`          | 6h     | completed  |
| 2  | xlsx-io export: `univerToExceljs` (snapshot → xlsx) + test               | `phase-02-xlsx-export.md`          | 8h     | completed  |
| 3  | Tích hợp apps/sheets: export button + lưu IndexedDB + remount            | `phase-03-integrate-apps-sheets.md`| 5h     | completed  |
| 4  | Verify round-trip + bundle + report MVP                                  | `phase-04-verify-roundtrip.md`     | 4h     | completed  |

**Tổng effort: 23h**

## Dependencies

- Phase 1 trước Phase 2 (import là nền cho round-trip test export).
- Phase 2 trước Phase 3 (export button cần `univerToExceljs` sẵn sàng).
- Phase 3 trước Phase 4 (verify trên apps/sheets thật).
- Verify mỗi phase: `pnpm --filter @office/xlsx-io typecheck` (Phase 1–2), `pnpm --filter @office/sheets typecheck && build` (Phase 3–4).

## Ghi chú kỹ thuật xuyên suốt

- **Import**: `ExcelJS.Workbook().xlsx.load(buffer)` → `exceljsToUniver(wb): IWorkbookData` (chuyển nguyên từ `apps/sheets/src/utils/exceljsToUniver.utils.ts`, không thay đổi logic đã chứng minh).
- **Export**: `univerAPI.getActiveWorkbook().save()` → `IWorkbookData` → `univerToExceljs(data): Blob` (map ngược: cellData → cell.value, styles map → font/fill/border/alignment/numFmt, mergeData → `ws.mergeCells`, rowData/columnData → height/width). Dùng `wb.xlsx.writeBuffer()`.
- **Round-trip test**: import `sample-med.xlsx` → save snapshot → export → import lại → so sánh cell value + merge + style count (tolerance). Chạy bằng `tsx` script trong package.
- **apps/sheets**: bỏ converter khỏi utils (đã chuyển vào xlsx-io), `parseXlsxFile` import từ `@office/xlsx-io`; thêm nút Export XLSX; lưu workbook JSON qua `createDocumentStore()` (IndexedDB) khi bấm Export.
- **Remount**: giữ pattern `key={workbook?.id}` đã dùng trong khảo sát (Univer mount 1 lần qua useEffect).
- **Formula export**: ExcelJS nhận `{ formula, result }` — lấy `v` (cached value) từ snapshot khi có `f`.
- Không implement xuyên phase; mỗi phase có success criteria riêng.