---
phase: 5
title: "Screen Header-Footer Layer"
status: pending
priority: P2
dependencies: [3]
effort: "0.75d"
---

# Phase 5: Screen Header-Footer Layer

## Overview

Hiển thị header/footer + số trang trên paged view để WYSIWYG, dùng chung `resolveSlot` với bản in. Tận dụng `.page-stack` — lớp decorative sẵn có, **không đụng ProseMirror**.

Kèm một việc red team chỉ ra: phase này biến `.page-stack` từ trang trí thuần thành nơi chứa **nội dung thật do user soạn**, nên `aria-hidden` trở thành regression accessibility. Phải bổ sung surface accessible.

## Requirements

**Functional**
- Mỗi `.page` hiển thị header/footer text + số trang đúng vị trí lề.
- Nội dung y hệt bản in (dùng chung `resolveSlot` từ P3b).
- `viewMode !== 'paged'` → không hiển thị.
- **Số trang hiện tại / tổng số trang phải có mặt trong accessibility tree** ở đâu đó.

**Non-functional**
- Không selectable, không nằm trong tab order — lớp visual vẫn `aria-hidden`.
- Không ảnh hưởng `usable` của engine phân trang.

## Architecture

### PageStack

`EditorCanvas.tsx:125-131` hiện có:
```tsx
<div className="page-stack" aria-hidden="true">
  {Array.from({ length: pageCount }).map((_, i) => <div key={i} className="page" />)}
</div>
```

Tách thành `PageStack.tsx`, render header/footer trong mỗi `.page`:

```tsx
<div className="page" key={i}>
  <div className="page-hf page-header">
    <span>{h.left}</span><span>{h.center}</span><span>{h.right}</span>
  </div>
  <div className="page-hf page-footer">…</div>
</div>
```

`ctx.date` tính **một lần** ở `useMemo` cấp component — không gọi `new Date()` trong vòng lặp, tránh lệch giữa các trang và giữa màn hình/bản in.

### Accessibility — bắt buộc, không để dạng open question

`.page-stack` mang `aria-hidden` vì hiện tại thuần trang trí (toàn `<div class="page">` rỗng). Phase này đưa nội dung thật vào đó: header, footer, title, date, số trang. Nội dung này **không tồn tại ở đâu khác** trong accessibility tree — không trong ProseMirror doc, không trong `Statusbar` (chỉ có word/char count).

Hệ quả: user dùng screen reader cấu hình footer qua dialog P6, Apply, và **không nhận được xác nhận nào**; cũng không có cách biết trang hiện tại / tổng số trang ở bất kỳ đâu trong app.

Fix (chốt luôn, không để open question):
- Giữ `.page-stack` là `aria-hidden` — nó là lớp visual.
- Thêm **page count / current page vào `Statusbar`** (`Statusbar.tsx` hiện chỉ có word/char count). Đây cũng là chỗ user sáng mắt hay tìm.
- Dialog P6 announce giá trị đã apply qua live region.

### CSS

```css
.is-paged .page { position: relative; }        /* hiện CHƯA có, phải thêm */

.is-paged .page-hf {
  position: absolute;
  left: var(--margin-l);
  right: var(--margin-r);
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 9pt;
  color: #5f6368;
  pointer-events: none;
  user-select: none;
}
.is-paged .page-header { top: var(--header-margin); }
.is-paged .page-footer { bottom: var(--footer-margin); }
.is-paged .page-hf > span { flex: 1 1 0; min-width: 0; overflow: hidden; white-space: nowrap; }
.is-paged .page-hf > span:nth-child(2) { text-align: center; }
.is-paged .page-hf > span:nth-child(3) { text-align: right; }
```

`--header-margin` / `--footer-margin` thêm vào `pageStyle` (`usePagination.ts:102-114`).

