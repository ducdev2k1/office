---
phase: 3
title: 'Integrate Tiptap Collaboration vao apps/docs'
status: completed
priority: P1
effort: '6h'
dependencies: [2]
---

# Phase 3: Integrate TipTap Collaboration vào `apps/docs`

## Overview

Tích hợp `@tiptap/extension-collaboration` và `@tiptap/extension-collaboration-cursor` vào trình soạn thảo TipTap của `apps/docs`, thay thế cơ chế cập nhật state đơn lẻ bằng dữ liệu nhị phân phân tán của Y.Doc, loại bỏ hoàn toàn các vòng lặp xung đột autosave/`setContent`, tối ưu phân trang và xử lý an toàn liên kết chia sẻ phòng.

## Requirements

### Functional

- **Dependencies Version Pinning**:
  - Cài đặt đồng bộ: `@tiptap/extension-collaboration@^3.30.1`, `@tiptap/extension-collaboration-cursor@^3.0.0`, `@tiptap/y-tiptap@^3.0.9`, `yjs@^13.6.23`.
- **Tách biệt Y.Doc State & Xóa bỏ xung đột `setContent`**:
  - Khi bật collaboration, Y.Doc là **Single Source of Truth (SSOT)** cho nội dung văn bản.
  - Không truyền `content` khởi tạo và không gắn `onUpdate` HTML thô vào `useEditor` khi collab kích hoạt.
  - **Xóa bỏ hoàn toàn `useEffect` gọi `editor.commands.setContent` trong `apps/docs/src/pages/EditorPage.tsx`** để loại bỏ triệt để nguy cơ xóa trắng văn bản của người khác và làm hỏng con trỏ/Undo stack.
  - `DocRecord` chỉ quản lý metadata tài liệu (tiêu đề, trạng thái sao, ngày tạo).
- **Hỗ trợ Mở Liên Kết Chia Sẻ (URL DocId Handling)**:
  - Trong `useDocs.ts`, nếu `docId` trên URL chưa tồn tại trong IndexedDB của client, tự động tạo một placeholder `DocRecord` trong bộ nhớ thay vì ép fallback về `doc-roadmap`.
- **Tối ưu Hóa Phân Trang (`usePagination.ts`)**:
  - Chỉ kích hoạt `schedulePagination()` khi `transaction.docChanged === true` và giao dịch không chứa meta của `PAGINATION_PLUGIN_KEY`.
  - Debounce/RAF cho việc đo đạc layout để duy trì tốc độ khung hình ≥ 60fps khi nhiều người gõ đồng thời.
- **Styling Remote Cursors**:
  - Render con trỏ với nhãn tên (`.collaboration-cursor__label`) và vùng chọn bán trong suốt (`.collaboration-cursor__caret`, selection background).

### Non-functional

- Dùng alias `@/*` trong toàn bộ `apps/docs`.
- Chuẩn hóa chính xác đường dẫn file: `apps/docs/src/pages/EditorPage.tsx`.

## Architecture

```text
apps/docs/src/
├── assets/styles/styles.css        # Remote cursors & selection styling
├── hooks/
│   └── useDocs.ts                  # Safe URL docId handling without destructive fallback
└── modules/
    └── editor/
        ├── hooks/
        │   ├── useDocsEditor.ts    # Collab-aware configuration (no raw HTML setContent)
        │   ├── usePagination.ts    # Optimized transaction filter
        │   └── useCollabEditor.ts  # Bridges useCollabRoom + useDocsEditor
        └── pages/
            └── EditorPage.tsx      # Clean integration with collaboration state
```

## Related Code Files

- Modified: `apps/docs/package.json`
- Modified: `apps/docs/src/hooks/useDocs.ts`
- Modified: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts`
- Modified: `apps/docs/src/modules/editor/hooks/usePagination.ts`
- Created: `apps/docs/src/modules/editor/hooks/useCollabEditor.ts`
- Modified: `apps/docs/src/modules/editor/index.ts`
- Modified: `apps/docs/src/pages/EditorPage.tsx`
- Modified: `apps/docs/src/assets/styles/styles.css`

## Implementation Steps

1. **Cài đặt Dependencies trong `apps/docs`**:
   - Thêm vào `apps/docs/package.json`:
     `"@tiptap/extension-collaboration": "^3.30.1"`,
     `"@tiptap/extension-collaboration-cursor": "^3.0.0"`,
     `"@tiptap/y-tiptap": "^3.0.9"`,
     `"yjs": "^13.6.23"`,
     `"@office/collab-core": "workspace:*"`
2. **Cập nhật `useDocs.ts`**:
   - Cho phép nạp `docId` từ URL ngay cả khi chưa có trong danh sách tài liệu cục bộ bằng cách tạo bản ghi tạm `createTemporaryDoc(urlId)`.
3. **Cập nhật `useDocsEditor.ts`**:
   - Nhận `collabConfig?: DocsCollabConfig`.
   - Khi có `collabConfig`:
     - Tắt history: `StarterKit.configure({ undoRedo: false })`.
     - Thêm `Collaboration.configure({ document: collabConfig.ydoc })`.
     - Thêm `CollaborationCursor.configure({ provider: collabConfig.provider, user: collabConfig.user })`.
     - Bỏ qua tham số `content` và không gọi callback `onUpdate` HTML thô.
4. **Tối ưu `usePagination.ts`**:
   - Thêm guard: `if (!transaction.docChanged) return;` trước khi tính toán lại layout.
5. **Cập nhật `EditorPage.tsx`**:
   - Loại bỏ `useEffect` gọi `editor.commands.setContent`.
   - Sử dụng `useCollabEditor` để kết nối TipTap và Y.Doc một cách mượt mà.
6. **Thêm CSS Remote Cursor vào `styles.css`**:
   - Cấu hình style chuẩn cho `.collaboration-cursor__caret` và `.collaboration-cursor__label`.

## Success Criteria

- [x] Mở cùng 1 tài liệu trên 2 trình duyệt: gõ phím bên này lập tức xuất hiện bên kia mà không xảy ra vòng lặp chèn lại text.
- [x] Mở link tài liệu mới chia sẻ từ máy khác không bị văng về `doc-roadmap`.
- [x] Gõ liên tục trên nhiều máy không gây nghẽn CPU ở hook phân trang.
- [x] `pnpm --filter @office/docs typecheck` vượt qua không lỗi.

## Risk Assessment

- **Mất tiêu đề tài liệu khi mở qua link chia sẻ**:
  - _Giải pháp_: Placeholder `DocRecord` lấy tiêu đề mặc định hoặc đồng bộ metadata qua Awareness channel.
