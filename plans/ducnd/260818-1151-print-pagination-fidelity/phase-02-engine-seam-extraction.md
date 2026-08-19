---
phase: 2
title: "Engine Seam Extraction"
status: done
priority: P1
dependencies: [1]
effort: "1.5-2d"
---

# Phase 2: Engine Seam Extraction

## Overview

Ba việc theo thứ tự bắt buộc:

- **2a** — Fix bug `pageCount` đếm thiếu và đổi `contentOffsets` sang đo DOM thật.
- **2b** — **SPIKE GATE**: dựng print-root bằng tay, verify trên doc ≥30 trang. Đây là điểm quyết định của cả plan.
- **2c** — Tách seam pure/adapter + fixture test.

Thứ tự này đặt rủi ro kiến trúc lớn nhất ở ngày thứ 2, không phải sau 3.5 ngày.

## ⚠️ Bỏ ràng buộc "zero behavior change"

Phiên bản trước của phase này yêu cầu *"Zero behavior change… engine hiện tại là source of truth"* và liệt một fixture case *"Block cao hơn 1 trang → vòng while đẩy nhiều trang"*. Red team chứng minh điều đó sẽ **hợp thức hoá một bug thành spec**.

`pagination.utils.ts:80-92`:
```ts
if (bottom - pageTop > usable) {
  breaks.push(offset);                                    // push ĐÚNG 1 break
  ...
  while (y > pageTop + usable) pageTop += paperH + PAGE_GAP;   // nhảy N trang
}
```

Vòng `while` đẩy `pageTop` qua nhiều trang nhưng **không push thêm break**. Nên `pageCount = breaks.length + 1` (`usePagination.ts:47`) **sai** với mọi block cao hơn `usable`: ảnh lớn, bảng dài (bảng vẫn là 1 top-level block cho tới P8), `<pre>` dài.

Hôm nay vô hại — màn hình thiếu nền trang là lỗi thẩm mỹ, còn khi in thì browser tự repaginate nên nội dung ra đủ. **Sau P4 thì thành mất dữ liệu**: `buildPrintRoot` lặp đúng `pageCount` cửa sổ, phần vượt bị `.print-clip { overflow: hidden }` nuốt vĩnh viễn. Và acceptance criteria "N trang màn hình → in N trang" vẫn PASS.

## Requirements

**Functional**
- `pageCount` phản ánh số trang engine thực sự layout, kể cả trang do vòng `while` nhảy qua.
- `contentOffsets` đọc từ vị trí DOM thật, không cộng dồn model.
- Thuật toán trở thành hàm thuần, test được không cần DOM.

**Non-functional**
- `noUncheckedIndexedAccess: true` (`tsconfig.base.json:17`) → mọi `blocks[i]`, `contentOffsets[i]` là `T | undefined`, phải xử lý tường minh.

## Architecture

### 2a — Sửa nguồn sự thật của page count

```ts
export interface PageBreaks {
  breaks: number[];
  spacers: number[];
  forced: boolean[];
  contentOffsets: number[];   // MỚI — 1 entry MỖI TRANG, kể cả trang while nhảy qua
}
```

**`pageCount = contentOffsets.length`**, không phải `breaks.length + 1`. Vòng `while` phải push một entry vào `contentOffsets` mỗi lần nhảy.

Bỏ invariant `contentOffsets.length === breaks.length + 1` — nó không đúng và red team dùng chính nó làm bằng chứng mâu thuẫn nội tại.

`usePagination.ts:47` đổi sang `setPageCount(result.contentOffsets.length)`.

### 2a — `contentOffsets` phải đo thật, không cộng dồn model

`pageTop` được cộng dồn từ `el.offsetHeight` — **số nguyên đã làm tròn** (`pagination.utils.ts:56`) — trong khi layout thật là số thực (`line-height: 1.15`, `font-size: 11pt` cho chiều cao phân số gần như chắc chắn). Sai số **không phải hằng số, nó tích luỹ**: doc 50 trang × ~30 block/trang = 1500 block × ±0.5px → drift tới trang cuối có thể vài chục px = 2-3 dòng.