**Phụ thuộc guard `mmToPx` của P3.** Nếu `setup.headerMargin === undefined` thì `mmToPx(undefined)` = `NaN` → `--header-margin: NaNpx` là declaration invalid, bị CSS drop → `.page-header { top: <unset> }` trên box absolute rơi về static position y=0, nằm ngoài lề trên và **sau** `.doc-editor` (`z-index: 1`) → header vô hình hoặc đè text, **không throw gì cả**. P3 đã fix ở `withDefaults` + guard `mmToPx`; phase này phải verify lại tường minh với doc cũ.

### Known limitation

Header/footer nằm **trong** vùng lề, không đẩy content. Text header cao hơn `marginTop - headerMargin` sẽ đè nội dung. Google Docs tự nới lề. Ngoài scope — giữ `nowrap` + `overflow: hidden` để text dài bị cắt thay vì xuống dòng đè, và ghi vào `docs/`.

## Related Code Files

- Create: `apps/docs/src/modules/editor/components/PageStack.tsx`
- Modify: `apps/docs/src/modules/editor/components/EditorCanvas.tsx:125-131`
- Modify: `apps/docs/src/modules/editor/components/Statusbar.tsx` — thêm page count / current page
- Modify: `apps/docs/src/modules/editor/hooks/usePagination.ts:102-114` — `--header-margin`, `--footer-margin`
- Modify: `apps/docs/src/assets/styles/styles.css` — `.page-hf`, `position: relative` cho `.is-paged .page`
- Modify: `apps/docs/src/modules/editor/print/print-document.utils.ts` — dùng chung helper dựng 3 ô (DRY)
- Modify: `packages/i18n/src/locales/{en,vi}/docs.json` — key cho Statusbar page count

## Implementation Steps

1. Tách helper dựng tuple `[left, center, right]` trong `print/page-tokens.utils.ts` — dùng chung print và screen.
2. Tạo `PageStack.tsx`, nhận `pageCount`, `setup`, `docTitle`. `useMemo` cho `date`.
3. Thay khối inline trong `EditorCanvas.tsx`, giữ `aria-hidden="true"` ở container.
4. Thêm `--header-margin` / `--footer-margin` vào `pageStyle`.
5. Thêm CSS `.page-hf` + `position: relative` cho `.is-paged .page`.
6. Thêm page count vào `Statusbar` + i18n key `vi`/`en`.
7. **Verify với doc cũ** (chưa có `headerMargin`): CSS var không được là `NaNpx`, header đúng vị trí.
8. Browser: bật `pageNumber.enabled` qua devtools, kiểm số trang 1..N.
9. So sánh trực tiếp màn hình vs print preview — text phải giống hệt.

## Success Criteria

- [ ] Số trang hiện đúng 1..N trên paged view
- [ ] `startAt` và `skipFirstPage` hoạt động giống hệt bản in
- [ ] Header/footer render đúng 3 ô căn trái/giữa/phải
- [ ] `{date}` giống nhau giữa mọi trang và giữa màn hình / bản in
- [ ] **Doc cũ (thiếu `headerMargin`): không có `NaNpx`, header đúng vị trí**
- [ ] Không select được text header/footer, không vào tab order
- [ ] **`Statusbar` hiển thị current page / total pages** — accessible
- [ ] `viewMode !== 'paged'` → không hiển thị
- [ ] Text header dài bị cắt, không xuống dòng đè nội dung
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| `NaNpx` từ `headerMargin` undefined → header đè text, không throw | Guard `mmToPx` ở P3; bước 7 verify tường minh với doc cũ |
| Logic dựng ô viết 2 lần (screen + print) rồi lệch | Dùng chung helper từ P3; bước 1 tách trước |
| Nội dung thật bị chôn trong `aria-hidden` | Bổ sung `Statusbar` surface — bắt buộc, không optional |
| `new Date()` gọi nhiều lần → `{date}` lệch qua nửa đêm | `useMemo` một lần, truyền xuống |
| `.page` chưa có `position: relative` → absolute thoát ra ngoài | Thêm rule; kiểm ở trang 2+ chứ không chỉ trang 1 |
| Header dài đè nội dung | `nowrap` + `overflow: hidden`; known limitation ghi vào `docs/` |
