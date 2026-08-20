---
phase: 6
title: 'Configuration UI'
status: done
priority: P2
dependencies: [3, 5]
effort: '0.5d'
---

# Phase 6: Configuration UI

## Overview

Dialog cấu hình header/footer + số trang. **MVP cut sau red team**: một entry point, không tab, không `selectionStart` tracking. Sau phase này yêu cầu gốc của user đã đạt trọn vẹn.

## MVP cut — cắt gì và vì sao

| Phiên bản trước                                                    | Sau red team                                                    | Lý do                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3 entry point (menu ×2 + nút trong PageSetupPanel)                 | **1** entry point: `Chèn > Đầu trang, chân trang & số trang`    | 2 cái kia sinh ra prop `defaultTab` — một contract tồn tại chỉ để phục vụ chính quyết định 3-entry-point, không phục vụ nhu cầu user nào                                                                                                                                                                                                    |
| Hệ tab 2 tab + prop `defaultTab`                                   | Một dialog cuộn dọc, 2 section                                  | `@office/ui-kit` **không có Tabs** (`index.ts:12-25` chỉ có badge, button, card, checkbox, context-menu, dialog, dropdown-menu, input, popover, scroll-area, separator, skeleton, switch, tooltip). Hedge "dùng nếu có" của bản trước sẽ đẩy implementer vào lựa chọn giữa viết Tabs mới trong package dùng chung (scope creep) hoặc tự chế |
| Token chips + `useRef` focus tracking + `selectionStart` insertion | Chip append vào cuối ô đang focus, fallback ô center của footer | Click chip làm blur ô input → `selectionStart` mất. Bản trước không nói cách xử lý blur. Đây là phần dễ hỏng nhất của dialog                                                                                                                                                                                                                |
| Preview line                                                       | **Giữ**                                                         | Rẻ, và token là khái niệm không hiển nhiên — không có preview thì user phải đóng dialog mới biết                                                                                                                                                                                                                                            |

Nút trong `PageSetupPanel` và mục `Chèn > Số trang` riêng: để vòng sau nếu user hỏi.

## Requirements

**Functional**

- 6 ô text: header × (trái/giữa/phải), footer × (trái/giữa/phải).
- Token chips: `{page}` `{pages}` `{title}` `{date}`.
- Cấu hình số trang: bật/tắt, vị trí (header/footer), căn lề, format, `startAt`, `skipFirstPage`.
- Apply → ghi vào `activeDoc.pageSetup` qua đường persist hiện có.

**Non-functional**

- i18n đầy đủ `vi` và `en`.
- Không thêm dependency, không thêm component vào `@office/ui-kit`.
- Announce giá trị đã apply qua live region (nối tiếp yêu cầu a11y của P5).

## Architecture

### Component

`PageHeaderFooterPanel.tsx` theo đúng pattern `PageSetupPanel.tsx` (`Dialog` từ `@office/ui-kit`, local `draft`, `useEffect` sync, `DialogFooter` Cancel/Apply, `<select>` HTML thuần chứ không component ui-kit).

```tsx
interface PageHeaderFooterPanelProps {
  open: boolean;
  setup: PageSetup;
  onApply: (setup: PageSetup) => void;
  onClose: () => void;
}
```

Không có `defaultTab`.

### ⚠️ Prop `setup` phải có identity ổn định

`PageSetupPanel.tsx:23-27` có `useEffect(() => setDraft(setup), [setup])`. Dialog này copy pattern đó. Nếu call site truyền object normalize inline (tạo mới mỗi render) → effect chạy mỗi render → `setDraft` ghi đè → **user không gõ được**.

P3 đã fix bằng cách normalize ở `withDefaults` (storage boundary) nên `activeDoc.pageSetup` giữ identity ổn định. Call site phải truyền thẳng `activeDoc.pageSetup`, **không** bọc thêm hàm normalize.

Acceptance criteria phải kiểm "gõ được vào ô text", không chỉ "ô text tồn tại" — bản trước để lọt case này.

### Persist

Dùng đúng handler `onPageSetupChange` mà `PageSetupPanel` đang dùng — đã verify carry field optional mới bình thường: `setActiveDocPageSetup` → `updateDoc` → `setDocs` → `useEffect([docs])` → `saveDocs` → `putMany(docs.map(withDefaults))` (`useDocs.ts:157-159`, `:56-59`, `docs.service.ts:103`).

