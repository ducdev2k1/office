# Phase 4: Verify round-trip + bundle + report MVP

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 4h
- Mục tiêu: kiểm chứng vòng tròn import → edit → export → import lại không mất dữ liệu, đo bundle sau khi chuyển sang xlsx-io, viết report MVP.

## Requirements

1. **Round-trip test tự động** (`packages/xlsx-io/src/__tests__/roundtrip.test.ts`, chạy tsx):
   - Với mỗi file mẫu (small/med): `import` → `export` → `import` lại.
   - Assert: số sheet bằng nhau, tên sheet giống, số cell (đếm cellData) bằng nhau, giá trị 1 số ô đại diện giống (A1, ô formula), merge count bằng nhau, style count bằng nhau (tolerance ±).
   - In ra tỉ lệ khớp (fidelity %).
2. **Bundle measure**: `pnpm --filter @office/sheets build` → ghi lại size chunk chính. So sánh với khảo sát (index 1.97MB gzip). Mục tiêu: không tăng đáng kể (xlsx-io nhẹ).
3. **Smoke test đầy đủ**: mở dev → Open xlsx → Export → xác nhận file + IndexedDB record (reuse `scripts/smoke-test2.ts` mở rộng).
4. **Report**: `docs/report-sheets-mvp.md` — tóm tắt phạm vi MVP đã làm, số liệu round-trip fidelity, bundle, hướng dẫn chạy, đề xuất phase tiếp theo (export nâng cao, charts, lưu trữ cloud).

## Success criteria

- Round-trip: **fidelity ≥ 98%** cho small/med (cell value + merge + style).
- Bundle: main chunk không tăng >15% so với khảo sát (do ExcelJS đã nằm trong bundle trước).
- Smoke test pass (Open → Export → file >0 bytes, IndexedDB có record).
- Report MVP có số liệu thật + next steps.

## Notes

- Fidelity thấp hơn 100% là chấp nhận được ở các vùng không map (ví dụ conditional formatting, data validation không thuộc phạm vi MVP) — ghi rõ trong report.
- Giữ `scripts/` trong apps/sheets (gen-samples, smoke-test, perf) làm regression suite.