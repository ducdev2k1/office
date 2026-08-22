# Phase 2: P0 editor polish — table merge UI, image resize, link popover, emoji, code highlight, bubble toolbar, zoom, TOC

## Overview

- **Priority**: P1 | **Status**: done | **Effort**: 50h
- Hoàn thiện trải nghiệm soạn thảo mảng A+B nhanh: table merge/split/màu nền ô, image resize + căn lề, link popover, emoji/special chars, code block syntax highlight, bubble toolbar, zoom, TOC trong tài liệu.

## Context

- Tham chiếu: `docs/brainstorm-docs-missing-features.md` mục 3 (bảng A, B), mục 6 đợt 1.
- Đã có: `@tiptap/extension-table` (resizable), `@tiptap/extension-image` (base64), link qua Ctrl+K, `@tiptap/extension-code-block` (StarterKit), outline từ `getOutline()`.

## Key Insights

- Table: `mergeCells`, `splitCell`, `setCellAttribute` đã có sẵn trong extension — chỉ cần UI (dropdown/context menu mở rộng `EditorContextMenu.tsx`).
- Image resize: cần custom nodeview bọc `<img>` + resize handle (pattern cộng đồng MIT). Cẩn thận tương tác pagination (block không split).
- Link popover: dùng `shared/popup.utils.ts` từ Phase 1 + decoration link → popover sửa/unlink/copy.
- Emoji: dùng thư viện emoji picker MIT (vd `emoji-picker-element`, MIT) + chèn text node.
- Code highlight: `@tiptap/extension-code-block-lowlight` (MIT) + lowlight (MIT).
- Bubble toolbar: floating-ui hiện khi selection không rỗng (gg docs style).
- Zoom: CSS `transform: scale` trên `.page-viewport` + điều chỉnh width; kết hợp `usePagination` viewportStyle.
- TOC: node TOC tự xây từ heading structure — dùng `shared/suggestion.plugin.ts` hoặc decoration click-scroll.

## Requirements

### Functional

- Table: nút merge/split ô, màu nền ô, toggle header row, độ dày/màu viền.
- Image: resize bằng kéo handle, căn lề trái/giữa/phải/float, alt text (tooltip), caption.
- Link: click link → popover hiện URL + nút Sửa/Xóa/Copy.
- Emoji/special chars: bảng chọn, chèn vào vị trí con trỏ.
- Code block: chọn ngôn ngữ + syntax highlight.
- Bubble toolbar: bôi đen → toolbar nổi (bold/italic/link/comment placeholder/clear format).
- Zoom: 50%–200%, giữ vị trí con trỏ tương đối.
- TOC: chèn danh sách heading, click scroll tới heading, cập nhật khi doc đổi.

### Non-functional

- Không phá pagination khi resize ảnh/căn lề.
- TOC tương thích collab (tự tính từ doc, không lưu trạng thái dư thừa).
- Hoạt động cả 2 view mode (paged/continuous).

## Related Code Files

- **Modify**: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts` (thêm code-block-lowlight, link popover decoration, emoji)
- **Modify**: `apps/docs/src/modules/editor/components/EditorContextMenu.tsx` (table merge/split, cell color)
- **Modify**: `apps/docs/src/modules/toolbar/components/InsertTools.tsx` (table properties dropdown, emoji button)
- **Modify**: `apps/docs/src/modules/toolbar/components/TextStyleTools.tsx` (link popover trigger)
- **Create**: `packages/tiptap-extensions/src/image/image-resize.ts` (nodeview)
- **Create**: `packages/tiptap-extensions/src/link/link-popover.ts` (decoration + popup)
- **Create**: `packages/tiptap-extensions/src/toc/toc.ts` + `toc-view.ts`
- **Create**: `apps/docs/src/modules/editor/components/BubbleToolbar.tsx`
- **Create**: `apps/docs/src/modules/editor/components/ZoomControl.tsx`
- **Modify**: `apps/docs/src/modules/editor/components/EditorCanvas.tsx` (zoom scale)
- **Modify**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json`

## Implementation Steps

1. Table: thêm group Table properties vào context menu + toolbar dropdown: merge (khi chọn 2+ ô), split (khi ô đã merge), cell background color (setCellAttribute), toggle header row, border width/color.
2. Image: custom nodeview `ImageResize` — render img + handle kéo (cập nhật width/height attribute), thanh công cụ căn lề/float/alt/caption trên node select.
3. Link popover: plugin decoration đánh dấu link; click → floating popup (URL, Edit, Copy, Unlink). Đồng bộ với `setLink` hiện có.
4. Emoji: cài emoji-picker-element + popover trigger, chèn text.
5. Code highlight: thay code-block bằng code-block-lowlight, thêm dropdown chọn ngôn ngữ, register common languages.
6. Bubble toolbar: tạo component, hiện khi `editor.isFocused` + selection không rỗng + popup tại selection coords.
7. Zoom: state zoom trong `usePagination` hoặc context editor; áp transform scale lên `.page-viewport`; điều chỉnh width container ngược lại để bố cục ổn.
8. TOC: node TOC (atom) render list từ `getOutline()`; click → scroll tới heading bằng `decoration`/`scrollIntoView`. Tự cập nhật trên transaction.
9. i18n labels.
10. Typecheck + test + verify collab 2 tab.

## Todo List

- [ ] Table properties UI (merge/split/cell color/header/border)
- [ ] Image resize nodeview + align/float/alt/caption
- [ ] Link popover
- [ ] Emoji picker
- [ ] Code block language + highlight
- [ ] Bubble toolbar
- [ ] Zoom control
- [ ] TOC node
- [ ] i18n + typecheck + test + collab verify

## Success Criteria

- Merge 2 ô → đúng, split trở lại → đúng; undo/redo an toàn.
- Resize ảnh không làm giật pagination; căn lề ảnh đúng.
- Click link mở popover, sửa URL cập nhật cả doc.
- Chèn emoji tại con trỏ.
- Code block có highlight theo ngôn ngữ.
- Bubble toolbar xuất hiện/ẩn đúng, không chặn gõ.
- Zoom 50/75/100/125/150/200% giữ vị trí ổn định.
- TOC đúng heading, click scroll đúng, đồng bộ 2 tab.
- Typecheck + test pass.

## Risk Assessment

| Rủi ro                           | Mitigation                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------- |
| Image resize xung đột pagination | Giới hạn: ảnh không split; nếu > trang → overflow (đã chấp nhận trong brainstorm) |
| Bubble toolbar nhiễu click       | Chỉ hiện khi selection, click ngoài ẩn, che pointer trên tooltip                  |
| Zoom làm layout lệch             | Scale container + bù width; test các cỡ giấy                                      |

## Security Considerations

- Emoji/lib mới: kiểm tra license MIT, không nhận input HTML ngoài.
- Alt text/caption: escape khi render.

## Next Steps

- Phase 3 (P1 collab) — dùng `shared/popup.utils.ts`.
- Phase 5 (TOC liên kết bookmark, section break).
