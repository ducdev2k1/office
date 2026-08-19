---
title: 'Sheets Charts - ECharts Floating Overlay & OOXML ChartML Integration'
description: 'Tích hợp toàn diện tính năng Biểu đồ (Charts) cho ứng dụng Sheets: ECharts renderer (8 loại biểu đồ), Floating Overlay tương tác kéo thả/resize đồng bộ Univer Canvas, Chart Inspector Sidebar cấu hình thời gian thực, lưu trữ IndexedDB và đọc/ghi DrawingML/ChartML chuẩn Microsoft Excel.'
status: completed
priority: P1
effort: 32h
branch: main
tags: [feature, sheets, charts, echarts, ooxml, drawingml, univer]
created: 2026-08-19
---

# Plan: Sheets Charts — ECharts Floating Overlay & OOXML ChartML Integration

## Overview

Hoàn thành triển khai toàn diện tính năng Biểu đồ (Charts) cho ứng dụng `apps/sheets`: Sử dụng **Apache ECharts** chạy trên lớp **Floating Overlay Layer** (DOM nổi đồng bộ toạ độ với Univer canvas), kèm **Chart Inspector Sidebar** trực quan và module lưu trữ / round-trip trong `@office/xlsx-io`.

Tuân thủ nghiêm ngặt quy chuẩn `AGENTS.md`:
- Arrow functions `() => {}`, khai báo `const`, tính bất biến.
- Path alias `@/*` trong `apps/sheets`, relative import trong `packages/*`.
- Giới hạn file ≤ 400 dòng (modularize SRP).
- Suffix naming convention: `.types.ts`, `.utils.ts`, `.service.ts`, `.constants.ts`, `.hook.ts`.
- Giao diện Shadcn UI + Base UI từ `@office/ui-kit` (Tooltip, Sidebar, Button, Dialog, Tabs...).
- Đa ngôn ngữ qua `@office/i18n`.

## Phases

| #  | Phase                                                                               | File                                             | Effort | Status     |
|----|-------------------------------------------------------------------------------------|--------------------------------------------------|--------|------------|
| 1  | Core Chart Engine: Schema, Types & ECharts Multi-Type Renderer                      | `phase-01-echarts-core-renderer.md`              | 6h     | completed  |
| 2  | Floating Overlay: Tương tác Kéo/Thả, 8-Point Resize & Đồng bộ Toạ độ Canvas         | `phase-02-floating-overlay-canvas-sync.md`       | 7h     | completed  |
| 3  | Chart Inspector Sidebar: Giao diện Cấu hình, Live Preview & Data Range Binding      | `phase-03-chart-inspector-data-binding.md`       | 7h     | completed  |
| 4  | Persistence & OOXML Integration: Lưu IndexedDB & Đọc/Ghi ChartML (.xlsx)            | `phase-04-persistence-ooxml-chartml.md`          | 8h     | completed  |
| 5  | Verification, Round-Trip Tests, E2E Smoke Tests & Polish                            | `phase-05-verification-roundtrip-polish.md`      | 4h     | completed  |

**Tổng effort hoàn thành: 32h**