Đây là lý do bước "thực nghiệm hệ quy chiếu" của phiên bản trước sẽ cho kết luận sai — làm trên doc 2-3 trang thì không thấy gì.

Fix: sau khi decoration render, đọc `contentOffsets[i]` từ `nodeDOM(breaks[i]).offsetTop` thật, relative tới `view.dom`. Cho các trang do `while` nhảy qua thì nội suy từ `offsetTop` của block đó cộng bội số `paperH + PAGE_GAP`.

### 2b — SPIKE GATE

Mục tiêu: chứng minh sliding-window giữ được offset chính xác trên doc dài, **trước khi** tiêu effort cho seam/model/UI.

Dựng bằng tay (không cần abstraction, code vứt đi):

```html
<div id="print-root">
  <div class="print-page">                        <!-- mm units, margin/padding = 0 -->
    <div class="page-viewport is-paged">          <!-- BẮT BUỘC: giữ cascade -->
      <div class="print-clip">                    <!-- chỉ overflow:hidden + height -->
        <div class="print-content" style="top:-{offset}px">CLONE</div>
      </div>
    </div>
  </div>
</div>
```

Checklist gate (**tất cả** phải pass):
- [ ] `clone.scrollHeight === editor.view.dom.scrollHeight` — một assert này bắt trọn class bug cascade
- [ ] `getComputedStyle(clone).paddingLeft === getComputedStyle(view.dom).paddingLeft`
- [ ] Doc **40 trang** (fixture từ P1): marker `[[N]]` liền mạch, đủ, không trùng
- [ ] Trang cuối lệch dọc **< 1px** so với kỳ vọng
- [ ] **A4 portrait VÀ A4 landscape** đều pass — landscape có failure mode riêng (margin lạc trong ancestor chain), portrait pass không chứng minh được gì cho landscape
- [ ] Doc có 1 ảnh cao 3 trang: không mất nội dung

**Gate fail → DỪNG, báo user, bàn lại kiến trúc.** Không đi tiếp 2c.

### 2c — Seam

```ts
export interface BlockMeasurement {
  type: string;
  offset: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  domTop: number;        // offsetTop thật, cho contentOffsets
}

export const computeBreaksFromMeasurements = (
  blocks: BlockMeasurement[],
  metrics: PageMetrics,
): PageBreaks => { /* pure */ };

export const computePageBreaks = (view: EditorView, setup: PageSetup): PageBreaks => {
  const root = view.dom as HTMLElement;
  if (!root.offsetHeight) return EMPTY_BREAKS;
  return computeBreaksFromMeasurements(measureBlocks(view), computeMetrics(setup));
};
```

### 2c — `runPagination` phải trả kết quả

`beforeprint` là handler **đồng bộ**; React state setter là bất đồng bộ. P4 không thể đọc `pageCount`/`contentOffsets` từ React state.

```ts
const runPagination = (): PageBreaks | null => { ... };          // đổi từ void
const schedulePagination = (immediate?: boolean): PageBreaks | null => { ... };
```

Thêm `latestBreaksRef` để P4 đọc đồng bộ. Repo đã có tiền lệ đúng pattern này: `rafRef`, `lastBreaksRef`, `activeDocRef` (`usePagination.ts:22-24`).

Lưu ý: `schedulePagination(true)` hiện **không đảm bảo chạy đồng bộ** — nếu `view.composing` thì tự re-schedule rAF rồi return (`usePagination.ts:33-36`). Trả `null` trong trường hợp đó để P4 biết mà abort.

## Related Code Files

