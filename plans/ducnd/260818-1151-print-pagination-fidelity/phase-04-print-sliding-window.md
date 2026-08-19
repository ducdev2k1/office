---
phase: 4
title: "Print Sliding-Window"
status: done
priority: P1
dependencies: [3]
effort: "1.5-2d"
---

# Phase 4: Print Sliding-Window

## Overview

Thay cơ chế in hiện tại (browser tự repaginate) bằng DOM in dựng sẵn: mỗi trang là cửa sổ clip nhìn vào cùng DOM đã render, offset theo `contentOffsets` từ P2.

Kiến trúc đã được **spike gate ở P2b verify** trước khi vào phase này. Nếu 2b fail thì phase này không chạy.

## Requirements

**Functional**
- Doc N trang paged view → in ra đúng N trang, **không mất nội dung**.
- Header/footer + số trang trong vùng lề mỗi trang.
- Hoạt động cả nút Print lẫn `Ctrl+P`.
- `viewMode !== 'paged'` **hoặc** `isOverLimit` **hoặc** build fail → fallback đường in cũ, **không bao giờ ra trang trắng**.

**Non-functional**
- Không trang trắng thừa, cả portrait lẫn landscape.
- Dọn sạch `#print-root` sau khi in, kể cả khi user huỷ dialog hoặc build throw.
- `buildPrintRoot` dưới ngưỡng thời gian đã đo cho doc 50 trang.

## Architecture

### Cấu trúc DOM — LƯU Ý cascade

```html
<div id="print-root">
  <div class="print-page">                          <!-- mm units, margin/padding = 0 -->
    <div class="print-hf print-header">
      <span></span><span></span><span></span>
    </div>
    <div class="page-viewport is-paged">            <!-- BẮT BUỘC — xem dưới -->
      <div class="print-clip">
        <div class="print-content" style="top:-{contentOffsets[i]}px">CLONE</div>
      </div>
    </div>
    <div class="print-hf print-footer">…</div>
  </div>
</div>
```

**Wrapper `.page-viewport.is-paged` là bắt buộc, không phải trang trí.** `view.dom` mang `class="doc-editor ProseMirror"` (`useDocsEditor.ts:56`), nhưng layout paged đến từ rule **ancestor-scoped** `.is-paged .doc-editor` (`styles.css:171-179`). Class `is-paged` nằm trên `.page-viewport` bên trong `#root` (`EditorCanvas.tsx:121`). Clone đặt vào `#print-root` — sibling của `#root` — sẽ mất ancestor đó và rơi về rule base `.doc-editor` (`styles.css:155-169`).

Số cụ thể, A4 lề 15mm, `mmToPx(15) = 57`, `mmToPx(210) = 794`:
- Màn hình: `794 − 57 − 57 = 680px`
- Clone không wrapper: `794 − 82 − 82 − 2px border = 628px` → **hẹp hơn 7.6%**

Mọi paragraph rewrap → clone cao hơn engine đo → mỗi cửa sổ cắt giữa paragraph. Đây chính xác là bug phase này sinh ra để diệt.

Kèm theo nếu thiếu wrapper: lấy lại `border: 1px`, `box-shadow`, `min-height: calc(var(--paper-h) + 48px)`, và `.is-paged [data-type='page-break'] { display: none }` (`styles.css:181-183`) mất tác dụng → mỗi page-break node bung `margin: 24px 0` + gạch xanh + nhãn `'Page break'`.

### Dark theme

`.dark` nằm trên `document.documentElement` (`useTheme.ts:11`) nên clone trong `#print-root` **vẫn match** `.dark .doc-editor` (`styles.css:459`). Bước xoá rule print cũ (`styles.css:441-443` đang ép `background:#fff; color:#202124`) sẽ khiến user theme tối in ra nền tối.

Fix: `#print-root` force light palette tường minh.

### `.page-break-marker` phải xử lý

Forced break gán class `page-break-marker` chứ không phải `page-break-spacer` (`pagination.utils.ts:119`). Class này có `border-top: 2px dashed #1a73e8` + `::after { content: 'Page break' }` (`styles.css:189-205`). Hôm nay vô hại vì print block ẩn nó (`styles.css:403-405`); phase này viết lại print block nên phải xử lý lại.

Marker nằm ở **đầu** vùng nội dung trang mới nên lọt vào trong `.print-clip`, không bị cắt.

Fix: `#print-root .page-break-marker { border: 0 } #print-root .page-break-marker::after { content: none }`.

### CSS — đơn vị mm, zero margin

