# Report Phase 1 — Sheets Completion: Formula depth + harness corpus + perf smoke

Date: 2026-08-24
Plan: `plans/260824-sheets-completion/phase-01-formula-harness-perf.md`
Status: Hoàn tất

## 1. Tóm tắt

Ba mục tiêu trục file của Phase 1 hoàn tất: (1) **formula export giữ cached value** qua chuỗi recalc headless mới (`prepareExportSnapshot`), (2) **harness fidelity corpus tổng hợp** phủ đủ Lớp A (.xlsx) với báo cáo % theo nhóm phần tử, (3) **perf smoke** tách import/export với ngưỡng 2× baseline. Thêm phát hiện quan trọng: engine-formula OSS đã cài sẵn **511 hàm**, thiếu duy nhất SPLIT trong baseline 120 hàm cốt lõi. Smoke Puppeteer export end-to-end PASS.

## 2. Formula depth — cached value khi export

### Phát hiện kỹ thuật

- ExcelJS **không bao giờ serialize `calcPr`/fullCalcOnLoad** ra file (model-only). Với formula thiếu result, ExcelJS ghi `<f>` mà không có `<v>` → Excel/LibreOffice tự tính lại khi mở (contract đúng nằm ở XML, test assert ở mức này).
- Univer trên Node ESM dính bug `import { parse } from "opentype.js"` vì `@univerjs/docs`/`@univerjs/sheets` import thẳng `engine-render`. Giải pháp cho test headless: chạy ở **chế độ CJS** (`src/__tests__/node/package.json` với `"type": "commonjs"`) + **plugin mode tối giản** (docs + engine-formula + sheets + sheets-formula + numfmt), dùng `FUniver.newAPI(univer)`.

### Thay đổi

| File | Nội dung |
| --- | --- |
| `packages/xlsx-io/src/recalculate.utils.ts` (mới) | `prepareExportSnapshot(univerAPI)` — gọi `getFormula().executeCalculation()` → chờ `onCalculationResultApplied()` (timeout 5s) → `save()`. Structural typing, KHÔNG thêm runtime dep vào src |
| `packages/xlsx-io/src/univerToExceljs.utils.ts` | Đếm formula thiếu result; `console.warn` tổng hợp theo sheet |
| `apps/sheets/src/pages/EditorPage.tsx` | `handleExport` dùng `prepareExportSnapshot(univerAPI)` thay vì save trực tiếp |
| `packages/xlsx-io/src/index.ts` | Export helper mới |

### Kết quả kiểm kê hàm (`pnpm --filter @office/xlsx-io exec tsx scripts/inventory/formula-inventory.cjs`)

Engine đăng ký **511 hàm**. Baseline 120 hàm cốt lõi Google Sheets/Excel:

- Toán 21/21 · Logic 11/11 · Thống kê 22/22 · Văn bản 21/22 (**thiếu SPLIT**) · Ngày giờ 18/18 · Tra cứu 18/18 · Tài chính 8/8
- → Không cần thêm engine nào (HyperFormula không cần thiết, đúng ràng buộc Chuẩn bản mở).

## 3. Freeze panes (bổ sung ngoài kế hoạch — Lớp A yêu cầu)

Trước phase này freeze bị hardcode `{xSplit:0, ySplit:0}` cả hai chiều. Đã map chuẩn theo docs Univer IFreeze:

- Import: `ws.views[state=frozen]` → `{xSplit, ySplit, startRow=ySplit|-1, startColumn=xSplit|-1}`
- Export: ngược lại kèm `topLeftCell`

Test: `freeze.test.ts` (3 case) — PASS.

## 4. Harness fidelity corpus tổng hợp Lớp A

| File | Vai trò |
| --- | --- |
| `src/__tests__/corpus-generator.utils.ts` | Sinh 6 file xlsx phủ Lớp A: values (number/string/bool/error/richText), formulas (+cross-sheet), styles đầy đủ, merges/sizes, multi-sheet+hidden+order, freeze 3 dạng |
| `src/__tests__/fidelity.utils.ts` | `compareWorkbooks(original, roundtrip)` → % theo 7 nhóm: sheets/cells/formulas/styles/merges/sizes/freeze (width tolerance ±8px do đơn vị Excel lossy) |
| `src/__tests__/fidelity.test.ts` | Chạy corpus qua pipeline, assert mọi nhóm ≥95% |
| `scripts/gen-corpus.ts` | CLI ghi corpus ra `/tmp/office-xlsx-corpus` để mở tay |

