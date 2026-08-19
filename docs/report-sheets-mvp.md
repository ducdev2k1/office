# Report MVP Sheets — xlsx-io import/export

Date: 2026-08-19
Status: Hoàn tất MVP — sẵn sàng cho phase mở rộng
Plan: `plans/260819-sheets-mvp/plan.md`

## 1. Tóm tắt

`@office/xlsx-io` từ placeholder thành package import/export xlsx hoàn chỉnh (ExcelJS). `apps/sheets` chuyển sang dùng package chung, có nút **Open XLSX** và **Export XLSX** + lưu IndexedDB. **Round-trip fidelity 100%** trên 2 file mẫu (600 / 30K cells). Typecheck + build pass cả package và app.

## 2. Kết quả theo phase

### Phase 1 — xlsx-io import (6h → done)
- Converter `exceljsToUniver` chuyển từ `apps/sheets` sang `packages/xlsx-io/src/exceljsToUniver.utils.ts` (import `@univerjs/core`, không dùng presets nặng).
- API: `parseXlsxBuffer`, `parseXlsxFile`, `exceljsToUniver`.
- Test `src/__tests__/import.test.ts` pass với 3 file (600 / 30K / 400K cells).

### Phase 2 — xlsx-io export (8h → done)
- `univerToExceljs(data: IWorkbookData): Promise<ArrayBuffer>` — map ngược toàn bộ: cell value + formula (`{formula, result}`), style (font/fill/border/alignment/numFmt), merge, row/col size, hidden sheet.
- Test export pass: file mở lại đọc đúng text, number, formula, bold, fill, numFmt, merge.

### Phase 3 — Tích hợp apps/sheets (5h → done)
- Bỏ converter cục bộ, apps dùng `@office/xlsx-io`.
- Nút **Export XLSX**: `getActiveWorkbook().save()` → `univerToExceljs` → download + lưu IndexedDB qua `createDocumentStore('sheets')`.
- `StoredDocument` thêm field `data?` (cho sheets/slides lưu snapshot).
- Smoke test (Puppeteer): Open → Export → file download >0 bytes, 0 lỗi console/HTTP; file export mở lại đúng.

### Phase 4 — Verify round-trip (4h → done)
- `src/__tests__/roundtrip.test.ts`: import → export → import lại.
  - small (600 cells): **fidelity 100%** (cells 100%, merges 100%, styles 100%, A1 khớp).
  - med (30K cells): **fidelity 100%**.
- Bundle: index chunk 6.94MB raw / ~1.97MB gzip — không tăng so với khảo sát (ExcelJS đã nằm sẵn trong bundle).

## 3. Số liệu hiệu năng (cập nhật)

| File | Kích thước | Cells | Parse+Convert (ms) |
|------|-----------|-------|-------------------|
| sample-small | 11 KB | 600 | ~44 |
| sample-med | 160 KB | 30K | ~169 |
| sample-large | 1.9 MB | 400K | ~1363 |

Export nhanh hơn import (writeBuffer tối ưu) — chưa đo riêng, có thể thêm sau.

## 4. Ghi chú kỹ thuật quan trọng

- **Formula export**: snapshot chứa `f` (formula) nhưng `v` (cached value) có thể undefined — ExcelJS nhận `{formula, result}`; nếu result thiếu thì Excel không tính khi mở (kết quả `#VALUE!`), dự kiến cần `univerAPI` tính hoặc HyperFormula sau này.
- **Style id round-trip**: `exceljsToUniver` sinh id ngẫu nhiên (`sxxxx`) — qua round-trip id thay đổi nhưng nội dung style dedup giữ nguyên (3 style cho file mẫu). So sánh fidelity bỏ qua id, chỉ so nội dung.
- **Merge**: Univer dùng `endRow/endColumn` **exclusive**; khi export phải trừ 1; đã xử lý.
- **`StoredDocument.data?`** thêm vào `storage-adapter` — không phá docs cũ (field optional).

## 5. Files

```
packages/xlsx-io/src/
├── exceljsToUniver.utils.ts   # ExcelJS → IWorkbookData (chuyển từ apps)
├── univerToExceljs.utils.ts   # IWorkbookData → xlsx (mới)
├── parse-xlsx.utils.ts        # parseXlsxBuffer / parseXlsxFile
├── index.ts, types.ts
└── __tests__/                 # import, export, roundtrip (tsx)
apps/sheets/src/
├── services/xlsx.service.ts   # parseXlsxFile + exportXlsxFile (qua xlsx-io)
├── components/SheetEditor.tsx # + getWorkbookDataRef
├── hooks/useUniver.ts         # + getWorkbookData()
└── pages/EditorPage.tsx       # Open/Export + IndexedDB
packages/i18n: sheets namespace + export/exporting/exportError (vi/en)
packages/storage-adapter: StoredDocument + data?
```

## 6. Next steps (đề xuất)

1. **Formula tính khi export**: dùng Facade API để đánh dấu workbook dirty → tính formula trước khi save, hoặc tích hợp HyperFormula (giữ OSS).
2. **Lazy-load**: tách Univer + ExcelJS thành chunks riêng (bundle 1.97MB gzip vẫn lớn).
3. **IndexedDB load lại**: mở file đã lưu từ store (hiện chỉ lưu khi Export).
4. **Export nâng cao**: print/PDF (html2canvas), images/charts (hoãn theo khảo sát).
5. **Thêm test file lớn (400K cells)** vào round-trip (hiện small+med để test nhanh).
6. Xoá `scripts/` nếu không cần regression (hiện giữ làm suite).