---
title: 'Slides Survey - Khảo sát kỹ thuật Slides & pptx-io trước khi vào Giai đoạn 7'
description: 'Prototype chạy thực tế apps/slides + tích hợp pptx-io/pptx-viewer + đo độ chính xác tiếng Việt/layout + checklist gap tính năng + báo cáo Go/No-Go'
status: completed
priority: P1
effort: 36h
branch: main
tags: [research, prototype, slides, pptx-io, pptx-viewer]
created: 2026-08-19
---

# Plan: Khảo sát Slides cho Giai đoạn 7 (Trình chiếu)

## Overview

Khảo sát giải pháp kỹ thuật cho `apps/slides` và `packages/pptx-io` trước khi đầu tư sâu vào sản phẩm chính thức. Không code tính năng sản phẩm phân tán — tập trung dựng prototype chạy thực tế + kiểm thử render trên bộ 3 file mẫu `.pptx` đại diện (tiếng Việt, bảng biểu, hình khối, layout) + đo hiệu năng (bundle, load time, memory) + lập gap checklist tính năng + báo cáo kỹ thuật Go/No-Go.

**Ràng buộc bắt buộc**:
- Chỉ dùng mã nguồn mở giấy phép dễ dãi (Apache-2.0 / MIT / BSD), không dùng bất kỳ package trả phí / AGPL nào.
- Offline-first: lưu trữ qua `@office/storage-adapter` (IndexedDB driver).
- Tích hợp giao diện iNET: đồng bộ `@office/app-shell`, `@office/file-home` (`kind: 'slides'`), và `@office/ui-kit`.

## Phases

| # | Phase | File | Effort | Status |
|---|---|---|---|---|
| 1 | Scaffold `apps/slides` + AppShell + FileHome + prototype runner | `phase-01-scaffold-slides-prototype.md` | 8h | completed |

| 2 | Khảo sát chiều đọc & render file PPTX qua `packages/pptx-io` | `phase-02-pptx-read-render-pipeline.md` | 10h | completed |

| 3 | Đo hiệu năng (bundle, load, FPS) + checklist gap tính năng & UI | `phase-03-perf-measure-gap-checklist.md` | 10h | completed |

| 4 | Lập báo cáo kỹ thuật `docs/report-slides-survey.md` + quyết định Go/No-Go | `phase-04-report-go-no-go.md` | 8h | completed |

**Tổng effort: 36h (~4–5 ngày làm việc)**

## Dependencies

- Phase 1 trước tất cả (cần có app scaffold và shell chạy được để mount canvas/viewer).
- Phase 2 bắt đầu ngay sau Phase 1 (cần core render pipeline để mở file mẫu).
- Phase 3 bắt đầu khi Phase 2 xong (cần dữ liệu và prototype hoàn chỉnh để đo đạc và kiểm tra gap).
- Phase 4 tổng hợp toàn bộ kết quả từ Phase 1–3 để ra quyết định Go/No-Go và đề xuất phạm vi MVP.

## Ghi chú kỹ thuật xuyên suốt

- **`apps/slides`**: Khởi tạo theo chuẩn monorepo (Vite 6 + React 19 + Tailwind CSS v4), path alias `@/*`, tuân thủ AGENTS.md (arrow function, const, file suffix convention).
- **`packages/pptx-io`**: Đóng vai trò adapter/bridge bọc thư viện render/parser `pptx-viewer` (Apache-2.0) hoặc module chuyển đổi dữ liệu.
- **Corpus 3 file mẫu**:
  1. `sample-basic.pptx`: Slide cơ bản (tiêu đề, văn bản unicode tiếng Việt, danh sách, màu sắc).
  2. `sample-medium.pptx`: Slide độ phức tạp trung bình (bảng biểu, hình ảnh, shape hình khối, text box định vị).
  3. `sample-advanced.pptx`: Slide nâng cao (10–20 slide, layout doanh nghiệp).
- **ProductSwitcher**: Bật cờ `{ kind: 'slides', available: true, icon: 'presentation' }` trong `@office/app-shell` khi hoàn tất scaffold.
- **Đánh giá rủi ro**: Nếu `pptx-viewer` gặp lỗi nghiêm trọng về bundle, font tiếng Việt hoặc layout, Phase 4 sẽ đánh giá và đề xuất phương án fallback (Custom SVG/Canvas React Engine hoặc Univer Slides) kèm phân tích đánh đổi chi phí.
