---
phase: 4
title: "Print Sliding-Window"
status: pending
priority: P1
dependencies: [3]
effort: "1-1.5d"
---

# Phase 4: Print Sliding-Window

## Overview

**Phase quan trọng nhất** — giải quyết yêu cầu gốc. Thay cơ chế in hiện tại (browser tự repaginate) bằng DOM in dựng sẵn: mỗi trang là một cửa sổ clip nhìn vào cùng một DOM đã render, offset theo `contentOffsets` từ engine. Số trang in khớp màn hình theo định nghĩa.

## Requirements

**Functional**
- Doc N trang paged view → in ra đúng N trang.
- Header/footer + số trang render trong vùng lề mỗi trang.
- Hoạt động cả khi bấm nút Print trong app lẫn khi user nhấn `Ctrl+P`.
- Chỉ áp dụng khi `viewMode === 'paged'`. Ở chế độ khác giữ hành vi in hiện tại.

**Non-functional**
- Không trang trắng thừa ở cuối.
- Dọn sạch `#print-root` sau khi in, kể cả khi user huỷ dialog.

## Architecture

### Vì sao sliding-window chứ không slice DOM

Slice DOM = cắt nội dung thành N mảnh rồi đặt vào N container. Vấn đề: P7 sẽ ngắt trang **giữa dòng** trong một paragraph — cắt DOM giữa dòng là bất khả thi sạch sẽ.

Sliding-window: clone **nguyên vẹn** `view.dom` một lần, mỗi trang chỉ đổi `top`. Cùng DOM, cùng width, cùng font, cùng CSS → line wrap **không thể lệch**. Và P7 không cần thay đổi gì ở đây.

### Cấu trúc DOM

```html
<div id="print-root">
  <div class="print-page">                              <!-- w/h = khổ giấy -->
    <div class="print-hf print-header">
      <span class="hf-left"></span>
      <span class="hf-center"></span>
      <span class="hf-right"></span>
    </div>
    <div class="print-clip">                            <!-- inset = margins, h = usable -->
      <div class="print-content" style="top: -{contentOffsets[i]}px">
        <!-- CLONE của view.dom, giống hệt mọi trang -->
      </div>
    </div>
    <div class="print-hf print-footer">…</div>
  </div>
  <!-- lặp pageCount lần -->
</div>
```

CSS:
```css
#print-root { display: none; }

@media print {
  #root { display: none !important; }
  #print-root { display: block !important; }

  .print-page {
    position: relative;
    width: var(--paper-w);
    height: calc(var(--paper-h) - 1px);   /* trừ hụt: chống trang trắng do rounding */
    overflow: hidden;
    break-after: page;
    page-break-after: always;
  }
  .print-page:last-child { break-after: auto; page-break-after: auto; }

  .print-clip {
    position: absolute;
    top: var(--margin-t); left: var(--margin-l); right: var(--margin-r);
    height: var(--usable);
    overflow: hidden;
  }
  .print-content { position: absolute; left: 0; right: 0; }
}
```

`.print-page:last-child { break-after: auto }` — bắt buộc, nếu không trang cuối sinh thêm 1 trang trắng.

Clone giữ nguyên spacer decoration của engine → khoảng trắng cuối trang tự nằm ngoài cửa sổ clip, tự bị cắt. Không cần xử lý gì thêm.

### Hook

Thay `usePrintSetup` bằng `usePrintDocument`:

```ts
export const usePrintDocument = (
  editor: Editor | null,
  activeDoc: DocRecord | undefined,
  pagination: PaginationState,
) => {
  const printDocument = () => { buildPrintRoot(); window.print(); };
  // beforeprint → buildPrintRoot()  (bắt Ctrl+P)
  // afterprint  → teardownPrintRoot()
  return { printDocument };
};
```

`buildPrintRoot` phải **idempotent** — bấm nút Print sẽ build rồi `window.print()` lại kích `beforeprint`, build lần hai. Guard bằng flag hoặc teardown-trước-build.

`@page { size: WxH mm; margin: 0 }` giữ nguyên như `usePrintSetup` hiện tại.

### Hệ quy chiếu contentOffsets — CẦN VERIFY TRƯỚC

P2 ghi `contentOffsets` theo hệ toạ độ nội bộ engine. Nhưng `.doc-editor` khi paged có `padding-top: var(--margin-t)`, nên offset thực tế trong element clone có thể lệch đúng `marginT`.

