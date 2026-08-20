---
phase: 8
title: 'Table Row Split'
status: done
priority: P3
dependencies: [7]
effort: 'spike 0.5d + 1.5-2d'
---

# Phase 8: Table Row Split

## Overview

Bảng dài hơn một trang cắt ở ranh giới **row** thay vì nhảy nguyên khối. **Spike-gated** — kỹ thuật chưa được chứng minh khả thi.

## Vì sao phase này cấp bách hơn tưởng

Cho tới hết P7, **bảng vẫn là một top-level block** (`pagination.utils.ts:62` `doc.forEach` chỉ duyệt top-level). Hai hệ quả từ red team:

1. **P2 phải đã fix `pageCount`** — bảng cao 3 trang rơi vào vòng `while` ở `pagination.utils.ts:85`. Nếu P2 chưa fix thì bảng dài bị **mất nội dung khi in** ngay từ P4. Đây là lý do fix đó nằm ở P2a chứ không đợi tới đây.
2. **P7 có failure mode hiệu năng vì bảng** — một bảng 50 trang là một block cắt ngang 49 ranh giới, mỗi lần đo lại toàn bộ line box. P7 đã có trần cứng + benchmark cho case này.

Nghĩa là bảng dài đã được xử lý ở mức "không mất dữ liệu, không lag" trước khi tới đây. Phase này chỉ nâng **chất lượng ngắt trang**.

## Vì sao cần spike

Cơ chế spacer của P2 và inline widget của P7 đều **không dùng được** giữa 2 `<tr>`:

- `Decoration.widget` tại vị trí giữa 2 row → ProseMirror render widget ra ngoài `<tbody>`, hoặc trình duyệt tự đẩy nó ra khỏi table (HTML table không cho `<div>` giữa các `<tr>`).
- Widget dạng `<tr>` giả → phá cấu trúc column, và ProseMirror không cho widget kiểu đó ở vị trí ấy.

**Không code trước khi spike xác nhận.**

## Spike (gate)

**Timebox 0.5 ngày.** Mục tiêu: đẩy được row xuống trang sau mà không phá layout/editing.

Thử theo thứ tự, dừng ở cái đầu tiên chạy được:

**A — `Decoration.node` với `padding-top` trên row đầu trang mới**

```ts
Decoration.node(rowStart, rowEnd, { style: `padding-top: ${spacer}px` });
```

Rủi ro: `padding` trên `<tr>` bị nhiều engine bỏ qua. Có thể phải áp lên từng `<td>`.

**B — `border-top: {spacer}px solid transparent` trên các `<td>` của row**
Border tính vào layout ổn định hơn padding trên `<tr>`. Kiểm `box-sizing`.

**C — `transform: translateY` trên `<tbody>` phần sau**
Loại gần chắc: transform không đẩy layout, chỉ dời hình ảnh → engine đo sai.

**D — CSS `break-inside: auto` trên table**
Không dùng được: màn hình cần spacer thật để đẩy, không chỉ break hint.

**Tiêu chí pass:**

- Row đẩy xuống đúng vị trí trang sau, sai số < 2px
- Column width không đổi
- Click vào cell vẫn đặt caret đúng chỗ
- **Resize column vẫn hoạt động** (`@tiptap/extension-table` có column resizing)
- Cell selection / merge cell không vỡ
- `print-check.mjs`: marker liền mạch

**Spike fail** → dừng phase, ghi limitation vào `docs/`, giữ hành vi hiện tại (bảng dài nhảy nguyên trang — nhưng **không mất nội dung** nhờ fix P2a). Báo user trước khi bỏ.

## Requirements (nếu spike pass)

**Functional**

- Bảng dài cắt ở ranh giới row, không mất row.
- Row cao hơn cả trang → xử như block-level (không cắt giữa cell).
- Header row **không** lặp ở trang sau — Google Docs mặc định cũng không. Ngoài scope.

**Non-functional**

- Không phá column resize, cell selection, merge cell.
- `noUncheckedIndexedAccess` → `rows[i]` là `T | undefined`.

## Architecture (nếu spike pass)

`measureBlocks`: gặp node `table` thì duyệt xuống `tableRow`, trả `rows?: RowMeasurement[]` tương tự `lines` của P7.

```ts
interface RowMeasurement {
  offset: number;
  height: number;
  domTop: number;
}
```

`domTop` đọc từ `offsetTop` thật — cùng lý do với `contentOffsets` ở P2: cộng dồn height làm tròn sẽ drift qua nhiều row.

`computeBreaksFromMeasurements` xử `rows` cùng cơ chế với `lines` — vẫn pure, vẫn test được bằng fixture.

Decoration dùng cơ chế thắng spike. Nhớ map qua `tr.mapping` trong `apply` (đã fix ở P7 bước 1).

## Related Code Files

- Create: `plans/ducnd/260818-1151-print-pagination-fidelity/reports/spike-table-row-split-findings.md`
- Modify: `apps/docs/src/modules/editor/utils/pagination.utils.ts`
- Modify: `apps/docs/src/modules/editor/utils/pagination.utils.test.ts`
- Modify: `apps/docs/src/modules/editor/utils/__fixtures__/pagination-cases.ts`
- Modify: `apps/docs/src/assets/styles/styles.css`
- Modify: `docs/` — ghi limitation nếu spike fail

## Implementation Steps

1. **Spike** theo mục trên. Ghi kết quả vào report, kể cả khi fail.
2. **Gate**: fail → dừng, báo user, ghi limitation. Pass → tiếp.
3. Fixture test: bảng 2 row vừa trang; bảng 20 row tràn 3 trang; row cao hơn 1 trang; bảng ngay đầu trang; bảng sau paragraph tràn; bảng có `rowspan` bắc qua điểm ngắt.
4. Mở rộng `measureBlocks` duyệt `tableRow`, đọc `offsetTop` thật.
5. Cập nhật thuật toán pure xử `rows`.
6. Áp decoration theo cơ chế thắng spike.
7. Verify browser: bảng 50 row — không mất row, column width giữ nguyên, **resize column còn chạy**, caret trong cell trang 2+ đúng.
8. `print-check.mjs` marker liền mạch.

## Success Criteria

- [ ] Spike có kết luận rõ ràng, ghi vào report (pass hoặc fail)
- [ ] (Pass) Bảng 50 row trải nhiều trang, không mất row
- [ ] (Pass) Column width không đổi khi bảng bị cắt
- [ ] (Pass) Resize column vẫn hoạt động
- [ ] (Pass) Đặt caret trong cell ở trang 2+ đúng vị trí
- [ ] (Pass) `rowspan` bắc qua điểm ngắt không vỡ
- [ ] (Pass) `print-check.mjs` marker liền mạch
- [ ] (Fail) Limitation ghi vào `docs/`, hành vi cũ giữ nguyên, user được báo
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro                                          | Mức        | Mitigation                                                                |
| ----------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| Không cơ chế nào đẩy được row                   | **Cao**    | Spike gate 0.5d timebox; fallback giữ hành vi cũ (đã an toàn nhờ fix P2a) |
| Decoration phá column resize                    | Cao        | Tiêu chí spike bắt buộc kiểm resize                                       |
| `padding`/`border` trên `<tr>` bị engine bỏ qua | Cao        | Ứng viên B áp lên `<td>`                                                  |
| Merge cell (`rowspan`) bắc qua điểm ngắt        | Trung bình | Không cắt tại row có `rowspan` bắc qua; đẩy cả cụm. Fixture case riêng    |
| Sai số tích luỹ qua nhiều row                   | Trung bình | Đọc `offsetTop` thật, không cộng dồn height                               |
