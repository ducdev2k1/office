# Phase 1: Sổ sách + Spellcheck native quick win

## Overview

- **Priority**: P0 | **Status**: done | **Effort**: 2h
- Hai việc nhanh: (1) cập nhật status plan `260820-docs-gap-closing` từ pending → completed cho đúng thực tế (đã xong 9/9 phase theo verification report); (2) bật spellcheck native browser cho editor — quick win ~15'.

## Context

- `plans/260820-docs-gap-closing/plan.md`: frontmatter `status: pending` + bảng Phases ghi `pending` — nhưng `reports/verification-report.md` xác nhận 9/9 Done, code có đầy đủ bằng chứng.
- Spellcheck: brainstorm (`docs/brainstorm-docs-missing-features.md` mục Mảng E) hoãn hunspell WASM vì tốn kém. Quyết định grilling 21/08: dùng native browser trước.

## Key Insights

- ProseMirror render content trong `contenteditable` — chỉ cần set thuộc tính `spellcheck="true"` qua `editorProps.attributes` là browser gạch đỏ theo từ điển ngôn ngữ người dùng (Chrome/Firefox đều có tiếng Việt).
- Không thêm UI phức tạp: bật mặc định; toggle on/off (nếu làm) để phase sau quyết định sau khi đánh giá chất lượng.
- Cần đảm bảo CSS không che gạch đỏ: kiểm tra `.tiptap` không set `text-decoration: none` đè lên spellcheck underline (spellcheck squiggle không bị ảnh hưởng bởi text-decoration thông thường, nhưng kiểm tra vẫn an toàn).

## Requirements

### Functional

- Editor gõ tiếng Việt sai chính tả → browser gạch đỏ (Chrome + Firefox).
- Gạch đỏ hoạt động cả ở chế độ collab lẫn offline.
- Click chuột phải vào từ gạch đỏ → menu sửa của browser hiện đúng (không bị context menu custom của app chặn hoàn toàn — nếu context menu custom chặn thì cần giữ đường: Shift+right-click hoặc để từ trống không mở custom menu).

### Non-functional

- Không ảnh hưởng hiệu năng gõ phím.
- Typecheck + build pass.

## Related Code Files

- **Modify**: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts` (editorProps.attributes thêm `spellcheck: 'true'`)
- **Modify**: `apps/docs/src/assets/styles/styles.css` (kiểm tra/nhả CSS nếu che squiggle)
- **Modify**: `apps/docs/src/modules/editor/components/EditorContextMenu.tsx` (nếu cần nhường right-click cho từ sai chính tả)
- **Modify**: `plans/260820-docs-gap-closing/plan.md` (status pending → completed, bảng phases pending → done)
- **Modify**: `plans/260820-docs-gap-closing/phase-*.md` (dòng `**Status**` chưa done → done)

## Implementation Steps

1. Cập nhật status các file plan gap-closing (frontmatter + bảng + dòng Status từng phase) khớp verification report.
2. Thêm `spellcheck: 'true'` vào `editorProps.attributes` trong `useDocsEditor.ts`.
3. Kiểm tra styles.css không có rule che squiggle; sửa nếu có.
4. Kiểm tra EditorContextMenu: right-click trên từ sai chính tả vẫn mở được menu sửa của browser (native menu ưu tiên khi selection nằm trong từ bị đánh dấu — hoặc tối thiểu có đường thoát Shift+right-click).
5. Build + typecheck + test thủ công trên Chrome và Firefox với văn bản tiếng Việt.

## Acceptance Criteria

- [ ] Plan gap-closing hiển thị status completed/done toàn bộ.
- [ ] Gõ "xin chao cac ban" (không dấu, sai) → gạch đỏ trên Chrome/Firefox.
- [ ] Right-click sửa từ gạch đỏ được (native hoặc đường thoát rõ ràng).
- [ ] Build + typecheck pass, unit test không vỡ.
