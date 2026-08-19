---
phase: 5
title: "Verification, Round-Trip Tests, E2E Smoke Tests & Polish"
status: completed
priority: P1
effort: "4h"
dependencies: ["1", "2", "3", "4"]
---

# Phase 5: Verification, Round-Trip Tests, E2E Smoke Tests & Polish

## Overview
Tiến hành kiểm thử toàn diện từ unit tests, kiểm thử round-trip (web -> xlsx -> web), kiểm thử giao diện tự động (Puppeteer E2E smoke tests), tối ưu hiệu năng render khi trang tính có nhiều biểu đồ hoặc nhiều dòng dữ liệu, kiểm tra i18n đầy đủ cho 2 ngôn ngữ VI và EN, và hoàn thiện tài liệu hướng dẫn.

## Requirements
- **Kiểm thử tự động (Unit & Integration Tests)**:
  - Unit tests cho các hàm chuyển đổi toạ độ, phân tích dải ô tính (`dataRangeParser`), sinh cấu hình ECharts option.
  - Round-trip test cho `@office/xlsx-io`: Import file chứa biểu đồ -> Export ra buffer -> Import lại -> Đối chiếu `fidelity` kiểu biểu đồ, tiêu đề, dải ô và toạ độ đạt 100%.
- **E2E Smoke Tests với Headless Chrome (Puppeteer)**:
  - Mở trang tính, nhập dữ liệu, chèn biểu đồ Cột.
  - Mở Sidebar đổi sang biểu đồ Tròn và đổi tiêu đề.
  - Kéo di chuyển biểu đồ đến vị trí khác.
  - Bấm Xuất XLSX, kiểm tra file download > 0 bytes và không phát sinh lỗi JavaScript console.
- **Tối ưu Hiệu năng (Performance)**:
  - Lazy-load thư viện ECharts để không làm tăng thời gian initial load của ứng dụng.
  - Giảm thiểu số lần re-render không cần thiết khi người dùng cuộn nhanh trên bảng tính (Debounce / RequestAnimationFrame cho toạ độ).
- **Đa ngôn ngữ & UI Polish**:
  - Đảm bảo toàn bộ nhãn, tooltip, tiêu đề trên Sidebar và Toolbar đều được dịch đầy đủ trong `packages/i18n/src/locales/vi/sheets.json` và `en/sheets.json`.
  - Đạt chuẩn accessibility (phím Esc đóng sidebar, phím tắt Delete xoá chart khi đang focus).

## Related Code Files
- Create:
  - `apps/sheets/src/modules/charts/__tests__/dataRangeParser.test.ts`
  - `apps/sheets/src/modules/charts/__tests__/coordinates.test.ts`
  - `packages/xlsx-io/src/__tests__/chartml-roundtrip.test.ts`
  - `apps/sheets/scripts/smoke-test-charts.cjs`
- Modify:
  - `packages/i18n/src/locales/vi/sheets.json`
  - `packages/i18n/src/locales/en/sheets.json`
  - `docs/report-sheets-charts.md` (báo cáo hoàn thành tính năng)

## Implementation Steps
1. Bổ sung các bản dịch đa ngôn ngữ cho toàn bộ UI Biểu đồ vào `packages/i18n`.
2. Chạy bộ unit tests cho `apps/sheets` và `packages/xlsx-io`.
3. Viết kịch bản kiểm thử tự động `smoke-test-charts.cjs` sử dụng Puppeteer để chạy thử trên trình duyệt headless.
4. Chạy `pnpm --filter @office/sheets typecheck && pnpm --filter @office/sheets build`.
5. Chạy `pnpm --filter @office/xlsx-io typecheck && pnpm --filter @office/xlsx-io test`.
6. Soạn thảo báo cáo kỹ thuật `docs/report-sheets-charts.md` tổng kết kết quả đạt được.

## Success Criteria
- [ ] 100% Typecheck và Build thành công trên toàn bộ workspace monorepo.
- [ ] Toàn bộ unit tests và round-trip test cho ChartML pass 100%.
- [ ] Puppeteer smoke test chạy trơn tru với 0 lỗi console/HTTP.
- [ ] Giao diện hỗ trợ mượt mà cả Dark Mode & Light Mode, đầy đủ tiếng Việt và tiếng Anh.
