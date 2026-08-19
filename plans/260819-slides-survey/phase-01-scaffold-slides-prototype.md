# Phase 1: Scaffold `apps/slides` + AppShell + FileHome + Prototype Runner

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 8h

- **Mục tiêu**: Khởi tạo cấu trúc `apps/slides` chuẩn monorepo, tích hợp hoàn chỉnh với `@office/app-shell`, `@office/file-home` (`kind: 'slides'`), `@office/storage-adapter` (IndexedDB), `@office/ui-kit`, và kích hoạt cờ `slides` trong `ProductSwitcher`.

## Requirements

1. Scaffold `apps/slides`: Vite 6 + React 19 + TypeScript + Tailwind CSS v4.
2. Cấu hình Path Alias `@/*` trỏ tới `apps/slides/src/*`, tuân thủ AGENTS.md (arrow function, const, file suffix convention).
3. Tích hợp `packages/app-shell`:
   - `ShellLayout`, `TopBar`, `ProductSwitcher`.
   - Cập nhật `available: true` cho `slides` trong `packages/app-shell/src/ProductSwitcher.tsx`.
4. Trang `HomePage` (`/`): Nhúng `<FileHome config={{ kind: 'slides' }} />` dùng chung, hỗ trợ quản lý danh sách slide, tạo mới, xoá, nhân bản trong IndexedDB.
5. Trang `EditorPage` (`/edit/:id`): Khung trình soạn thảo Slides prototype, nạp metadata từ `storage-adapter`, hiển thị TopBar và placeholder vùng Canvas.
6. Cấu hình scripts trong `package.json` và root `package.json` (`dev:slides`, `pnpm --filter @office/slides typecheck && pnpm --filter @office/slides build`).

## Architecture

```text
apps/slides/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx                    # React DOM entry
    ├── App.tsx                     # React Router: / -> HomePage, /edit/:id -> EditorPage
    ├── pages/
    │   ├── HomePage.tsx            # FileHome (kind: 'slides')
    │   └── EditorPage.tsx          # ShellLayout + TopBar + SlideCanvas mount point
    ├── components/
    │   ├── SlideViewer.tsx         # Component render khung slide prototype
    │   └── SlideSidebar.tsx        # Danh sách thumbnail slide (trái)
    ├── hooks/
    │   └── useSlideDocument.ts     # Hook load/save document qua storage-adapter
    ├── types/
    │   └── slides.types.ts         # Types cho document & slide state
    ├── assets/
    │   └── styles/
    │       └── styles.css          # Tokens import + Tailwind CSS v4 theme
    └── vite-env.d.ts
```

## Implementation Steps

1. **Khởi tạo `apps/slides/package.json`**:
   - Khai báo name `@office/slides`, dependencies: `@office/app-shell`, `@office/file-home`, `@office/fonts`, `@office/i18n`, `@office/storage-adapter`, `@office/ui-kit`, `@office/pptx-io`, `react`, `react-dom`, `react-router-dom`, `clsx`, `class-variance-authority`.
2. **Cấu hình TypeScript & Vite**:
   - `tsconfig.json` extends `../../packages/tsconfig.base.json` với path alias `@/*`.
   - `vite.config.ts` với React plugin, Tailwind CSS v4 plugin, resolve alias `@`.
3. **Tạo trang `HomePage` & `EditorPage`**:
   - `HomePage.tsx`: Render `<FileHome config={{ kind: 'slides', appTitle: 'OneMail Slides', ... }} />`.
   - `EditorPage.tsx`: Nhúng TopBar, kết nối `createDocumentStore('slides')`, hiển thị tiêu đề và trạng thái lưu.
4. **Cập nhật `packages/app-shell`**:
   - Đổi `available: false` -> `available: true` cho `kind: 'slides'` trong `ProductSwitcher.tsx`.
5. **Thêm script vào root `package.json`**:
   - Thêm `"dev:slides": "pnpm --filter @office/slides dev"`.
6. **Kiểm thử xác minh (Verification)**:
   - `pnpm --filter @office/slides typecheck` pass.
   - `pnpm --filter @office/slides build` pass.
   - Mở giao diện `dev:slides`, kiểm tra chuyển trang giữa `/` (FileHome) và `/edit/:id` hoạt động mượt mà.

## Success Criteria

- `apps/slides` khởi tạo sạch sẽ, không có lỗi typecheck hay build.
- FileHome hiển thị đúng danh mục Slides, tạo mới bản ghi thành công vào IndexedDB và điều hướng sang `/edit/:id`.
- ProductSwitcher chuyển đổi qua lại giữa Docs, Sheets và Slides mượt mà.