**Bước 1 của phase này là thực nghiệm**: dựng print-root với offset thô, mở browser, so vị trí nội dung trang 2 với màn hình. Điều chỉnh công thức rồi mới code tiếp. **Không đoán.**

## Related Code Files

- Create: `apps/docs/src/modules/editor/print/print-document.utils.ts`
- Create: `apps/docs/src/modules/editor/print/use-print-document.ts`
- Delete: `apps/docs/src/modules/editor/hooks/usePrintSetup.ts`
- Modify: `apps/docs/src/pages/EditorPage.tsx` — `onPrint` (2 chỗ: dòng ~167 và ~188) gọi `printDocument`
- Modify: `apps/docs/src/assets/styles/styles.css` — viết lại khối `@media print` (hiện ở ~dòng 386)
- Modify: `apps/docs/index.html` — thêm `<div id="print-root"></div>` cạnh `#root`

## Implementation Steps

1. **Thực nghiệm hệ quy chiếu** (xem trên). Ghi kết quả vào JSDoc của `contentOffsets`.
2. Thêm `<div id="print-root"></div>` vào `index.html`.
3. Viết `buildPrintRoot(editor, setup, pagination, docTitle)`:
   - Teardown trước nếu đã tồn tại
   - `const clone = editor.view.dom.cloneNode(true) as HTMLElement`
   - Đặt CSS vars (`--paper-w/h`, `--margin-*`, `--usable`) lên `#print-root`
   - Với mỗi `i` trong `[0, pageCount)`: tạo `.print-page`, gắn `resolveSlot(...)` cho header/footer, gắn `.print-clip > .print-content` với `top: -contentOffsets[i]px` và một **clone riêng** của `clone`
   - Bỏ `contentEditable` và `id` trùng lặp trên các clone
4. Viết `teardownPrintRoot()` — xoá hết con của `#print-root`.
5. Viết `use-print-document.ts`: `beforeprint`/`afterprint` listeners + `printDocument()`. Trước khi build luôn gọi `pagination.schedulePagination(true)` để chắc chắn breaks tươi.
6. Nếu `viewMode !== 'paged'` → không build, để hành vi in cũ.
7. Viết lại `@media print` trong `styles.css` theo CSS trên. Bỏ các rule `.doc-editor` cũ trong print block.
8. Wire `EditorPage.tsx` 2 chỗ `onPrint`.
9. Xoá `usePrintSetup.ts`, chuyển logic `@page` sang hook mới.
10. Verify bằng `scripts/print-check.mjs`: doc 1 / 3 / 12 / 50 trang, A4 portrait + A4 landscape + A5 + Letter.

## Success Criteria

- [ ] `print-check.mjs` báo số trang PDF == `pageCount` cho: 1, 3, 12, 50 trang
- [ ] Khớp với cả 3 khổ giấy × 2 hướng
- [ ] Không trang trắng ở cuối
- [ ] `Ctrl+P` và nút Print trong app cho kết quả giống nhau
- [ ] Huỷ dialog in → `#print-root` rỗng, app không còn dấu vết
- [ ] Bấm Print 2 lần liên tiếp → không nhân đôi trang
- [ ] Header/footer + số trang xuất hiện đúng vùng lề mọi trang
- [ ] `viewMode !== 'paged'` → in vẫn chạy (hành vi cũ)
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro | Mức | Mitigation |
|---|---|---|
| `contentOffsets` sai hệ quy chiếu → nội dung lệch dọc | Cao | Bước 1 thực nghiệm trước khi code |
| Trang trắng thừa do rounding subpixel | Trung bình | `height: calc(var(--paper-h) - 1px)` + `:last-child { break-after: auto }` |
| `beforeprint` build 2 lần khi bấm nút Print | Trung bình | `buildPrintRoot` idempotent (teardown trước build) |
| Clone 50 trang × DOM lớn → chậm/tốn RAM | Trung bình | Clone gốc 1 lần rồi `cloneNode` từ đó; đo thời gian build, nếu >1s cân nhắc `MAX_PAGES` cho print |
| `id` trùng lặp giữa các clone | Thấp | Strip `id` khi clone |
| Header/footer mặc định của browser (URL, ngày) in đè | Thấp | Không tắt được bằng CSS — ghi hướng dẫn user bỏ tick trong dialog |
| Ảnh lazy-load chưa render lúc clone | Thấp | Chờ `document.fonts.ready` + kiểm `img.complete` trước khi build |
