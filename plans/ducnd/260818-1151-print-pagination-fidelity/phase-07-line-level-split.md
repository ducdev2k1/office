---
phase: 7
title: 'Line-Level Split'
status: done
priority: P2
dependencies: [2]
effort: '4-6d'
---

# Phase 7: Line-Level Split

## Overview

Phần rủi ro cao nhất. Nâng engine từ ngắt trang ở ranh giới **top-level block** lên ranh giới **line box** — đoạn văn dài hơn chỗ trống cắt giữa dòng, phần còn lại chảy sang trang sau, giống Google Docs.

Red team phát hiện mitigation IME của bản trước **dựa trên hai API đọc sai**, và plugin hiện tại **chưa bao giờ map decoration position**. Phase này phải sửa cả hai trước khi nói tới line-level.

## ⚠️ Ba sai lầm kỹ thuật của bản trước

### 1. `ignoreSelection` là no-op

Bản trước ghi `ignoreSelection: true` với chú thích _"ProseMirror bỏ qua khi tính selection"_. **Sai.** Doc chính thức: _"selection changes **inside the widget** are ignored, and don't cause ProseMirror to try and re-sync the selection"_ — chỉ có tác dụng khi widget DOM chứa nội dung **editable**. Bản trước đã set `contentEditable = 'false'` nên `ignoreSelection` đóng góp **zero** bảo vệ IME.

Nghĩa là rủi ro "Cao" trong risk table của bản trước **thực chất chưa có mitigation nào**.

### 2. `posAtCoords` trả `{ pos, inside } | null`

Bản trước dùng trực tiếp giá trị trả về như một position. Phải là `view.posAtCoords(coords)?.pos` kèm null check.

### 3. Plugin `apply` không map qua `tr.mapping`

`pagination.utils.ts:102-105`:

```ts
apply(tr, value) {
  const meta = tr.getMeta('paginationBreaks');
  return meta ? (meta as PageBreaks) : value;     // trả nguyên value cũ, KHÔNG map
}
```

Position trong `breaks` không được map khi document thay đổi. Với block-level thì ít lộ vì `runPagination` chạy lại nhanh. Với inline widget giữa paragraph thì **thảm hoạ**.

**Failure scenario cụ thể với IME tiếng Việt:** gõ `dduongwf` giữa paragraph gần biên trang. `runPagination` bail suốt composition (`usePagination.ts:33-36` guard `view.composing`), nên spacer đứng yên ở position cũ trong khi text dịch phải 1..8 vị trí. `decorations(state)` tái tạo widget tại offset stale mỗi lần re-render, thả một `<div>` `display:block` `contenteditable=false` **vào giữa composition range**. Chromium huỷ composition → user mất dấu thanh hoặc cả âm tiết.

**Mitigation thật:**

- Map `breaks` qua `tr.mapping` trong `apply`.
- **Tắt hẳn inline spacer khi `view.composing === true`** — chấp nhận layout hơi nhảy khi gõ, đổi lấy IME không vỡ.
- Bỏ `ignoreSelection` khỏi cột mitigation (giữ hay bỏ trong code đều được, nhưng đừng tính nó là bảo vệ).

## ⚠️ Cost model của bản trước sai

Bản trước ghi _"Mỗi trang có tối đa 1 block giao ranh giới → O(pages). Doc 50 trang = 50 lần đo, không phải 5000."_

Đếm nhầm đơn vị. Mỗi "lần đo" là: TreeWalker toàn bộ text node của block + `getClientRects()` từng text node + `posAtCoords()` **từng line box**.

Trường hợp bệnh lý hoàn toàn hợp lệ: **một tài liệu là một bảng 50 trang**. Bảng là **một** top-level block (`pagination.utils.ts:62` `doc.forEach` chỉ duyệt top-level; table row split mãi P8 và còn spike-gated). Block đó cắt ngang **49** ranh giới → mỗi ranh giới đo lại toàn bộ line box của cả bảng. Tương tự với paragraph dán từ nguồn ngoài dài 40 trang.

Và toàn bộ chạy trong `runPagination` được rAF gọi trên **mỗi transaction** khi gõ (`usePagination.ts:71-77`), không có debounce theo thời gian.

Cost model đúng: **O(Σ số dòng của các block cắt ngang)**.

