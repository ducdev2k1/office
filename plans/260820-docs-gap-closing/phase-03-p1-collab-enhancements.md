# Phase 3: P1 collab — version history (Yjs snapshot), @mention, share dialog

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 50h
- Nâng cấp cộng tác: version history + restore (dùng Yjs snapshot sẵn có), @mention người dùng, share dialog phân quyền.

## Context

- Tham chiếu: `docs/brainstorm-docs-missing-features.md` mục 3 (bảng C), mục 6 đợt 2.
- Đã có: Hocuspocus + Yjs, cursor, avatar, offline sync (`collab-guide.md`), share link (copy URL), `CollabUserProfilePopover`.
- Header đã có nút version history disabled ("coming soon") — bật lên.

## Key Insights

- Yjs có sẵn: `Y.encodeStateAsUpdate`, `Y.encodeSnapshot`, `Y.snapshot` — version history rẻ (chỉ checkpoint theo thời gian + UI timeline).
- `@tiptap/extension-collaboration` hỗ trợ undo/redo qua `undoManager`; snapshot độc lập với undo stack.
- @mention: dùng `shared/suggestion.plugin.ts` (Phase 1) + danh sách user từ `collaborators` (awareness) hoặc danh sách OneMail.
- Share dialog: chưa có backend thật → encode quyền (view/edit/comment) vào URL params, UI dialog; đánh dấu "sẽ kết nối backend Giai đoạn 4".
- Cần tách logic khỏi Header (đang 287 dòng, gần giới hạn) — tách share dialog thành component riêng.

## Requirements

### Functional

- Version history: tự lưu checkpoint mỗi N phút (vd 10p) hoặc khi doc đóng; list các phiên bản (thời gian, người sửa cuối); xem trước; restore.
- @mention: gõ `@` → suggestion list người dùng → chèn mention (mark/node) hiển thị tên; click vào mention → popover thông tin.
- Share dialog: mở bằng nút Share (Header), chọn quyền View/Edit/Comment, copy link kèm quyền, quản lý người được chia sẻ (giả lập).
- Thông báo (toast) khi copy link.

### Non-functional

- Snapshot không phá collab đang chạy (chỉ đọc, restore tạo transaction mới).
- Mention tương thích Yjs + XSS-safe (không render HTML user nhập).
- Share URL parse lại đúng khi mở.

## Related Code Files

- **Create**: `packages/tiptap-extensions/src/mention/mention.ts` + `mention-suggestion.ts`
- **Create**: `packages/tiptap-extensions/src/shared/yjs-snapshot.utils.ts` (encode/decode state)
- **Create**: `apps/docs/src/modules/collab/components/VersionHistoryDialog.tsx`
- **Create**: `apps/docs/src/modules/collab/components/ShareDialog.tsx`
- **Create**: `apps/docs/src/modules/collab/components/MentionPopover.tsx`
- **Modify**: `apps/docs/src/modules/header/components/Header.tsx` (bật version history, dùng ShareDialog, mention nút)
- **Modify**: `apps/docs/src/hooks/useDocs.ts` (lưu snapshot history vào storage-adapter)
- **Modify**: `apps/docs/src/services/docs.service.ts` (docHistoryStore: [{id, docId, time, update: Uint8Array}])
- **Modify**: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts` (thêm Mention extension)
- **Modify**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json`

## Implementation Steps

1. `yjs-snapshot.utils.ts`: helper `saveSnapshot(ydoc)`, `restoreSnapshot(ydoc, update)`, diff để lưu tối thiểu.
2. `docHistoryStore` trong storage-adapter (indexeddb): put/get/list/delete theo docId.
3. Hook `useVersionHistory(activeDoc, ydoc)`: auto-save 10p + manual; list versions; preview (restore vào editor rồi so sánh).
4. VersionHistoryDialog: timeline UI, nút Xem, nút Khôi phục (confirm dialog), xóa version.
5. Mention: node `mention` (atom, attribute userId+name, render `<span class="mention">@name</span>`, parseHTML/renderHTML ổn định). Suggestion plugin gõ `@` → list từ collaborators + danh sách tĩnh OneMail mẫu.
6. MentionPopover: click mention → popover thông tin user (tái dùng CollabUserProfilePopover style).
7. ShareDialog: role selector (view/edit/comment), copy link `?access=...`, mock "người được chia sẻ" list, giải thích chưa nối backend.
8. Parse `?access=` khi mở doc → hiển thị mode + cảnh báo nếu không có quyền sửa.
9. Bật nút version history trong Header.
10. i18n, typecheck, test, verify 2 tab.

## Todo List

- [ ] Yjs snapshot utils + docHistoryStore
- [ ] useVersionHistory hook + auto-save
- [ ] VersionHistoryDialog (list/preview/restore)
- [ ] Mention node + suggestion
- [ ] MentionPopover
- [ ] ShareDialog + role + URL param
- [ ] Parse access khi mở doc
- [ ] Bật header buttons
- [ ] i18n + verify 2 tab

## Success Criteria

- Gõ 2 tab 30 phút → version history có checkpoint, restore về đúng nội dung cũ mà không phá hiện tại.
- Gõ `@` hiện list, chọn → chèn mention, click → popover.
- Share link với access=edit mở được, access=view cảnh báo chế độ xem.
- Typecheck + test pass, header không quá 400 dòng.

## Risk Assessment

| Rủi ro                              | Mitigation                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| Snapshot chiếm dung lượng IndexedDB | Chỉ lưu delta nhỏ (encodeStateAsUpdate giữa 2 điểm), giới hạn 50 bản, tự xóa cũ |
| Restore đè lên người đang sửa       | Restore tạo undoable transaction, confirm trước; hiển thị "ai đang sửa"         |
| Mention lệch vị trí khi đồng sửa    | Dùng atom node (không split), Yjs tự merge                                      |

## Security Considerations

- Mention name: escape khi render (XSS).
- Share URL access: chỉ là flag client, không bảo mật thật — ghi chú trong UI, thay bằng backend ở Giai đoạn 4.

## Next Steps

- Phase 4 (export .docx) — độc lập.
- Phase 6 (comments) — dùng yjs-anchor utils.
