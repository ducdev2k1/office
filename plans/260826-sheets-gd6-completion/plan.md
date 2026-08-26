---
title: 'Sheets Gđ6 - Bán sản phẩm đã xây: hoàn thiện hai trục P0 + nền tảng'
description: 'Kết quả grilling 26/08/2026: định nghĩa lại Gđ6 = hoàn thiện + hardening những gì đã xây (không quay lại MVP scope survey). Hai trục cùng P0: trục file (zip-merge ADR 0001 + corpus thật) và trục UX (statusbar agg + VI locale). Nền tảng: wire CI, refactor, bundle ≤1.2MB gzip.'
status: in-progress
priority: P0
effort: ~80h
branch: main
tags: [feature, sheets, xlsx, fidelity, performance]
blockedBy: [260820-docs-gap-closing]
blocks: []
created: 2026-08-26
---

# Plan: Sheets Giai đoạn 6 — Bán sản phẩm đã xây

## Overview

Kết quả phiên grilling ngày 26/08/2026 với owner. Khảo sát Univer khuyên hoãn charts/print/collab,
nhưng thực tế code đã xây xong hầu hết (có báo cáo hoàn thành) → chốt **không quay lại MVP scope**.

## Quyết định chốt (grilling 26/08)

| # | Hạng mục | Quyết định |
|---|----------|-----------|
| 1 | Khung Gđ6 | Bán sản phẩm đã xây; C4 của survey coi như bị vượt qua một cách có lợi |
| 2 | P0 | **Cả hai trục cùng P0**: trục file + trục UX |
| 3 | Bộ mẫu thật xlsx 30–50 file | Owner thu thập + ẩn danh hoá; trước đó KHÔNG tuyên bố đạt chuẩn CONTEXT.md, chỉ nói "corpus tổng hợp PASS" |
| 4 | Chart export mất khi mở Excel | Khắc phục bằng hybrid zip-merge ADR 0001 — làm NGAY trong Gđ6 |
| 5 | Bundle | Tối ưu bắt buộc, target **≤1.2 MB gzip** (lazy-load Univer, manualChunks, chỉ locale EN/VI) |
| 6 | CI gate | Wire test+fidelity+perf vào turbo; FAIL nếu nhóm fidelity <95% hoặc perf >2× baseline |
| 7 | Univer UI tiếng Việt | P0 — cắm locale vi-VN cho canvas/menu |
| 8 | EditorPage.tsx 481 dòng | Refactor ≤400 dòng ngay (vi phạm AGENTS.md mục 8); UX parity: statusbar agg là P0, còn lại P1 |
| 9 | Collab | Giữ demo-grade tới khi ghép Gđ4/5 (auth+Drive); view-only chờ auth |

## Phases

### Phase A — Việc nhỏ mở đường (tuần 1–2) ✅ Done 26/08/2026
- [x] F5: wire xlsx-io test + fidelity vào turbo (đã chạy sẵn qua task `test`); thêm turbo task `perf` (cache:false) + `pnpm perf` — PASS (import 1707/2726ms, export 2364/4800ms)
- [x] Statusbar aggregate (selected/count/sum/avg) — `useSelectionAggregate.ts` + `SheetsStatusbar.tsx`, i18n vi/en parity
- [x] Univer locale vi-VN — `useUniver.ts` nhận option `locale`, merge cả en-US/vi-VN, EditorPage map từ getStoredLocale, remount qua key
- [x] Refactor EditorPage.tsx 481 → **319 dòng** — tách `useSheetChartsState` / `useFloatingImagesState` / `useCellComments`

Verification: sheets typecheck ✓ · build ✓ · test chuỗi tsx ✓ · i18n parity ✓ · turbo 9/9 ✓

### Phase B — Zip-merge ADR 0001 ✅ Done 26/08/2026
- [x] Thuật toán merge: `packages/xlsx-io/src/hybrid-merge.utils.ts` — `mergeOpaqueParts` copy byte part Lớp B (charts/drawings/media/pivotCache/pivotTables/embeddings) từ zip gốc vào file rebuild qua ExcelJS
- [x] Xử lý rId/content-types: cấp rId MỚI cho rels chép sang (không đụng rId cũ của sheet), wire `<drawing r:id>` vào sheet XML, ensure Override + Default trong [Content_Types].xml
- [x] Byte-assert harness: `__tests__/hybrid-merge.test.ts` 5 test (copy nguyên byte / wiring / CT / mở lại bằng ExcelJS / rebuild thuần không mang part) — đã nối vào chuỗi `pnpm --filter @office/xlsx-io test`
- [x] App wiring: `exportXlsxFile(docId, ...)` → `getXlsxSourceBuffer` (sidecar `sheets-sources`) → `exportWorkbookHybrid`; guard an toàn khi thiếu source (fallback rebuild thuần)

Verification: xlsx-io test chuỗi pass (fidelity PASS ≥95%) · sheets typecheck/build ✓ · turbo 9/9 ✓

### Phase C — Đóng băng + tối ưu
- [x] Bundle tối ưu (26/08/2026): route-split `EditorPage` lazy + dynamic import echarts/exceljs/jspdf-html2canvas. Kết quả đo (`apps/sheets/scripts/bundle-report.mjs`): **entry ban đầu 326KB gzip** (~510KB cùng icons+css — đạt mục tiêu ≤1.2MB); locale Univer/dayjs tách chunk theo ngôn ngữ, chỉ tải ngôn ngữ hiện hành. Lưu ý trung thực: route chunk `/edit` nặng 1517KB gzip do lõi Univer OSS — muốn xuống ≤1.2MB cần trim preset (bỏ filter/validation/conditional-formatting) → follow-up cần quyết định product vì ảnh hưởng tính năng
- [ ] Chạy bộ mẫu thật xlsx 30–50 file → gate ≥95% mỗi nhóm (**chờ owner thu thập**)
- [ ] Cập nhật báo cáo nghiệm thu cuối (sau bộ mẫu thật)

## Trung thực với khách

Trước khi có bộ mẫu thật: chỉ được tuyên bố "corpus tổng hợp 6 file PASS (thấp nhất 97.1%)".
Chart trong file export hiện KHÔNG hiện khi mở bằng Excel — sẽ hết sau Phase B.

## Verification

- Turbo test 9/9 tasks pass
- xlsx-io: fidelity ≥95% mọi nhóm + perf best-of-5 <2× baseline (24/08: large import 1781ms / export 2422ms)
- apps/sheets typecheck + build + test chuỗi tsx pass

## Next

- Grilling riêng Gđ7 Slides dựa trên packages/pptx-io scaffold
- Lưu ý pin `@univerjs/icons@1.2.0` (root pnpm.overrides) — không nâng/xóa