Mitigation:

- Cache line measurement theo `(nodeKey, width)`, invalidate khi node đổi.
- **Trần cứng**: block có > N dòng → bỏ line-split, fallback block-level.
- Benchmark bắt buộc: "1 bảng 50 trang" và "1 paragraph 40 trang".

## Requirements

**Functional**

- Đoạn văn không vừa chỗ trống → cắt tại ranh giới dòng gần nhất, không mất chữ.
- Đoạn văn dài hơn cả trang → trải nhiều trang.
- Không cắt giữa một dòng.
- Bản in tự động đúng theo — P4 không cần sửa gì (sliding-window không quan tâm break đến từ đâu).

**Non-functional**

- Gõ tiếng Việt (IME) quanh điểm ngắt trang không lỗi caret, không nuốt ký tự, không mất dấu.
- Doc 50 trang không lag rõ rệt. Bảng 50 trang và paragraph 40 trang cũng vậy.
- Fallback an toàn: đo thất bại → block-level cho block đó.
- `noUncheckedIndexedAccess: true` → `lines[i]` là `T | undefined`.

## Architecture

### Đo line box

```ts
interface LineMeasurement { top: number; bottom: number; pos: number }

const measureLines = (view: EditorView, nodeDom: HTMLElement, nodeStart: number): LineMeasurement[]
```

TreeWalker qua text node, `Range` per text node, `getClientRects()` → mỗi rect là một line box. Gom rect theo `top` với **epsilon 1px** (không so bằng tuyệt đối — sai số float).

Map về ProseMirror: `view.posAtCoords({ left: rect.left, top: rect.top + rect.height / 2 })?.pos`, null check.

### Thuật toán

`measureBlocks` (P2) trả thêm `lines?: LineMeasurement[]`, **chỉ đo cho block giao ranh giới trang**:

```
for each block:
  bottom <= pageBottom  → như cũ, không đo line
  bottom >  pageBottom  → đo line box (trừ khi vượt trần cứng)
```

`computeBreaksFromMeasurements` (pure) nhận thêm `lines` → break tại `pos` của dòng đầu tiên vượt ngưỡng. Vẫn test được bằng fixture vì `lines` chỉ là mảng số.

### Decoration

```ts
Decoration.widget(
  pos,
  () => {
    const el = document.createElement('div');
    el.className = 'page-break-spacer-inline';
    el.style.height = `${spacer}px`;
    el.contentEditable = 'false';
    return el;
  },
  { side: -1, key: `inline-break-${pos}:${spacer}` },
);
```

`side: -1` để widget đứng trước vị trí. CSS `.page-break-spacer-inline { display: block; width: 100%; user-select: none; }`.

Và trong plugin `apply`: map `breaks`/`contentOffsets` qua `tr.mapping` thay vì trả nguyên value cũ.

### Fallback — không phải nice-to-have

Kích hoạt block-level khi: `posAtCoords` trả `null`; pos map ra ngoài `[nodeStart, nodeEnd]`; `getClientRects()` rỗng; block vượt trần số dòng; rect chồng lấn bất thường (ảnh/inline-block). Log warning ở DEV.

`posAtCoords` không ổn định ở biên (ligature, RTL, inline-block, ảnh inline). Không có fallback thì engine vỡ trên nội dung thật.

## Related Code Files

- Modify: `apps/docs/src/modules/editor/utils/pagination.utils.ts` — `measureLines`, mở rộng `BlockMeasurement`, **fix `apply` map qua `tr.mapping`**, cache line measurement
- Modify: `apps/docs/src/modules/editor/utils/pagination.utils.test.ts`
- Modify: `apps/docs/src/modules/editor/utils/__fixtures__/pagination-cases.ts`
- Modify: `apps/docs/src/modules/editor/hooks/usePagination.ts` — tắt inline spacer khi `composing`
- Modify: `apps/docs/src/assets/styles/styles.css` — `.page-break-spacer-inline`

## Implementation Steps

**Fix nền trước (trước cả line-level):**

1. Sửa plugin `apply` map `breaks`/`contentOffsets` qua `tr.mapping`. Test: dispatch transaction chèn text trước điểm break → position dịch đúng.
2. Thêm guard tắt inline spacer khi `view.composing`.