```css
#print-root { display: none; margin: 0; padding: 0; }

@media print {
  body.printing #root { display: none !important; }
  body.printing #print-root { display: block !important; }

  .print-page {
    position: relative;
    margin: 0; padding: 0;
    width: var(--paper-w-mm);      /* mm, khớp @page size */
    height: var(--paper-h-mm);
    overflow: hidden;
    break-after: page;
    page-break-after: always;
  }
  .print-page:last-child { break-after: auto; page-break-after: auto; }

  .print-clip { position: relative; height: var(--usable); overflow: hidden; }
  .print-content { position: absolute; left: 0; right: 0; }
}
```

**Ba điểm rút từ thực nghiệm CDP của red team:**

1. **Đơn vị mm, không px.** `mmToPx` làm tròn về pixel nguyên nên `--paper-w/h` lệch khỏi box `@page` tới 0.5px mỗi trục. Viết `.print-page` bằng đúng mm như `@page size`.
2. **Zero margin tường minh.** Trang trắng thừa ở **landscape** không do rounding — nguyên nhân thật là **margin lạc trong ancestor chain**. Thực nghiệm: A4 landscape với `body { margin: 8px }` → 4 trang cho 3 div; giảm width 1px **không** fix, zero body margin thì fix. Không dựa ngầm vào Tailwind preflight.
3. **`body.printing` gate, không `#root { display:none }` vô điều kiện.** Builder toggle class **sau khi** build thành công; gỡ trong `finally` + `afterprint`. Nếu không, continuous view / build throw / `editor === null` sẽ cho ra **trang trắng không cảnh báo**.

`.print-clip` **không** set `left/right = margin` — clone đã tự có padding lề từ `.is-paged .doc-editor`. Set thêm sẽ áp lề hai lần.

### Hook — đọc breaks đồng bộ, không qua React state

`beforeprint` là handler **đồng bộ**. `runPagination` cập nhật qua `setPageCount` (React state, bất đồng bộ) → `usePrintDocument` đọc closure của render **trước**.

```ts
export const usePrintDocument = (
  editor: Editor | null,
  activeDoc: DocRecord | undefined,
  pagination: PaginationState,
) => {
  const buildOrBail = (): boolean => {
    if (!editor || editor.isDestroyed) return false;
    if (pagination.viewMode !== 'paged') return false;
    if (editor.view.composing) return false;              // không ép ngắt IME
    const breaks = pagination.computeNow();               // P2c: trả PageBreaks | null
    if (!breaks) return false;
    if (breaks.contentOffsets.length >= MAX_PAGES) return false;   // quyết định đã chốt
    try { buildPrintRoot(breaks); document.body.classList.add('printing'); return true; }
    catch { teardownPrintRoot(); return false; }
  };

  const printDocument = async () => {
    await document.fonts.ready;      // CHỈ được await ở đường này
    buildOrBail();
    window.print();
  };
  // beforeprint → buildOrBail()   (không await được gì)
  // afterprint  → teardown + remove class  (trong finally)
  return { printDocument };
};
```

`document.fonts.ready` là Promise — **không await được trong `beforeprint`**. Chỉ dùng ở đường nút Print. `usePagination.ts:97-100` đã dùng đúng pattern này (ngoài handler).

**Idempotent guard bắt buộc.** Thực nghiệm red team: build eager + build trong `beforeprint` → **6 trang cho doc 3 trang**. `buildPrintRoot` phải teardown trước khi build.

### Doc vượt `MAX_PAGES` — quyết định đã chốt

`isOverLimit === true` → **không dựng print-root**, để browser repaginate như hôm nay. Số trang có thể lệch nhưng **không mất nội dung**. Đây là lý do phải giữ nguyên rule `.doc-editor` trong print block cho đường fallback, không xoá.

### Chi phí clone

`plan.md` phiên bản trước ghi mitigation *"Clone 1 lần, dùng chung qua CSS"* — **bất khả thi**: mỗi `.print-page` cần `top` khác nhau nên phải có DOM subtree riêng. Chi phí thật là `pageCount × toàn bộ DOM`.

Doc 50 trang + ảnh data-URL 1MB (`image.utils.ts` cho phép) → 250 lần decode bitmap, **đồng bộ trong `beforeprint`**. Phải đo và đặt ngưỡng cứng, không để dạng "cân nhắc".

## Related Code Files

- Create: `apps/docs/src/modules/editor/print/print-document.utils.ts`
- Create: `apps/docs/src/modules/editor/print/use-print-document.ts`
- Delete: `apps/docs/src/modules/editor/hooks/usePrintSetup.ts`
- Modify: `apps/docs/src/modules/editor/index.ts:12` — barrel đang export `usePrintSetup`, phải cập nhật
- Modify: `apps/docs/src/pages/EditorPage.tsx` — `:124` dùng `usePrintSetup`; `onPrint` ở `:167` và `:188`
- Modify: `apps/docs/src/assets/styles/styles.css` — viết lại `@media print` (~`:386`), **giữ** rule `.doc-editor` cho đường fallback
- Modify: `apps/docs/index.html` — thêm `<div id="print-root"></div>` cạnh `#root`

