---
title: 'Home Dashboard cho Docs — shell + file-home tái dùng cho Sheets/Slides'
description: '5 phase: foundation token+Tailwind, app-shell + router, file-home core (tabs/list/search/create), trash+duplicate+menu, polish+verify. Kết quả: home page kiểu Google Workspace + token iNET.'
status: completed
priority: P1
effort: 17h
branch: main
tags: [feature, frontend, ui, shell, dashboard]
created: 2026-08-17
---

# Plan: Home Dashboard cho Docs (tái dùng Sheets/Slides)

## Overview

Xây trang home quản lý file cho Docs kiểu Google Workspace, đóng gói thành `@office/app-shell` + `@office/file-home` để Sheets/Slides tái dùng qua `ProductConfig`. Tham chiếu: `plans/ducnd/reports/brainstorm-260817-1519-docs-home-dashboard-uiux-design-report.md` (đã chốt: package chung, react-router, MVP đầy đủ + Trash soft-delete, token iNET). Stack: React 19 + Vite + TS + react-router-dom + Base UI + Tailwind v4. Tuân thủ AGENTS.md (arrow function, const, ES7+, shadcn/Base UI primitives).

## Phases

| # | Phase | File | Effort | Status |
| --- | --- | --- | --- | --- |
| 1 | Foundation: token `--o-kind-*`, Tailwind quét packages, skeleton 2 package | `phase-01-foundation-tokens-tailwind.md` | 2h | done |
| 2 | app-shell: TopBar + ShellLayout + ProductSwitcher + Router tách Home/Editor | `phase-02-app-shell-router.md` | 3h | done |
| 3 | file-home core: FileRecord/ProductConfig, mở rộng useDocs, TemplateStrip + StatsCards + Tabs + List/Grid + search/sort | `phase-03-file-home-core.md` | 5h | done |
| 4 | Trash + Duplicate + FileRowMenu + ConfirmDialog + rename inline | `phase-04-trash-duplicate-menu.md` | 4h | done |
| 5 | Polish + verify: empty/skeleton/relative time/a11y, storage estimate, route demo kind='sheets', typecheck+build | `phase-05-polish-verify.md` | 3h | done |

**Tổng effort: 17h**

## Dependencies

- Phase 1 trước Phase 2–4 (tokens + Tailwind phải build được trong package trước khi viết component).
- Phase 2 trước Phase 3 (router + HomePage là nơi mount FileHome).
- Phase 3 trước Phase 4 (tabs/list là nền cho row menu + trash).
- Phase 5 cuối cùng (verify toàn bộ, demo reuse).
- Verify mỗi phase: `pnpm --filter @office/docs typecheck`.

## Ghi chú kỹ thuật xuyên suốt

- Tailwind v4: dùng `@tailwindcss/vite`, phải thêm `@source "../../packages"` (hoặc tương đương) để gen utility cho source trong workspace packages.
- Base UI primitives: Menu, Dialog, Tabs — `@base-ui/react` đã có ở ui-kit.
- `DocRecord` mở rộng nhưng phải **migration an toàn** cho dữ liệu IndexedDB cũ (default starred=false, deletedAt=null, createdAt=lastOpenedAt=updatedAt, kind='docs').
- Router: `/` = HomePage, `/edit/:id` = EditorPage. Không phá logic editor hiện tại (giữ nguyên EditorPage, chỉ đổi lớp mount).
- Text UI mới viết có dấu tiếng Việt chuẩn.
- Không implement xuyên phase; mỗi phase có success criteria riêng.
