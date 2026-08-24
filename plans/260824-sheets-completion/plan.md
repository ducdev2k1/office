---
title: 'Sheets Completion — Đầy đủ tính năng (Sheets) 2 trục: feature checklist + file fidelity'
description: 'Kết quả phiên grilling 24/08: hoàn thiện Sheets theo 2 trục (feature parity kiểu Google Sheets + round-trip .xlsx ≥95% Lớp A, Lớp B opaque qua hybrid zip-merge). 5 phase: P1 Formula+harness/perf-CI → P2 UX parity → P3 Data tools → P4 Print+Lớp B → P5 Corpus thật.'
status: in-progress
priority: P1
effort: ~70h (ước tính tổng 5 phase)
branch: main
tags: [feature, sheets, xlsx-io, fidelity, formula, ux, data-tools, print]
created: 2026-08-24
---

# Plan: Sheets Completion — hoàn thiện như Google Sheets

## Overview

Hiện thực hóa thuật ngữ **Đầy đủ tính năng (Sheets)** đã chốt trong `CONTEXT.md` (phiên grilling 24/08/2026):

- **Trục tính năng**: checklist nhóm A–D chạy đúng (formula depth, UX parity, data tools, module dở) trên nền Univer v0.23 OSS.
- **Trục file**: round-trip `.xlsx` đạt **≥95% phần tử Lớp A (.xlsx)** trên Bộ mẫu thật xlsx; **Lớp B (.xlsx) bảo toàn opaque** theo chiến lược **hybrid zip-merge** (ADR-0001).

### Ràng buộc đã chốt (không đổi trong toàn bộ plan)

| Ràng buộc | Giá trị |
| --- | --- |
| License | **Chuẩn bản mở** — Apache-2.0/MIT only, cấm GPL & thương mại (không HyperFormula, không Univer Pro) |
| Nền tảng | Univer v0.23 + pin `@univerjs/icons@1.2.0`, local-first IndexedDB, chưa đăng nhập |
| Collab | **Offline-first + sẵn sàng** — giữ nguyên mức tích hợp hiện có (plan `260824-sheets-advanced-features` đã completed), không mở rộng |
| Hiệu năng | Giữ mốc hiện tại: parse+convert 400K cells ~1.4s, render 30K cells ≤3.5s — thêm smoke đo chống thoái hoá |
| Hoãn | Protection khóa sheet/cell, pivot table, sparkline (ngoài khả năng OSS) |

### Checklist trục tính năng (đã duyệt)

- **A. Formula depth**: fix cached value lúc export (hết `#VALUE!`), cross-sheet refs, kiểm kê độ phủ hàm (toán/logic/text/date/lookup).
- **B. UX parity**: freeze panes, status bar sum/count/avg vùng chọn, context menu mở rộng, paste special (chỉ giá trị/chỉ định dạng), fill handle, bộ shortcut chuẩn.
- **C. Data tools**: filter nhiều điều kiện, sort nhiều cột, validation UI đầy đủ (list/number/date + error message), conditional formatting UI (color scale/data bar/rule), named ranges.
- **D. Module dở**: print/PDF đúng khổ giấy, chart/image round-trip qua xlsx-io (theo ADR-0001).

## Phases

| # | Phase | File | Effort | Status |
|---|---|---|---|---|
| 1 | Formula depth + harness corpus tổng hợp + perf smoke CI | `phase-01-formula-harness-perf.md` | 17h | completed |
| 2 | UX parity (freeze/status bar/context menu/paste special/fill handle/shortcuts) | viết khi bắt đầu phase | ~14h | pending |
| 3 | Data tools sâu (filter/sort nâng cao, validation UI, conditional formatting UI, named ranges) | viết khi bắt đầu phase | ~16h | pending |
| 4 | Print chuẩn khổ giấy + hybrid zip-merge Lớp B (ADR-0001, sidecar zip gốc) | viết khi bắt đầu phase | ~14h | pending |
| 5 | Bộ mẫu thật xlsx (kết hợp: thật bổ sung dần do Anh cung cấp) + chốt ngưỡng ≥95% | viết khi bắt đầu phase | ~9h | pending |

> File chi tiết từng phase được soạn ngay trước khi phase đó bắt đầu (tránh kế hoạch hóa quá sớm phần phụ thuộc phase trước).

## Quy trình mỗi phase

1. Soạn `phase-0N-*.md` → implement → typecheck/build/test pass.
2. Smoke Puppeteer (nếu đụng UI) + report như các plan trước.
3. Cập nhật report vào `docs/report-sheets-*.md`.

## Tham chiếu

- Thuật ngữ: `CONTEXT.md` — "Đầy đủ tính năng (Sheets)", "Lớp A/B (.xlsx)", "Bộ mẫu thật xlsx", "Chuẩn bản mở", "Hybrid zip-merge".
- Quyết định kiến trúc: `docs/adr/0001-hybrid-zip-merge-xlsx-io.md`.
- Tiền đề hiện có: `docs/report-sheets-mvp.md` (round-trip 100% file mẫu), `docs/report-sheets-charts.md`, plan `260824-sheets-advanced-features` (collab/print/images/comments — completed).
