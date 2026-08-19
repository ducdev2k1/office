# Phase 1: xlsx-io import — chuyển `exceljsToUniver` vào package

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 6h
- Mục tiêu: biến `@office/xlsx-io` từ placeholder thành package import xlsx. Chuyển converter `exceljsToUniver` (đã chứng minh hoạt động trong khảo sát) từ `apps/sheets` vào package, đóng gói API sạch, thêm test so với file mẫu.

## Requirements

1. Cài `exceljs` (MIT) vào `packages/xlsx-io`.
2. Tạo `packages/xlsx-io/src/exceljsToUniver.utils.ts` — copy nguyên converter từ `apps/sheets/src/utils/exceljsToUniver.utils.ts` (logic đã kiểm chứng 400K cells, không đổi).
3. Tạo `packages/xlsx-io/src/xlsx-io.types.ts` — export type alias `XlsxWorkbookData = IWorkbookData` (không phụ thuộc Univer package? **Quyết định**: vì `IWorkbookData` từ `@univerjs/presets` re-export `@univerjs/core`, xlsx-io khai `@univerjs/core` làm dependency trực tiếp — tránh import presets nặng).
4. Tạo `packages/xlsx-io/src/parse-xlsx.utils.ts`:
   - `parseXlsxFile(file: ArrayBuffer | Blob): Promise<IWorkbookData>` — load buffer → ExcelJS → converter.
5. `packages/xlsx-io/src/index.ts` — export `parseXlsxFile`, `exceljsToUniver`, type.
6. Test: `packages/xlsx-io/src/__tests__/import.test.ts` (chạy bằng tsx): import 3 file mẫu từ `apps/sheets/public`, assert sheet count, cell count, style dedup, merge, formula, row/col size.

## Success criteria

- `pnpm --filter @office/xlsx-io typecheck` pass.
- Test tsx pass với 3 file (small/med/large): đúng sheets, cells, styles, merges, formula.
- Không giữ bản copy cũ trong `apps/sheets/src/utils/` (xóa, để apps dùng package — làm ở Phase 3).

## Notes

- ExcelJS phải nằm trong `dependencies` (không phải devDependencies) vì runtime cần.
- `@univerjs/core` trong `dependencies` của xlsx-io (chỉ lấy type + enum, bundle nhẹ hơn presets).
- Convert cell value: giữ nguyên mapping đã chứng minh (number/string/boolean/formula/richText/error/hyperlink/date → `{v,t,f}`).