## Implementation Steps

1. Thêm `#print-root` vào `index.html`.
2. `buildPrintRoot(breaks, setup, docTitle)`:
   - Teardown trước (idempotent)
   - `const base = editor.view.dom.cloneNode(true) as HTMLElement`; strip `id`, `contentEditable`
   - **Assert** `base.scrollHeight === editor.view.dom.scrollHeight` → mismatch thì throw (bắt trọn class bug cascade)
   - Set CSS vars mm + `--usable` lên `#print-root`
   - Mỗi `i` trong `[0, contentOffsets.length)`: `.print-page` → `.print-hf` (từ `resolveSlot`) + `.page-viewport.is-paged > .print-clip > .print-content` với clone riêng
   - Normalize `.page-break-marker` trong clone
3. `teardownPrintRoot()` — xoá con của `#print-root`, gỡ `body.printing`.
4. `use-print-document.ts` theo sketch trên. `beforeprint`/`afterprint` + `printDocument()`.
5. Viết lại `@media print`: thêm nhánh `body.printing`, **giữ nguyên** nhánh cũ cho fallback.
6. Cập nhật barrel `modules/editor/index.ts:12`, wire `EditorPage.tsx` (`:124`, `:167`, `:188`).
7. Xoá `usePrintSetup.ts`, chuyển logic `@page` sang hook mới.
8. Đo `buildPrintRoot` wall time: doc 50 trang + 20 ảnh. Ghi ngưỡng vào AC.
   **Sau bước này mới quyết có nâng `MAX_PAGES` trên 50 hay không** — validation chốt giữ 50 tới khi có số đo thật. Ghi kết quả đo vào `plan.md` Open questions.
   <!-- Updated: Validation Session 1 - MAX_PAGES giữ 50, quyết sau khi đo ở bước này -->
9. Verify bằng `scripts/print-check.mjs`: 1 / 3 / 12 / 40 trang × A4 portrait + A4 landscape + A5 + Letter.
10. Verify các đường fallback: continuous view, `isOverLimit`, `editor === null`, build throw (inject lỗi tay).

## Success Criteria

- [ ] `print-check.mjs`: marker `[[N]]` liền mạch, đủ, không trùng — cho 1/3/12/40 trang
- [ ] Khớp với A4 portrait **và A4 landscape** và A5 và Letter
- [ ] Doc có block cao 3 trang: không mất nội dung
- [ ] Không trang trắng ở cuối, cả portrait lẫn landscape
- [ ] `Ctrl+P` và nút Print cho kết quả giống nhau
- [ ] Bấm Print 2 lần liên tiếp → không nhân đôi trang
- [ ] Huỷ dialog → `#print-root` rỗng, `body.printing` đã gỡ
- [ ] **Không bao giờ in ra trang trắng**: continuous view / `isOverLimit` / `editor===null` / build throw đều fallback đường in cũ và in ra nội dung
- [ ] Doc > 50 trang: in đủ nội dung qua đường fallback
- [ ] Doc có forced page break: bản in **không** chứa chữ "Page break"
- [ ] Theme tối: bản in nền trắng chữ đen
- [ ] `buildPrintRoot` doc 50 trang + 20 ảnh dưới ngưỡng đã đo
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro | Mức | Mitigation |
|---|---|---|
| Clone mất cascade `.is-paged` → wrap lệch | **Cao** | Wrapper `.page-viewport.is-paged` + assert `scrollHeight` bằng nhau trước khi dựng |
| Đọc React state cũ trong `beforeprint` | **Cao** | `pagination.computeNow()` trả `PageBreaks` đồng bộ; `composing` → abort |
| N clone đồng bộ → đơ / OOM | **Cao** | Đo wall time ở bước 8, ngưỡng cứng trong AC; abort + fallback nếu vượt |
| In ra trang trắng | **Cao** | `body.printing` chỉ set sau khi build thành công; try/catch + `finally` |
| Trang trắng thừa ở landscape do margin lạc | Trung bình | mm units + zero margin tường minh + `:last-child { break-after: auto }`; test cả 2 hướng |
| `.page-break-marker` in chữ "Page break" | Trung bình | Normalize marker trong clone |
| Theme tối in nền tối | Trung bình | Force light palette trong `#print-root` |
| Header/footer mặc định của browser (URL, ngày) | Thấp | Không tắt được bằng CSS — ghi hướng dẫn user bỏ tick |
| Ảnh chưa render lúc clone | Thấp | `await document.fonts.ready` ở đường nút Print; kiểm `img.complete`; `beforeprint` không await được nên chấp nhận |
