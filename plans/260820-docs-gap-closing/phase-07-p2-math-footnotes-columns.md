# Phase 7: P2 math (KaTeX), footnotes, columns

## Overview

- **Priority**: P2 | **Status**: pending | **Effort**: 30h
- Bổ sung công thức toán (KaTeX), chú thích cuối trang (footnote), và văn bản nhiều cột (columns) — thay cho `@tiptap/extension-mathematics`, `@tiptap/extension-footnote`, `@tiptap/extension-columns` (Pro).

## Context

- Tham chiếu: `docs/brainstorm-docs-missing-features.md` mục 3 (bảng A: equation; bảng B: columns, footnote), mục 6 đợt 3.
- Đã có: `packages/tiptap-extensions/src/shared/` (popup, suggestion), pagination engine, `EditorContextMenu`, toolbar InsertTools.
- Thứ tự làm: Math trước (độc lập), Footnote, Columns cuối (xung đột pagination).

## Key Insights

- **Math**: KaTeX (MIT) render LaTeX → HTML/CSS. Node inline `mathInline` + block `mathBlock` (atom), attribute `tex`. Render dùng KaTeX `renderToString`; parseHTML bắt `$...$`/`$$...$$`. Popup editor nhập LaTeX (dùng popup.utils).
- **Footnote**: node `footnote` (atom) chứa `footnoteId` + nội dung; render số trên + popup nội dung khi hover/click; đánh số tự động theo thứ tự xuất hiện. Phần cuối trang (notes area) render riêng trong PageStack.
- **Columns**: node `columns` (block) chứa `column` children (2-3 cột), CSS `display: grid/flex`. **Xung đột pagination reflow** (block không split) → hạn chế: cột là block nguyên, đẩy xuống trang nếu không vừa; chỉ hỗ trợ 2-3 cột cố định.
- Tất cả node đều atom/block để Yjs không phá; phải có parseHTML/renderHTML ổn định.

## Requirements

### Functional

- Math: chèn công thức inline (Ctrl+M hoặc menu), soạn bằng LaTeX trong popup, hiển thị render đẹp, sửa lại khi click, xóa được.
- Footnote: chèn footnote tại con trỏ (menu Insert), nhập nội dung, đánh số tự động, hiển thị nội dung cuối trang (paged view + print), click số → scroll tới note.
- Columns: chèn 2/3 cột, gõ trong từng cột, đổi số cột, xóa columns.

### Non-functional

- KaTeX CSS load đúng (self-host assets, không CDN ngoài).
- Tương thích Yjs + undo/redo.
- Columns không làm hỏng pagination (giới hạn: block nguyên, không split).
- Footnote số tự động không đổi khi chèn/xóa footnote khác (recompute trên transaction).

## Related Code Files

- **Create**: `packages/tiptap-extensions/src/math/math.ts` (inline+block node) + `math-editor.ts` (popup)
- **Create**: `packages/tiptap-extensions/src/footnote/footnote.ts` + `footnote-numbering.ts` (đánh số tự động) + `footnote-popup.ts`
- **Create**: `packages/tiptap-extensions/src/columns/columns.ts` + `column.ts`
- **Create**: `apps/docs/src/modules/editor/components/MathEditorPopup.tsx`
- **Create**: `apps/docs/src/modules/editor/components/FootnoteNotesArea.tsx` (render notes cuối trang)
- **Modify**: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts` (thêm 3 extension)
- **Modify**: `apps/docs/src/modules/toolbar/components/InsertTools.tsx` (menu Math/Footnote/Columns)
- **Modify**: `apps/docs/src/modules/editor/components/PageStack.tsx` (footnote notes area)
- **Modify**: `apps/docs/src/modules/editor/extensions/pagination.extension.ts` (xử lý columns + footnote block)
- **Modify**: `apps/docs/src/modules/editor/print/print-document.utils.ts` (in columns + footnote)
- **Modify**: `apps/docs/src/assets/styles/styles.css` (KaTeX CSS, columns grid, footnote styles)
- **Modify**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json`

## Implementation Steps

1. Cài `katex` (MIT). Import CSS vào styles.css.
2. Math: node inline/block + renderToString + popup soạn LaTeX; wire toolbar + shortcut Ctrl+Shift+M.
3. Footnote: node footnote atom chứa nội dung; plugin đánh số theo vị trí; popup xem/sửa; FootnoteNotesArea ở cuối trang (PageStack) hiển thị các note của trang đó.
4. Columns: node columns + column; CSS grid; UI chèn 2/3 cột + đổi cột + xóa; pagination coi columns là block không split.
5. Print: đảm bảo columns và footnote in đúng (break-inside: avoid cho columns).
6. i18n, typecheck, test, verify 2 tab collab.

## Todo List

- [ ] KaTeX setup + Math nodes + popup
- [ ] Footnote node + numbering + notes area
- [ ] Columns node + CSS + UI
- [ ] Pagination/print tích hợp
- [ ] i18n + typecheck + test + collab verify

## Success Criteria

- Nhập `\frac{a}{b}` → hiển thị phân số đẹp, sửa được, export HTML đúng.
- Chèn 2 footnotes → đánh số 1,2; chèn giữa → đánh lại đúng; click số nhảy tới note; note in ở cuối trang.
- Chèn 2 cột → gõ 2 cột song song; đổi 3 cột đúng; không vỡ layout trang.
- Typecheck + test pass.

## Risk Assessment

| Rủi ro                             | Mitigation                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Columns phá pagination             | Block nguyên, đẩy xuống trang; warning nếu quá cao (giống table/image)      |
| KaTeX bundle lớn                   | Dynamic import `katex` + `katex/dist/contrib/auto-render`; chỉ tải khi dùng |
| Footnote numbering xung đột collab | Numbering là computed (không lưu), mỗi client tự tính → luôn đồng bộ        |

## Security Considerations

- LaTeX input → render qua KaTeX (không execute HTML); KaTeX tự escape nhưng kiểm tra option `throwOnError: false`.
- Footnote/columns content là node chuẩn, không nhận HTML thô.

## Next Steps

- Phase 8 (track changes) — khó nhất.
- Phase 4 (export .docx) — bổ sung map math (OMML) và footnote khi cần.
