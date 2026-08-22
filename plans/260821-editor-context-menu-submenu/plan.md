# Editor Context Menu: Submenu Refactor + Migrate to ui-kit

## Overview

- **Priority**: P0 (foundation cho phase-02) | **Status**: pending | **Effort**: ~4h
- Refactor `EditorContextMenu.tsx`: gộp các nhóm vào submenu, đồng thời migrate từ custom DOM sang `@office/ui-kit` ContextMenu primitives.

## Context

- `EditorContextMenu.tsx` hiện tại là flat list ~17 items, quá dài.
- Component tự build DOM (positioning, outside click, escape handler) — bỏ qua `@office/ui-kit` ContextMenu primitives.
- `@office/ui-kit` đã có sẵn: `ContextMenuSub`, `ContextMenuSubTrigger`, `ContextMenuSubContent`, `ContextMenuItem`, `ContextMenuShortcut`, `ContextMenuSeparator` — hỗ trợ submenu native qua Base UI.
- `DocRow` sidebar đã dùng ui-kit ContextMenu primitives — sau refactor sẽ nhất quán.
- Submenu refactor là prerequisite cho phase-02 (table properties, image align) — sau refactor chỉ cần thêm items vào submenu có sẵn.

## Key Insights

- Root level chỉ cần **Clipboard actions** (Cut/Copy/Paste/Comment) — dùng nhiều nhất.
- Format, Insert, Table, Image → gộp vào submenu.
- Table/Image submenu là **contextual** — chỉ hiện khi cursor trong table/image.
- i18n keys có sẵn: `menu.format.label`, `menu.insert.label`, `menu.insert.table`, `menu.insert.image` — không cần thêm key mới.
- Submenu trigger labels: "Định dạng"/"Format", "Chèn"/"Insert", "Bảng"/"Table", "Hình ảnh"/"Image".

## Requirements

### Functional

- Context menu hiển thị dạng submenu thay vì flat list.
- Root level: Cut, Copy, Paste, (Comment nếu có selection + onAddComment).
- Submenu "Định dạng": Bold, Italic, Underline.
- Submenu "Chèn": Image, Table, Page Break, Find & Replace.
- Submenu "Bảng" (contextual, chỉ khi cursor trong table): Add Row, Add Column, Delete Row, Delete Column, Delete Table.
- Submenu "Hình ảnh" (contextual, chỉ khi cursor trong image): Align Left/Center/Right, Delete Image.
- Everything still works: keyboard shortcuts, danger styling, active state, read-only mode.

### Non-functional

- Migrate sang `@office/ui-kit` ContextMenu primitives (portal, auto positioning).
- Bỏ custom DOM positioning/outside-click/escape logic (~100 dòng code).
- UI nhất quán với `DocRow` sidebar.
- File ≤ 400 dòng (hiện tại 364 dòng, refactor sẽ giảm).

## Cấu trúc submenu

```
Root:
  ├── Cut              (nếu không read-only + có selection)
  ├── Copy
  ├── Paste            (nếu không read-only)
  ├── Comment          (nếu có selection + onAddComment)
  ├── ─────────────
  ├── Định dạng ▸      (submenu, nếu không read-only)
  │   ├── Bold
  │   ├── Italic
  │   └── Underline
  ├── Chèn ▸           (submenu, nếu không read-only)
  │   ├── Hình ảnh
  │   ├── Bảng
  │   ├── Ngắt trang
  │   └── Tìm kiếm và thay thế
  ├── Bảng ▸            (submenu, contextual — chỉ khi cursor trong table)
  │   ├── Thêm hàng phía dưới
  │   ├── Thêm cột bên phải
  │   ├── Xóa hàng
  │   ├── Xóa cột
  │   └── Xóa bảng
  └── Hình ảnh ▸        (submenu, contextual — chỉ khi cursor trong image)
      ├── Căn trái
      ├── Căn giữa
      ├── Căn phải
      └── Xóa hình ảnh
```

Root level tối đa: **~5 items** (thay vì 17).

## i18n Keys

Không cần thêm key mới. Dùng key sẵn:

| Submenu trigger | Key EN | Key VI |
|----------------|--------|--------|
| Format | `menu.insert.label` = "Insert" | `menu.insert.label` = "Chèn" |
| Insert | `menu.format.label` = "Format" | `menu.format.label` = "Định dạng" |
| Table | `menu.insert.table` = "Table" | `menu.insert.table` = "Bảng" |
| Image | `menu.insert.image` = "Image" | `menu.insert.image` = "Hình ảnh" |

## Related Code Files

