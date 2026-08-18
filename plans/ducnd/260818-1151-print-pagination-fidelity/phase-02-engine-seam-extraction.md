---
phase: 2
title: "Engine Seam Extraction"
status: pending
priority: P1
dependencies: [1]
effort: "0.5-1d"
---

# Phase 2: Engine Seam Extraction

## Overview

Tách `computePageBreaks` thành **pure algorithm** + **DOM measurement adapter**. Test-first: khoá toàn bộ hành vi block-level hiện tại bằng fixture trước khi P7 rewrite. Refactor thuần, **không đổi hành vi**.

## Requirements

**Functional**
- `computePageBreaks(view, setup)` giữ nguyên signature và output y hệt hiện tại.
- Thuật toán trở thành hàm thuần, test được không cần DOM.
- Bổ sung `contentOffsets: number[]` vào `PageBreaks` — P4 cần để dựng sliding-window.

**Non-functional**
- Zero behavior change. Nếu test cũ/mới bất đồng, engine hiện tại là source of truth.

## Architecture

### Seam

```ts
// pagination.utils.ts — pure, không chạm DOM
export interface BlockMeasurement {
  type: string;          // node.type.name
  offset: number;        // vị trí ProseMirror
  height: number;
  marginTop: number;
  marginBottom: number;
}

export interface PageBreaks {
  breaks: number[];
  spacers: number[];
  forced: boolean[];
  contentOffsets: number[];   // MỚI — Y offset trong .ProseMirror nơi mỗi trang bắt đầu
}

export const computeBreaksFromMeasurements = (
  blocks: BlockMeasurement[],
  metrics: PageMetrics,
): PageBreaks => { /* logic hiện tại, nguyên văn */ };

// adapter mỏng — phần duy nhất chạm DOM
export const computePageBreaks = (view: EditorView, setup: PageSetup): PageBreaks => {
  const root = view.dom as HTMLElement;
  if (!root.offsetHeight) return EMPTY_BREAKS;
  const blocks = measureBlocks(view);          // doc.forEach + readBox
  return computeBreaksFromMeasurements(blocks, computeMetrics(setup));
};
```

`measureBlocks` giữ nguyên `readBox` hiện có (`offsetHeight`, `getComputedStyle` marginTop/marginBottom) và guard `MAX_PAGES`.

### contentOffsets

Engine hiện tính `pageTop` theo hệ toạ độ có `paperH + PAGE_GAP` giữa các trang. `contentOffsets[i]` = giá trị `pageTop` tại thời điểm bắt đầu trang `i`, tức Y offset trong `.ProseMirror` (đã tính cả spacer) nơi vùng nội dung trang `i` bắt đầu.

`contentOffsets[0] = 0`. Trang `i` hiển thị dải `[contentOffsets[i], contentOffsets[i] + usable)`.

**Cần verify bằng thực nghiệm ở P4**: `.doc-editor` khi paged có `padding-top: var(--margin-t)`, nên offset thực trong element có thể lệch đúng `marginT`. Ghi rõ hệ quy chiếu trong JSDoc để P4 không đoán.

## Related Code Files

- Modify: `apps/docs/src/modules/editor/utils/pagination.utils.ts` — tách seam, thêm `contentOffsets`
- Create: `apps/docs/src/modules/editor/utils/pagination.utils.test.ts`
- Create: `apps/docs/src/modules/editor/utils/__fixtures__/pagination-cases.ts`
- Modify: `apps/docs/src/modules/editor/hooks/usePagination.ts` — nhận & lưu `contentOffsets`
- Delete: `apps/docs/src/smoke.test.ts` (từ P1)

## Implementation Steps

**Tests trước:**

1. Viết fixture `BlockMeasurement[]` cho các case:
   - Doc rỗng → 0 break, 1 trang
   - Vừa đúng 1 trang (tổng height == usable) → 0 break
   - Tràn 1px → 1 break
   - Nhiều block, break tự nhiên nhiều trang
   - Margin collapse: `gap = max(prevMarginBottom, marginTop)` khi có block trước
   - Block đầu tiên: `gap = marginTop` (không collapse)
   - Forced `pageBreak` node → `forced[i] === true`, `spacers[i]` đúng
   - Hai `pageBreak` liên tiếp → 2 trang, trang giữa rỗng
   - `pageBreak` ở block đầu tiên (`hasPrev === false`) → `spacers[0] === 0`
   - Block cao hơn 1 trang → vòng `while (y > pageTop + usable)` đẩy nhiều trang
   - Chạm `MAX_PAGES` → dừng ở `MAX_PAGES - 1` break
2. Chạy test trên **code hiện tại** (gọi qua adapter với measurement giả) → xác nhận fixture phản ánh đúng hành vi thật, không phải hành vi mình tưởng. Case nào lệch thì sửa fixture theo code, **không sửa code theo fixture**.
3. Thêm assertion cho `contentOffsets` (đang fail vì chưa có).

**Rồi mới refactor:**

4. Tách `computeBreaksFromMeasurements` ra khỏi `computePageBreaks`, di chuyển logic nguyên văn.
5. Tách `measureBlocks(view)` gom `doc.forEach` + `readBox`.
6. Thêm `contentOffsets` vào return, cập nhật `EMPTY_BREAKS` và `paginationPlugin` state init.
7. `usePagination.ts`: lưu `contentOffsets` vào state để P4 dùng; giữ nguyên logic so sánh `breaks` để quyết định dispatch.
8. Chạy lại toàn bộ test → xanh.
9. Chạy `scripts/print-check.mjs` + mở browser xác nhận paged view không đổi gì.

## Success Criteria

- [ ] Toàn bộ test ở bước 1 xanh, ≥11 case
- [ ] `computeBreaksFromMeasurements` không tham chiếu `document`, `window`, `getComputedStyle`
- [ ] `contentOffsets.length === breaks.length + 1`
- [ ] Paged view trên browser: số trang và vị trí ngắt **không đổi** so với trước refactor
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Fixture viết theo hành vi mình *nghĩ*, không phải hành vi thật | Bước 2 bắt buộc: chạy fixture trên code cũ trước khi refactor |
| `contentOffsets` sai hệ quy chiếu (lệch `marginT`) | JSDoc ghi rõ hệ quy chiếu; P4 verify bằng browser thật trước khi build tiếp |
| Refactor vô tình đổi thứ tự đọc DOM → khác kết quả | Di chuyển logic nguyên văn, không "dọn dẹp" trong cùng bước |
