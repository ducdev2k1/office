# Phase 1: Scaffold package `tiptap-extensions` + P0 quick wins

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 30h
- Dựng khung package nội bộ `packages/tiptap-extensions` cho mọi extension "Pro" tự build. Bổ sung các tính năng nhanh mảng A: clear formatting, justify, line spacing, checklist.

## Context

- Tham chiếu: `docs/brainstorm-docs-missing-features.md` mục 4 (kiến trúc), mục 6 đợt 1.
- Codebase hiện có: `apps/docs/src/modules/editor/extensions/` chứa fontSize/fontWeight/indent/pageBreak/pagination/keyboardShortcuts — mẫu để tách sang package.

## Key Insights

- `@tiptap/extension-table` đã có `mergeCells`/`splitCell`/`setCellAttribute` sẵn — chỉ thiếu UI (sẽ làm Phase 2).
- `@tiptap/extension-task-list` + `task-item` là MIT, dùng trực tiếp được.
- Justify: `@tiptap/extension-text-align` đã cài — chỉ thêm giá trị `justify`.
- Line spacing: theo pattern `fontSize.extension.ts` (custom attribute trên TextStyle) + CSS line-height.
- Clear formatting: ProseMirror có sẵn `unsetAllMarks()` + `setParagraph()`.

## Requirements

### Functional

- Khung package export được: TOC, columns, footnote, comments, track-changes, math, shared utils.
- Nút "Xóa định dạng" (Ctrl+\\) xóa mọi mark + textStyle attrs + đưa về paragraph.
- Nút justify căn đều hai bên.
- Điều chỉnh line spacing (1.0/1.15/1.5/2.0) + khoảng cách trước/sau đoạn.
- Checklist (task list) bật/tắt được, hiển thị checkbox.

### Non-functional

- Tương thích Yjs (không phá collab).
- Có `parseHTML`/`renderHTML`.
- Không phá round-trip HTML.

## Architecture

```text
packages/tiptap-extensions/
├── package.json                 # exports: ./toc, ./columns, ./footnote, ./comments, ./track-changes, ./math, ./shared
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── shared/
│   │   ├── suggestion.plugin.ts      # suggestion (dùng cho @mention + TOC navigation)
│   │   ├── yjs-anchor.utils.ts       # Yjs relative position helper
│   │   ├── popup.utils.ts            # floating UI popup dùng chung
│   │   └── dom.utils.ts              # nodeDOM đo đạc
│   ├── clear-formatting/             # Extension (hoặc command)
│   ├── line-spacing/                 # LineSpacingExtension + ParagraphSpacingExtension
│   ├── checklist/                    # wrapper @tiptap task-list (MIT)
│   ├── toc/                          # Phase 2
│   ├── columns/                      # Phase 7
│   ├── footnote/                     # Phase 7
│   ├── comments/                     # Phase 6
│   ├── track-changes/                # Phase 8
│   └── math/                         # Phase 7
```

## Related Code Files

- **Create**: `packages/tiptap-extensions/{package.json,tsconfig.json,src/**}`
- **Create**: `apps/docs/src/modules/editor/extensions/clearFormatting.extension.ts` (nếu giữ trong app) hoặc import từ package
- **Modify**: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts` (thêm extension mới)
- **Modify**: `apps/docs/src/modules/toolbar/components/TextStyleTools.tsx` (clear formatting, justify)
- **Modify**: `apps/docs/src/modules/toolbar/components/ListAlignTools.tsx` (justify, checklist)
- **Modify**: `apps/docs/src/modules/toolbar/components/FontSizePicker.tsx` (line spacing dropdown)
- **Modify**: `apps/docs/src/modules/editor/extensions/keyboardShortcuts.extension.ts` (Ctrl+\\ clear formatting)
- **Modify**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json` (label mới)
- **Modify**: root `package.json` + `pnpm-workspace.yaml` (đăng ký workspace)

## Implementation Steps

1. Tạo package `packages/tiptap-extensions` (package.json, tsconfig, exports). Đăng ký vào pnpm-workspace.
2. `shared/suggestion.plugin.ts`: ProseMirror plugin suggestion (pattern từ TipTap community, MIT) — trả về items + popup render hook.
3. `shared/yjs-anchor.utils.ts`: helper `anchorToPos`/`posToAnchor` dùng Y.Text relative position.
4. `shared/popup.utils.ts`: wrapper floating-ui cho popup position theo editor coords.
5. Clear formatting: command `unsetAllMarks()` + `setParagraph()` + xóa `textStyle` attrs (fontFamily/fontSize/fontWeight/color) — thêm vào keyboardShortcuts `Mod-\`.
6. Justify: cấu hình `TextAlign` thêm `justify` — thêm nút toolbar.
7. Line spacing: `LineSpacing` extension (attribute `lineHeight` trên TextStyle) + `ParagraphSpacing` (margin-top/bottom). Thêm dropdown vào FontSizePicker.
8. Checklist: cài `@tiptap/extension-task-list` + `task-item`, thêm nút toolbar + phím tắt.
9. i18n labels VI/EN cho tất cả nút mới.
10. Typecheck + test.

## Todo List

- [ ] Scaffold package + workspace registration
- [ ] shared utils (suggestion, yjs-anchor, popup)
- [ ] Clear formatting command + shortcut
- [ ] Justify
- [ ] Line spacing + paragraph spacing
- [ ] Checklist
- [ ] i18n
- [ ] Typecheck + test pass

## Success Criteria

- `pnpm --filter @office/docs typecheck` + `pnpm test` pass.
- Các nút mới hoạt động đúng, active state chuẩn.
- Gõ đồng thời 2 tab (collab) không phá content khi dùng tính năng mới.
- HTML round-trip: tạo content có checklist/line-height → save → reload → đúng.

## Risk Assessment

| Rủi ro                                        | Mitigation                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| Checklist không tương thích collab            | Dùng extension MIT chính thức; kiểm thử 2 tab                           |
| Line spacing xung đột pagination đo chiều cao | Test với trang đầy; pagination đo offsetHeight thực tế nên tự thích ứng |

## Security Considerations

- Không render HTML người dùng nhập trực tiếp (React tự escape).
- Suggestion plugin: lọc ký tự HTML khi hiển thị tên người dùng.

## Next Steps

- Phase 2 (P0 editor polish) — dùng `shared/popup.utils` + `shared/suggestion.plugin`.
- Phase 6–8 — dùng `shared/yjs-anchor.utils`.