Lưu ý đã biết: đây là autosave **toàn bộ mảng docs** mỗi lần đổi, không debounce. Không phải vấn đề của plan này nhưng phase này làm tăng tần suất — nếu thấy chậm thì ghi thành issue riêng, đừng sửa trong scope này.

### i18n

`packages/i18n/src/locales/{en,vi}/docs.json`, nhánh `headerFooter.*`:

```
title, header, footer, alignLeft, alignCenter, alignRight,
tokens.label, tokens.page, tokens.pages, tokens.docTitle, tokens.date,
pageNumber.enable, pageNumber.position, pageNumber.align,
pageNumber.format, pageNumber.startAt, pageNumber.skipFirst,
preview, applied, apply, cancel
```

Cộng `menu.insert.headerFooter`.

`MenuBar.tsx:111-126` — menu `Chèn` hiện có 4 mục (image, table, horizontalRule, pageBreak). Thêm separator + 1 mục. `MenuItem` đã hỗ trợ `'separator'` (`header.types.ts:13`).

## Related Code Files

- Create: `apps/docs/src/modules/editor/components/PageHeaderFooterPanel.tsx`
- Modify: `apps/docs/src/modules/header/components/MenuBar.tsx:111-126` — 1 mục menu
- Modify: `apps/docs/src/modules/header/types/header.types.ts` — 1 action `onOpenHeaderFooter`
- Modify: `apps/docs/src/pages/EditorPage.tsx` — state + render + wiring
- Modify: `packages/i18n/src/locales/en/docs.json`
- Modify: `packages/i18n/src/locales/vi/docs.json`

## Implementation Steps

1. Thêm i18n keys cho **cả** `en` và `vi` trước — component không hardcode text.
2. Viết `PageHeaderFooterPanel.tsx` theo pattern `PageSetupPanel.tsx`: một dialog cuộn dọc, section "Đầu trang & chân trang" (6 ô) + section "Số trang". `<select>` HTML thuần.
3. Token chips: append vào cuối ô đang focus; nếu không ô nào focus thì vào ô center của footer. Không dùng `selectionStart`.
4. Preview line dùng `resolveSlot` với `page=1, pages=3` giả lập.
5. Thêm 1 action vào `header.types.ts` + `MenuBar.tsx`.
6. Wire state và render trong `EditorPage.tsx`. Truyền thẳng `activeDoc.pageSetup`.
7. Live region announce sau Apply.
8. Kiểm thủ công: **gõ liên tục vào từng ô** (bắt render loop), đổi từng field, Apply, reload → persist.

## Success Criteria

- [ ] Mở được từ `Chèn > Đầu trang, chân trang & số trang`
- [ ] **Gõ liên tục được vào cả 6 ô text và ô `startAt`** — không bị ghi đè giữa chừng
- [ ] Token chips chèn đúng, kể cả sau khi ô mất focus
- [ ] Preview cập nhật realtime
- [ ] Apply → màn hình (P5) và bản in (P4) đổi theo ngay
- [ ] Reload trang → cấu hình persist trong IndexedDB
- [ ] Cancel → không thay đổi gì
- [ ] Screen reader nghe được xác nhận sau Apply
- [ ] Không text hardcode; `vi` và `en` đầy đủ
- [ ] Không thêm component nào vào `@office/ui-kit`
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro                                                           | Mitigation                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `setup` prop identity không ổn định → render loop, không gõ được | P3 normalize ở `withDefaults`; truyền thẳng `activeDoc.pageSetup`; AC kiểm "gõ liên tục" |
| Implementer đi viết Tabs mới trong ui-kit                        | Plan chốt: không tab, một dialog cuộn dọc                                                |
| Chip insertion mất `selectionStart` khi blur                     | Append vào cuối ô, không dùng `selectionStart`                                           |
| Thiếu i18n key một ngôn ngữ                                      | Thêm cả 2 file cùng lúc ở bước 1                                                         |
| `pageSetup` không persist                                        | Dùng đúng `onPageSetupChange` hiện có, không tạo đường lưu mới                           |