- Modify: `apps/docs/src/modules/editor/utils/pagination.utils.ts`
- Modify: `apps/docs/src/modules/editor/hooks/usePagination.ts` — `pageCount` từ `contentOffsets.length`, `runPagination` return, `latestBreaksRef`
- Create: `apps/docs/src/modules/editor/utils/pagination.utils.test.ts`
- Create: `apps/docs/src/modules/editor/utils/__fixtures__/pagination-cases.ts`
- Delete: `apps/docs/src/smoke.test.ts` (từ P1)

## Implementation Steps

**2a — fix bug (test-first):**

1. Fixture: block cao 3 trang → `contentOffsets.length === 4`. Chạy → fail.
2. Fixture: `MAX_PAGES` — engine dừng push break ở 49 nhưng document vẫn chảy; `contentOffsets` phản ánh đúng số trang đã layout.
3. Sửa vòng `while` push `contentOffsets`; `pageCount = contentOffsets.length`; bỏ invariant cũ.
4. Đổi `contentOffsets` sang đọc `offsetTop` thật.
5. Verify browser: doc có ảnh cao 3 trang → `.page-stack` render đủ 4 nền trang (hôm nay thiếu 2).

**2b — SPIKE GATE:** chạy checklist trên. Fail → dừng.

**2c — seam (test-first):**

6. Fixture cho các case P7 **sẽ giữ nguyên**: doc rỗng; vừa đúng 1 trang; tràn 1px; margin collapse (`gap = max(prevMb, mt)`); block đầu tiên không collapse; forced `pageBreak`; 2 `pageBreak` liên tiếp; `pageBreak` ở block đầu (`spacers[0] === 0`); chạm `MAX_PAGES`.
   **Không** khoá case "block cao hơn 1 trang" bằng hành vi cũ — P7 sẽ đổi nó.
7. Chạy fixture trên code hiện tại (qua adapter với measurement giả) để xác nhận fixture phản ánh hành vi thật. Case nào lệch → điều tra xem là bug hay là hiểu sai, **không** mặc định sửa fixture theo code.
8. Tách `computeBreaksFromMeasurements` và `measureBlocks`, di chuyển logic nguyên văn.
9. `runPagination` return `PageBreaks`; thêm `latestBreaksRef`.
10. Chạy `pnpm test` + `pnpm typecheck` (chú ý `noUncheckedIndexedAccess`).
11. `scripts/print-check.mjs` + browser: paged view không đổi ngoài phần page count đã fix.

## Success Criteria

- [ ] Doc có block cao 3 trang: `.page-stack` render đủ số nền trang (hôm nay thiếu)
- [ ] `contentOffsets.length === pageCount` cho mọi fixture
- [ ] `contentOffsets[i]` khớp `offsetTop` thật, lệch < 1px trên doc 40 trang
- [ ] **Spike gate 2b pass toàn bộ checklist, cả portrait lẫn landscape**
- [ ] Fixture ≥9 case xanh
- [ ] `computeBreaksFromMeasurements` không tham chiếu `document` / `window` / `getComputedStyle`
- [ ] `runPagination` trả `PageBreaks | null`; `null` khi `composing`
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro | Mức | Mitigation |
|---|---|---|
| Spike gate fail → kiến trúc sliding-window không dùng được | **Cao** | Đó chính là mục đích của gate — fail sớm ở ngày 2 rẻ hơn ngày 5. Dừng và bàn lại |
| Drift `offsetHeight` vẫn còn sau khi đổi sang `offsetTop` | Cao | Verify trên doc 40 trang, không phải 2-3 trang; ngưỡng < 1px |
| Fix `pageCount` làm đổi `--stack-h` → layout màn hình nhảy | Trung bình | Đây là fix đúng (hôm nay đang thiếu nền trang); verify bằng mắt |
| Fixture viết theo hành vi mình *nghĩ* | Trung bình | Bước 7 chạy trên code cũ trước, nhưng điều tra chênh lệch thay vì mặc định chiều code |
| `noUncheckedIndexedAccess` làm pure function rườm rà | Thấp | Dùng `at()` hoặc destructure có default; không tắt flag |
