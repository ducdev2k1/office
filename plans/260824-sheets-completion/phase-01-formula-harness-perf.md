# Phase 1: Formula depth + harness corpus tổng hợp + perf smoke

## Overview

- **Priority**: P1 | **Status**: planned | **Effort**: 17h
- Mục tiêu: sửa lỗi thật đầu tiên của trục file (formula mất cached value khi export), kiểm kê độ phủ hàm của engine-formula OSS, dựng **harness fidelity corpus tổng hợp** phủ Lớp A (.xlsx) và đưa **perf smoke** vào quy trình để không thoái hoá.

## Requirements

### 1. Fix cached value khi export (~4h)

1. Tại thời điểm export trong `apps/sheets/src/services/xlsx.service.ts`: kích hoạt engine-formula tính lại toàn bộ workbook qua Facade API (đánh dấu dirty → recalculate) trước khi lấy snapshot, bảo đảm mọi cell formula có `{f, v}` đầy đủ.
2. `univerToExceljs` (`packages/xlsx-io`): map `v` → `{formula, result}`; result thiếu thì ghi log cảnh báo thay vì bỏ im (hết `#VALUE!` khi mở ở Excel).
3. Test mới `packages/xlsx-io/src/__tests__/export-formula.test.ts`: workbook có SUM/AVERAGE/cross-sheet ref → export → mở lại bằng ExcelJS → assert `result` có giá trị đúng.

### 2. Kiểm kê độ phủ hàm (~2h)

1. Script/tsx liệt kê hàm mà `@univerjs/engine-formula` đăng ký, đối chiếu 6 nhóm cơ bản Google Sheets: toán, logic, text, date/time, lookup, thống kê.
2. Xuất kết quả vào `docs/report-sheets-completion-p1.md` — bảng: có / thiếu / không cần. Phase này CHỈ kiểm kê + ghi nhận gap (việc bổ sung hàm nếu thiếu sẽ đánh giá riêng, vẫn theo Chuẩn bản mở).

### 3. Harness corpus tổng hợp Lớp A (.xlsx) (~7h)

1. Script `packages/xlsx-io/scripts/gen-corpus.ts` sinh bộ mẫu tổng hợp phủ đủ phần tử **Lớp A (.xlsx)**: giá trị ô (number/string/boolean/date/error/richText), formula cơ bản + cross-sheet, style (font/fill/border/alignment/numFmt), merge nhiều dạng, row/col size + hidden, multi-sheet + sheet order, freeze panes.
2. Mở rộng `roundtrip.test.ts`: mỗi file corpus chạy import → export → import lại, so từng phần tử theo lớp, xuất **tỷ lệ fidelity %** theo nhóm phần tử (cell/formula/style/merge/size/sheet/freeze).
3. Định nghĩa helper so sánh dùng chung `packages/xlsx-io/src/__tests__/fidelity.utils.ts` — tái dùng cho corpus thật ở Phase 5.
4. Baseline lần đầu ghi vào report; ngưỡng tuyên bố đạt là ≥95% trên Bộ mẫu thật (Phase 5), corpus tổng hợp chỉ làm hạ tầng đo.

### 4. Perf smoke chống thoái hoá (~4h)

1. Script `packages/xlsx-io/scripts/perf-check.ts`: đo parse+convert small/med/large, in bảng ms; fail nếu vượt **2× baseline** đã ghi (small ~44ms / med ~169ms / large ~1363ms, dải máy tham chiếu ghi kèm kết quả).
2. Gắn vào `pnpm --filter @office/xlsx-io perf` và chuỗi verify trước khi commit các phase sau.
3. Browser render smoke giữ script Puppeteer hiện có của `apps/sheets`, chạy thủ công cuối phase (30K cells ≤3.5s).

## Success criteria

- Export file có formula mở lại bằng Excel **không còn `#VALUE!`** (cached value đầy đủ).
- Bảng độ phủ hàm công bố trong report P1 (không có hàm nào bị "tưởng có mà không có").
- Harness corpus tổng hợp chạy green, in được fidelity % theo nhóm phần tử Lớp A.
- Perf smoke pass ở ngưỡng 2× baseline; typecheck/build/test pass toàn monorepo liên quan.
- Không vi phạm Chuẩn bản mở: không thêm dependency GPL/thương mại.

## Notes

- Không đụng collab (giữ offline-first), không đổi Univer version, không đụng protection/pivot/sparkline.
- Nếu Facade API không đủ để ép recalculation, phương án dự phòng: gọi command recalc nội bộ của `sheets-formula` (vẫn Apache-2.0) — ghi lại lựa chọn cuối vào report.
