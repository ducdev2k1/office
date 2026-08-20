# Phase 4: Lập báo cáo kỹ thuật `docs/report-slides-survey.md` + Quyết định Go/No-Go

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 8h

- **Mục tiêu**: Tổng hợp toàn bộ số liệu và kết quả thực nghiệm từ Phase 1–3 thành tài liệu báo cáo kỹ thuật hoàn chỉnh (`docs/report-slides-survey.md`), đưa ra quyết định Go/No-Go cho giải pháp engine của Slides, và đề xuất kế hoạch triển khai MVP Slides hoàn chỉnh.

## Requirements

1. Soạn thảo tài liệu báo cáo kỹ thuật `docs/report-slides-survey.md` (tiếng Việt), bao gồm:
   - **Tóm tắt điều hành**: Mục tiêu, phạm vi khảo sát, kết quả cốt lõi.
   - **Kiến trúc Prototype**: Cách tích hợp `apps/slides` với `packages/pptx-io` và AppShell/FileHome.
   - **Dữ liệu Hiệu năng thực tế**: Bundle size, thời gian nạp file (3 file mẫu), FPS, mức tiêu thụ bộ nhớ.
   - **Đánh giá Độ chính xác (Fidelity)**: Kết quả hiển thị tiếng Việt, bảng, ảnh, hình khối so với PowerPoint gốc.
   - **Bảng Gap Checklist chi tiết**: Danh mục tính năng có sẵn, cần làm thêm, và hoãn lại.
   - **Đánh giá Rủi ro & Giải pháp giảm thiểu**: Supply chain, bus factor, độ ổn định API, phương án dự phòng (fallback).
   - **Quyết định Go/No-Go**: Kết luận rõ ràng kèm các điều kiện kỹ thuật.
   - **Đề xuất phạm vi và lộ trình MVP Slides**: Danh sách tính năng của MVP, thời gian ước tính, thứ tự ưu tiên.
2. Cập nhật trạng thái của toàn bộ các Phase trong `plans/260819-slides-survey/plan.md`.
3. Đề xuất implementation plan tiếp theo cho Phase MVP Slides nếu quyết định là GO.

## Cấu trúc Báo cáo `docs/report-slides-survey.md`

```markdown
# Báo cáo Khảo sát Kỹ thuật Slides — Giai đoạn 7

## 1. Tóm tắt điều hành

## 2. Kết quả Khảo sát Thực nghiệm

### 2.1 Cấu trúc Prototype & Tích hợp Monorepo

### 2.2 Đánh giá Pipeline Đọc & Render PPTX

### 2.3 Đo lường Hiệu năng (Bundle Size, Load Latency, Memory)

### 2.4 Đánh giá Độ chính xác Hiển thị (Fidelity & Font tiếng Việt)

### 2.5 Khả năng Tùy biến Giao diện theo Token iNET & Shadcn UI

### 2.6 Khả năng Xuất ngược (Export Round-trip)

## 3. Bảng Gap Checklist Tính năng

## 4. Quản trị Rủi ro & Phương án Dự phòng

## 5. Quyết định Go/No-Go

## 6. Đề xuất Phạm vi và Kế hoạch MVP Slides
```

## Implementation Steps

1. **Thu thập dữ liệu**: Tổng hợp toàn bộ số liệu build, benchmark thời gian nạp và ảnh chụp kết quả render từ Phase 1–3.
2. **Soạn thảo báo cáo**: Viết tài liệu `docs/report-slides-survey.md` theo cấu trúc chuẩn.
3. **Phân tích kết luận Go/No-Go**:
   - **GO**: Khi thư viện/engine đáp ứng tốt về mặt hiển thị tiếng Việt, render bảng/ảnh/hình khối ổn định, bundle size chấp nhận được, và có thể bọc trong `packages/pptx-io`.
   - **NO-GO / CONDITIONAL GO**: Nếu phát hiện rủi ro nghiêm trọng về license, bundle phình to không tối ưu được, hoặc lỗi hiển thị layout tiếng Việt không thể khắc phục -> chuyển hướng sang engine fallback (Custom DOM/SVG Canvas Engine hoặc Univer Slides).
4. **Xây dựng đề xuất phạm vi MVP**: Phác thảo các phase cần thiết cho MVP Slides (như Import/Export, Slide Canvas Editor, Toolbar iNET, Presentation Mode, Storage Sync).
5. **Cập nhật Plan**: Cập nhật trạng thái `completed` cho toàn bộ các phase của survey khi báo cáo hoàn tất.

## Success Criteria

- Tài liệu `docs/report-slides-survey.md` hoàn chỉnh, rõ ràng, có số liệu thực tế chứng minh.
- Quyết định Go/No-Go rõ ràng, giúp đội ngũ kỹ thuật tự tin bước vào giai đoạn xây dựng MVP Slides.
- Kế hoạch MVP Slides được phân rã rõ ràng về khối lượng công việc và ranh giới tính năng.