Kết quả: **PASS toàn bộ** — formulas/styles/merges/freeze 100%; điểm thấp nhất formulas.xlsx overall 97.1% (sizes 50/52 do auto-width heuristic, không phải dữ liệu người dùng).

## 5. Perf smoke

`scripts/perf-check.ts`: median 3 runs, threshold 2× baseline, **tách 2 chỉ số** (baseline cũ chỉ đo import):

| File | Import (limit) | Export (limit) |
| --- | --- | --- |
| sample-small | 9ms / 88ms ✅ | 10ms / 60ms ✅ |
| sample-med | 134ms / 338ms ✅ | 194ms / 240ms ✅ |
| sample-large | 1781ms / 2726ms ✅ | 2422ms / 4800ms ✅ |

Baseline export ghi ngày 2026-08-24. Script: `pnpm --filter @office/xlsx-io perf`.

## 6. Verification

- `pnpm --filter @office/xlsx-io typecheck && pnpm --filter @office/sheets typecheck` ✅
- Full suite `@office/xlsx-io` (8 file test) + `@office/sheets` ✅
- Smoke Puppeteer `smoke-all.ts` (3 file render, 0 lỗi) ✅ và `smoke-export.ts` (download .xlsx thành công, tăng wait 3s→9s để gồm recalc) ✅

## 7. Ghi chú & hạn chế

1. DevDeps mới của xlsx-io (test-only, Apache-2.0/MIT): fflate, @univerjs/presets, @univerjs/docs, @univerjs/engine-formula, @univerjs/sheets, @univerjs/sheets-formula, @univerjs/sheets-numfmt — tất cả pin 0.23.0.
2. Test headless bắt buộc CJS do bug opentype ESM của engine-render — ghi chú tại `src/__tests__/node/package.json`.
3. Auto column-width heuristic của converter là lossy (px↔char) — fidelity nhóm sizes dùng tolerance, không ảnh hưởng dữ liệu người dùng đặt width tường minh (round-trip chính xác trong ±8px).
4. `SPLIT` (Google Sheets đặc thù) chưa có trong engine — liệt kê limitation, cân nhắc custom function ở phase sau nếu cần.

## 8. Code review & xử lý

Code-review agent đánh giá **PASS** trên toàn bộ Phase 1. Đã xử lý ngay trong phase:

| Finding | Xử lý |
| --- | --- |
| F1 major — timer leak khi `onCalculationResultApplied` reject | ✅ `clearTimeout` chuyển vào `finally` (`recalculate.utils.ts`) |
| F2 major — `exceljsToUniver.utils.ts` 599 dòng (>400) | ✅ Tách thành `exceljs-color.utils.ts`, `exceljs-style-presets.constants.ts`, `exceljs-range.utils.ts`, `exceljs-enrichment.utils.ts` — file chính còn 338 dòng, full test PASS |
| F4 minor — `collectCells` gọi lặp O(n²) | ✅ Cache trước vòng lặp |
| F6 minor — nuốt error trước alert export | ✅ Thêm `console.error` |
| F8/F9 nit — inline type import / format | ✅ Sửa |

Chuyển sang phase sau (theo khuyến nghị reviewer):

- **F3** (minor): clamp width bất đối xứng (export min 8 chars ↔ import min 45px) gây drift cột hẹp — xử lý khi làm harness Bộ mẫu thật ở Phase 5.
- **F5** (minor): wire `test + perf` vào CI/turbo — cần quyết hạ tầng CI chung, ghi backlog.
- **F10** (nit): recalc hook đặt tại `EditorPage.handleExport` thay vì service như plan viết — tương đương chức năng.

## 9. Next steps (Phase 2 — UX parity)

Freeze UI confirm, status bar sum/count/avg, context menu mở rộng, paste special, fill handle, shortcut chuẩn.
