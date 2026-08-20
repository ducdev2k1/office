# Phase 8: P2 track changes / suggestion mode

## Overview

- **Priority**: P2 | **Status**: done | **Effort**: 40h
- Xây chế độ theo dõi thay đổi (suggestion mode / track changes) kiểu gg docs: đề xuất chỉnh sửa, highlight thay đổi, accept/reject từng phần hoặc tất cả. Thay cho `@tiptap/extension-track-changes` (Pro).

## Context

- Tham chiếu: `docs/brainstorm-docs-missing-features.md` mục 3 (bảng C), mục 6 đợt 3 — **làm cuối cùng, khó nhất**.
- Đã có: Yjs + collab, `shared/yjs-anchor.utils.ts`, `shared/suggestion.plugin.ts`, Comments (Phase 6) làm tiền đề kỹ thuật.
- Chưa có nút UI nào — cần thêm.

## Key Insights

- **Mô hình phức tạp nhất dự án.** Cách tiếp cận thực tế cho MVP:
  - Khi bật "Đề xuất" mode: mọi transaction được wrap thành "suggestion" — không áp trực tiếp vào doc mà lưu riêng (pending edits) và render overlay.
  - Lưu suggestion: Y.Map `suggestions` (key: id → {type: insert/delete/format, from, to (relative pos), attrs, author}).
  - **Không hỗ trợ chồng lấn phức tạp** — mỗi vùng chỉ 1 suggestion active; chấp nhận giới hạn MVP.
  - Accept: áp thay đổi vào doc (transaction thật) + xóa suggestion. Reject: xóa suggestion, giữ nguyên.
- GG Docs không có track changes gốc (chỉ Suggestion mode) — ta làm đúng kiểu đó: **suggestion mode**, không phải Word-style redline.
- Cách khác rẻ hơn (đánh dấu mark trên chính doc) phá hỏng Yjs undo/redo + collab — loại. Phải dùng overlay riêng.
- Dùng decoration: insert = underline xanh, delete = strikethrough + nền xám (gg docs style).

## Requirements

### Functional

- Nút bật/tắt "Đề xuất chỉnh sửa" (Header/Toolbar) — khi bật, mọi chỉnh sửa thành suggestion.
- Render: insert (underline xanh), delete (strikethrough + highlight), format thay đổi (viền đôi).
- Click suggestion → popup: Accept / Reject / chi tiết (người, thời gian).
- Panel/thanh: Accept all / Reject all, đếm số suggestion.
- Chuyển sang suggestion hiện tại bằng nút điều hướng (◀ ▶).
- Đồng bộ collab: suggestion của người A hiện ở tab B.

### Non-functional

- Không phá doc gốc cho tới khi Accept.
- Tương thích Yjs (suggestion lưu shared map, không phải node).
- MVP giới hạn: không hỗ trợ suggestion chồng lấn (1 vùng 1 suggestion), không format-suggestion phức tạp.

## Related Code Files

- **Create**: `packages/tiptap-extensions/src/track-changes/track-changes.ts` (state + plugin)
- **Create**: `packages/tiptap-extensions/src/track-changes/suggestion-store.ts` (Y.Map)
- **Create**: `packages/tiptap-extensions/src/track-changes/decoration.ts` (insert/delete render)
- **Create**: `apps/docs/src/modules/editor/components/SuggestionBadge.tsx` (click → accept/reject)
- **Create**: `apps/docs/src/modules/editor/components/TrackChangesBar.tsx` (mode toggle + accept all/reject all + nav)
- **Modify**: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts` (thêm extension)
- **Modify**: `apps/docs/src/modules/header/components/Header.tsx` (nút bật mode)
- **Modify**: `apps/docs/src/modules/toolbar/components/DocTools.tsx` (nút track changes)
- **Modify**: `apps/docs/src/pages/EditorPage.tsx` (state + render TrackChangesBar)
- **Modify**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json`

## Implementation Steps

1. `suggestion-store.ts`: Y.Map suggestions CRUD + observer (pattern Comments Phase 6).
2. Track plugin: chặn transactions khi mode on → tạo suggestion thay vì áp trực tiếp. Wrap qua `view.dispatch` hook.
3. Decoration: đọc suggestions → insert/delete/format highlight + handle click mở SuggestionBadge.
4. SuggestionBadge: popup hiện author/time + Accept/Reject.
5. TrackChangesBar: toggle mode, đếm, Accept all/Reject all, điều hướng.
6. Collab: suggestion từ người khác hiện ở tab khác (shared map).
7. Xử lý accept/reject: chuyển relative → pos, áp/loại transaction.
8. i18n, typecheck, test, verify 2 tab.

## Todo List

- [x] suggestion-store (Y.Map)
- [x] Track plugin (chặn + wrap transaction)
- [x] Decoration insert/delete
- [x] SuggestionBadge + accept/reject
- [x] TrackChangesBar + toggle
- [x] Collab verify 2 tab
- [x] i18n + typecheck + test

## Success Criteria

- Bật mode → gõ chữ = underline xanh (insert), xóa = strikethrough.
- Accept → áp thật; Reject → giữ nguyên; Accept all/Reject all đúng.
- 2 tab: suggestion của A hiện ở B, accept ở B phản ánh ở A.
- Undo/redo không phá suggestion.
- Typecheck + test pass.

## Risk Assessment

| Rủi ro                           | Mitigation                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------- |
| Chặn transaction phá editor      | Test kỹ; wrap có kiểm tra điều kiện (mode on + không phải suggestion áp dụng) |
| Relative pos trôi sau nhiều edit | Recalc mỗi render (như Comments); fallback tìm gần nhất                       |
| Chồng lấn suggestion             | Giới hạn MVP: 1 vùng 1 suggestion; reject/accept trước khi tạo mới            |
| Phá Yjs undo/redo                | Suggestion không phải node doc; undo/redo chỉ tác động doc gốc                |

## Security Considerations

- Suggestion chứa attrs từ user → validate + escape khi render.
- Không nhận HTML thô trong suggestion.

## Next Steps

- Phase 9 (final verification) — test toàn diện + fidelity-harness + typecheck/build.
