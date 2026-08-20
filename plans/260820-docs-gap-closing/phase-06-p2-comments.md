# Phase 6: P2 comments & threads (Yjs-based)

## Overview

- **Priority**: P2 | **Status**: done | **Effort**: 40h
- Xây tính năng bình luận (comments + threads) tương tự gg docs, tự build trên Yjs — thay cho `@tiptap/extension-comments` (Pro). Header đã có nút comments disabled — bật lên.

## Context

- Tham chiếu: `docs/brainstorm-docs-missing-features.md` mục 3 (bảng C), mục 6 đợt 3.
- Đã có: Hocuspocus + Yjs, `shared/yjs-anchor.utils.ts` (Phase 1), `shared/popup.utils.ts`, bubble toolbar (Phase 2), collaborators list + awareness.

## Key Insights

- Không dùng `@tiptap/extension-comments` (Pro, trả phí). Tự build:
  - Dữ liệu: lưu comment vào `Y.Map` riêng trên cùng ydoc (key: commentId → {threadId, author, text, createdAt, resolved}).
  - Neo vị trí: **Yjs relative position** (`Y.RelativePosition`/`createRelativePositionFromTypeIndex`) → anchor ổn định khi sửa văn bản (không phải vị trí tuyệt đối).
  - Render: ProseMirror decoration highlight đoạn bị comment + icon/highlight ở lề phải (gg docs style).
  - Panel: thanh comments phải hiển thị threads, trả lời, resolve.
- Xung đột 2 client: mỗi comment có id duy nhất (uuid), ghi vào shared map — Yjs tự merge, không ghi đè.
- Xóa comment: soft delete (flag) để không phá anchor của reply.

## Requirements

### Functional

- Chọn đoạn văn bản → nút Comment (bubble toolbar hoặc context menu) → tạo thread.
- Thread hiển thị ở panel phải + highlight đoạn tương ứng.
- Trả lời trong thread, edit/delete comment của mình, resolve thread.
- Click highlight/panel → scroll + focus đúng vị trí.
- Đồng bộ realtime: 2 tab thấy comment ngay (Yjs shared map).
- Nút comments Header bật → mở panel.

### Non-functional

- XSS-safe: escape mọi text comment.
- Tương thích collab + offline (comment vẫn lưu qua Yjs IndexedDB).
- Không phá undo/redo chính (comment không phải là doc content, nằm ngoài document).
- Panel < 400 dòng, tách component.

## Related Code Files

- **Create**: `packages/tiptap-extensions/src/comments/comments.ts` (plugin + decoration)
- **Create**: `packages/tiptap-extensions/src/comments/comments-store.ts` (Y.Map wrapper)
- **Create**: `packages/tiptap-extensions/src/comments/comments-decoration.ts` (highlight + gutter icon)
- **Create**: `apps/docs/src/modules/editor/components/CommentsPanel.tsx`
- **Create**: `apps/docs/src/modules/editor/components/CommentThread.tsx` + `CommentItem.tsx`
- **Modify**: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts` (thêm Comments extension, khởi tạo shared map)
- **Modify**: `apps/docs/src/modules/editor/components/BubbleToolbar.tsx` (nút Comment)
- **Modify**: `apps/docs/src/modules/editor/components/EditorContextMenu.tsx` (nút Comment)
- **Modify**: `apps/docs/src/modules/header/components/Header.tsx` (bật comments button)
- **Modify**: `apps/docs/src/pages/EditorPage.tsx` (state commentsOpen + render panel)
- **Modify**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json`

## Implementation Steps

1. `comments-store.ts`: khởi tạo `Y.Map` trên ydoc (key `comments`), CRUD (add/reply/edit/delete/resolve), subscribe observer → emit events.
2. `yjs-anchor` (Phase 1): khi tạo comment → chuyển selection sang relative position, lưu {from,to} trong record.
3. `comments-decoration.ts`: plugin đọc store → decoration highlight (class `comment-highlight`) + gutter marker ở vị trí từ.
4. Comment render popup: click gutter/highlight → popup hiện thread (dùng popup.utils).
5. CommentsPanel: list threads (resolved collapse), input trả lời, actions edit/delete/resolve, auto-scroll khi chọn.
6. Wire bubble toolbar + context menu nút "Bình luận" (disabled nếu selection rỗng).
7. Bật Header comments button → toggle panel.
8. Xử lý relative position chuyển thành absolute pos tại thời điểm render (recalculate khi doc thay đổi).
9. i18n, typecheck, test, verify 2 tab.

## Todo List

- [x] comments-store (Y.Map CRUD + observer)
- [x] anchor lưu/đọc relative position
- [x] decoration highlight + gutter
- [x] Comment popup + panel + thread
- [x] Wire bubble/context menu + header
- [x] i18n + verify 2 tab

## Success Criteria

- Tạo comment trên đoạn chọn → highlight + panel hiện, 2 tab đồng bộ ngay.
- Sửa văn bản trước comment → anchor không trôi lung tung.
- Trả lời/edit/delete/resolve hoạt động đúng, undo content không ảnh hưởng comment.
- XSS: nhập `<script>` trong comment → hiển thị dạng text.
- Typecheck + test pass.

## Risk Assessment

| Rủi ro                             | Mitigation                                                            |
| ---------------------------------- | --------------------------------------------------------------------- |
| Anchor trôi khi sửa văn bản        | Dùng Yjs relative position + recalc tại render; fallback tìm gần nhất |
| Conflict 2 client cùng tạo comment | UUID + Y.Map merge; test 2 tab tạo đồng thời                          |
| Phức tạp decoration + collab       | Tách plugin/decoration riêng, không nhét vào main editor              |

## Security Considerations

- Escape mọi comment text (React mặc định nếu render text node; không dùng dangerouslySetInnerHTML).
- Giới hạn độ dài comment, chống spam.

## Next Steps

- Phase 7 (math/footnotes/columns).
- Phase 3 (@mention) — mention trong comment (thêm sau).
