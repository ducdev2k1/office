---
phase: 5
title: "Screen Header-Footer Layer"
status: pending
priority: P2
dependencies: [3]
effort: "0.5d"
---

# Phase 5: Screen Header-Footer Layer

## Overview

Hiển thị header/footer + số trang trên paged view để WYSIWYG. Tận dụng `.page-stack` — lớp decorative đã có sẵn `aria-hidden`, render `pageCount` div `.page` rỗng. **Không đụng ProseMirror**, nên rủi ro gần bằng 0.

## Requirements

**Functional**
- Mỗi `.page` trong `.page-stack` hiển thị header/footer text + số trang đúng vị trí lề.
- Nội dung y hệt bản in (dùng chung `resolveSlot` từ P3).
- `viewMode !== 'paged'` → không hiển thị.

**Non-functional**
- Không selectable, không nằm trong tab order — đây là lớp trang trí.
- Không ảnh hưởng `usable` của engine phân trang (giữ nguyên công thức hiện tại).

## Architecture

`EditorCanvas.tsx` hiện có:
```tsx
<div className="page-stack" aria-hidden="true">
  {Array.from({ length: pageCount }).map((_, i) => <div key={i} className="page" />)}
</div>
```

Đổi thành component `PageStack` render header/footer bên trong mỗi `.page`:

```tsx
<div className="page" key={i}>
  <div className="page-hf page-header">
    <span>{slot.left}</span><span>{slot.center}</span><span>{slot.right}</span>
  </div>
  <div className="page-hf page-footer">…</div>
</div>
```

`slot` từ `resolveSlot(setup.header, setup.pageNumber, 'header', i, pageCount, ctx)`.

`ctx.date` tính **một lần** ở `useMemo` cấp component, không gọi `new Date()` trong vòng lặp — tránh lệch giữa các trang và giữa màn hình/bản in.

CSS:
```css
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
.is-paged .page { position: relative; }   /* hiện chưa có, cần thêm */
```

`--header-margin` / `--footer-margin` thêm vào `pageStyle` trong `usePagination.ts` (`mmToPx(setup.headerMargin)`).

### Known limitation

Header/footer nằm **trong** vùng lề, không đẩy content. Nếu text header cao hơn `marginTop - headerMargin` thì sẽ đè lên nội dung. Google Docs tự nới lề trong trường hợp này. Ngoài scope vòng này — ghi vào `docs/` và giữ `white-space: nowrap` + `overflow: hidden` để text dài bị cắt thay vì xuống dòng đè.

## Related Code Files

- Create: `apps/docs/src/modules/editor/components/PageStack.tsx`
- Modify: `apps/docs/src/modules/editor/components/EditorCanvas.tsx` — thay khối `.page-stack` inline bằng `<PageStack />`
- Modify: `apps/docs/src/modules/editor/hooks/usePagination.ts` — thêm `--header-margin`, `--footer-margin` vào `pageStyle`
- Modify: `apps/docs/src/assets/styles/styles.css` — style `.page-hf`, thêm `position: relative` cho `.is-paged .page`
- Modify: `apps/docs/src/modules/editor/print/print-document.utils.ts` — dùng chung helper dựng 3 ô với P5 (DRY)

## Implementation Steps

1. Tách helper dựng 3 ô dùng chung giữa print và screen — đặt ở `print/page-tokens.utils.ts` (đã có `resolveSlot`), thêm hàm trả về tuple `[left, center, right]` để cả 2 nơi map.
2. Tạo `PageStack.tsx`, nhận `pageCount`, `setup`, `docTitle`. `useMemo` cho `date`.
3. Thay khối inline trong `EditorCanvas.tsx`. Giữ `aria-hidden="true"` ở container.
4. Thêm CSS vars `--header-margin` / `--footer-margin` vào `pageStyle`.
5. Thêm CSS `.page-hf` + `position: relative` cho `.is-paged .page`.
6. Mở browser: bật `pageNumber.enabled` thủ công qua devtools, kiểm số trang chạy đúng 1..N trên màn hình.
7. So sánh trực tiếp màn hình vs print preview — text phải giống hệt.

## Success Criteria

- [ ] Số trang hiện đúng 1..N trên paged view
- [ ] `startAt` và `skipFirstPage` hoạt động giống hệt bản in
- [ ] Header/footer text render đúng 3 ô căn trái/giữa/phải
- [ ] `{date}` giống nhau giữa mọi trang và giữa màn hình / bản in
- [ ] Không select được text header/footer, không vào tab order
- [ ] `viewMode !== 'paged'` → không hiển thị
- [ ] Text header dài không xuống dòng đè nội dung (bị cắt)
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Logic dựng ô bị viết 2 lần (screen + print) rồi lệch nhau | Dùng chung `resolveSlot` từ P3; bước 1 tách helper trước |
| `new Date()` gọi nhiều lần → `{date}` lệch qua nửa đêm | Tính 1 lần trong `useMemo`, truyền xuống |
| Header dài đè nội dung | `nowrap` + `overflow: hidden`; ghi known limitation |
| `.page` chưa có `position: relative` → absolute thoát ra ngoài | Thêm rule; kiểm ở trang 2+ chứ không chỉ trang 1 |