**Tests line-level trước:**

3. Fixture `lines`: paragraph vừa khít → không split; tràn 1 dòng → break tại dòng cuối vừa; cao hơn 1 trang → trải 2+ trang; cao hơn 2 trang; 1 dòng nhưng cao hơn `usable` → block-level; `lines` rỗng → fallback; split ngay dòng đầu → đẩy cả block, không tạo spacer 0px; block vượt trần số dòng → fallback.
4. Chạy → fail.

**Implement:**

5. `measureLines` + gom rect theo `top` epsilon 1px.
6. Mở rộng `BlockMeasurement` với `lines?`, chỉ đo khi giao ranh giới và dưới trần.
7. Cache theo `(nodeKey, width)`.
8. Cập nhật thuật toán pure.
9. Inline widget decoration + CSS.
10. Test xanh.

**Verify browser (fixture không đủ):**

11. Paragraph 200 dòng → không mất chữ, không cắt giữa dòng.
12. **GATE — IME tiếng Việt**: caret ngay trước/sau điểm ngắt, gõ `dduongwf`, `xin chào`, dấu thanh, telex và VNI. Caret không nhảy, không nuốt ký tự, không mất dấu.
13. Đặt caret bằng chuột tại spacer → vào text gần nhất, không kẹt.
14. Select-all + copy → không lẫn ký tự lạ từ widget.
15. Undo/redo quanh điểm ngắt.
16. **Benchmark**: doc 50 trang thường; **1 bảng 50 trang**; **1 paragraph 40 trang**. Gõ liên tục 30s, đo frame drop bằng devtools Performance.
17. `scripts/print-check.mjs` — marker liền mạch (không chỉ đếm trang).

## Success Criteria

- [ ] Plugin `apply` map position qua `tr.mapping`; test dispatch transaction xanh
- [ ] Inline spacer tắt khi `view.composing`
- [ ] Fixture line-level ≥8 case xanh
- [ ] Paragraph 200 dòng: không mất chữ, không dòng nào cắt đôi
- [ ] **Gõ tiếng Việt quanh điểm ngắt: caret ổn định, dấu thanh đúng, telex và VNI**
- [ ] Copy toàn văn không lẫn ký tự từ widget
- [ ] Undo/redo quanh điểm ngắt không hỏng document
- [ ] Doc 50 trang thường: gõ không lag rõ rệt
- [ ] **1 bảng 50 trang và 1 paragraph 40 trang: gõ không lag rõ rệt** (hoặc fallback trần cứng kích hoạt)
- [ ] `print-check.mjs` marker liền mạch
- [ ] Fallback kích hoạt đúng khi `posAtCoords` trả `null`
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro                                             | Mức        | Mitigation                                                                                                                                               |
| -------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inline widget phá caret / IME tiếng Việt           | **Cao**    | Map `tr.mapping` + tắt spacer khi `composing`. **KHÔNG** tính `ignoreSelection` là mitigation — nó là no-op khi `contentEditable=false`. Bước 12 là gate |
| Decoration position stale khi document đổi         | **Cao**    | Fix `apply` ở bước 1, trước cả line-level                                                                                                                |
| `posAtCoords` không ổn định ở biên                 | **Cao**    | `?.pos` + null check + fallback block-level                                                                                                              |
| Hiệu năng: 1 block cắt ngang nhiều ranh giới       | **Cao**    | Cost model đúng là O(Σ dòng block cắt ngang). Cache + trần cứng + benchmark bảng 50 trang                                                                |
| Vòng lặp reflow: chèn spacer → layout đổi → đo lại | Cao        | rAF debounce sẵn có + so `breaks` trước khi dispatch + guard đếm vòng, dừng sau 3 lần không hội tụ                                                       |
| Rect gom sai dòng do sai số float                  | Trung bình | Epsilon 1px                                                                                                                                              |
| Ảnh/inline-block làm rect bất thường               | Trung bình | Fallback block-level khi phát hiện rect chồng lấn                                                                                                        |

**Gate:** bước 12 (IME tiếng Việt) fail và không fix được trong 1 ngày → **dừng P7**, giữ block-level, báo user. Ngắt trang xấu hơn Google Docs vẫn tốt hơn editor gõ tiếng Việt bị lỗi.