- **Modify**: `apps/docs/src/modules/editor/components/EditorContextMenu.tsx` — rewrite sang ui-kit primitives + submenu structure
- **Read**: `packages/ui-kit/src/components/ui/context-menu.tsx` — ContextMenuSub/ContextMenuSubTrigger/ContextMenuSubContent API
- **Read**: `apps/docs/src/modules/sidebar/components/DocRow.tsx` — reference pattern dùng ui-kit ContextMenu
- **Read**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json` — i18n keys
- **Read**: `apps/docs/src/modules/editor/types/editor.types.ts` — ContextMenuPosition type
- **Read**: `apps/docs/src/modules/editor/hooks/useEditorModals.ts` — contextMenu state management

## Implementation Steps

1. **Đọc ui-kit ContextMenu API**: Đọc `context-menu.tsx` để hiểu props/context menu structure (ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent).
2. **Đọc DocRow.tsx**: Xem pattern dùng ui-kit ContextMenu primitives từ DocRow làm reference.
3. **Rewrite EditorContextMenu.tsx**:
   - Import `ContextMenu`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSub`, `ContextMenuSubTrigger`, `ContextMenuSubContent`, `ContextMenuSeparator`, `ContextMenuShortcut` từ `@office/ui-kit`.
   - Bỏ custom `<div>` positioning + `useLayoutEffect` + outside click/escape logic.
   - Wrap root trong `<ContextMenu>` + `<ContextMenuTrigger>` (render children as-is, trigger by right-click).
   - Render `<ContextMenuContent>` với portal positioning tự động.
   - Root level: Clipboard items (Cut/Copy/Paste/Comment).
   - Submenu "Định dạng": `<ContextMenuSub>` + `<ContextMenuSubTrigger>` + `<ContextMenuSubContent>` với Format items.
   - Submenu "Chèn": tương tự với Insert items.
   - Submenu "Bảng" (contextual): tương tự với Table items.
   - Submenu "Hình ảnh" (contextual): tương tự với Image items.
   - Dùng `ContextMenuShortcut` cho keyboard shortcut labels.
   - Dùng `danger` prop trên `ContextMenuItem` cho delete actions.
4. **Update EditorPage.tsx**: Adjust integration — giờ `EditorContextMenu` cần render `<ContextMenuTrigger>` bọc content thay vì positioned `<div>`. Có thể cần refactor cách trigger hiển thị (hoặc dùng controlled open state).
5. **Handle positioning edge case**: Base UI ContextMenu tự xử lý positioning qua portal. Cần verify: menu không bị overflow viewport, submenu mở đúng hướng.
6. **Verify all interactions**:
   - Right-click → menu hiện đúng vị trí.
   - Submenu hover/click → mở đúng submenu.
   - Items hoạt động đúng (Cut/Copy/Paste/Bold/etc.).
   - Read-only mode: Format/Insert/Table/Image submenu bị ẩn.
   - Contextual: Table submenu chỉ hiện khi cursor trong table, Image submenu chỉ hiện khi cursor trong image.
   - Escape/click outside → menu đóng.
   - Keyboard navigation trong menu.
7. **Typecheck**: `pnpm typecheck` trong apps/docs.
8. **Lint**: `pnpm lint` trong apps/docs.

## Todo List

- [ ] Đọc ui-kit ContextMenu API + DocRow reference pattern
- [ ] Rewrite EditorContextMenu.tsx sang ui-kit primitives + submenu
- [ ] Adjust EditorPage.tsx integration (trigger rendering)
- [ ] Verify submenu interactions (hover, click, positioning)
- [ ] Verify contextual behavior (table/image submenu)
- [ ] Verify read-only mode
- [ ] Typecheck + lint

## Success Criteria

- Context menu root level chỉ còn ~5 items (Cut/Copy/Paste + 2-4 submenu triggers).
- Submenu mở/hover đúng, positioned đúng viewport.
- Tất cả actions hoạt động đúng (Cut/Copy/Paste/Bold/Italic/Underline/Image/Table/Page Break/Find & Replace/Table operations/Image alignment).
- Read-only mode: Format/Insert/Table/Image submenu bị ẩn.
- Contextual: Table submenu chỉ hiện khi cursor trong table, Image submenu chỉ hiện khi cursor trong image.
- Escape/click outside → menu đóng.
- Code giảm ~100 dòng (bỏ custom positioning logic).
- File ≤ 400 dòng.
- Typecheck + lint pass.

## Risk Assessment

| Rủi ro | Mitigation |
|--------|-----------|
| Base UI positioning không đúng với custom position coords | Dùng `ContextMenu` controlled mode hoặc test kỹ với viewport edge cases |
| Submenu trigger click thay vì hover | Base UI ContextMenuSub hỗ trợ cả hover và click — test cả 2 |
| Portal z-index conflict | ui-kit đã set `z-50` — verify không冲突 với其他 z-50 elements |
| EditorPage integration thay đổi | Trigger rendering cần adjust — có thể cần wrapper div hoặc controlled open state |

## Security Considerations

- Không thay đổi input handling (clipboard, image insert).
- Portal rendering an toàn (Base UI xử lý).

## Next Steps

- Phase 2 (P0 editor polish): Thêm Table properties (merge/split/cell color) vào Table submenu có sẵn.
- Phase 2: Thêm Image align/float/alt vào Image submenu có sẵn.
