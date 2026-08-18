---
title: "Print fidelity & page numbering (apps/docs)"
description: "Hợp nhất 2 engine phân trang để số trang in khớp 100% màn hình; thêm header/footer + số trang configurable; line-level & table row split như Google Docs."
status: pending
priority: P1
branch: "main"
tags: [docs, pagination, print, tiptap, tdd]
blockedBy: []
blocks: []
created: "2026-08-18T06:12:03.890Z"
createdBy: "ck:plan"
source: skill
---

# Print fidelity & page numbering (apps/docs)

## Overview

`apps/docs` đang có **2 engine phân trang độc lập**: màn hình dùng engine JS (`computePageBreaks` chèn spacer decoration), còn khi in thì `@media print` ẩn hết spacer và giao cho browser tự repaginate. Hệ quả: số trang in ≠ số trang màn hình, và không có số trang ở bất kỳ đâu.

Plan này hợp nhất 2 đường render bằng **sliding-window clip** (mỗi trang in là một cửa sổ nhìn vào cùng một DOM đã render), thêm header/footer + số trang, rồi nâng engine lên **line-level** và **table row-level** để ngắt trang giống Google Docs.

**Brainstorm report (root cause + approaches đã loại):**
`../reports/brainstorm-print-pagination-fidelity-260818-1151-print-page-count-and-page-numbers-report.md`

## Root cause tóm tắt

| # | Nguyên nhân | Vị trí |
|---|---|---|
| 1 | Lề trên/dưới chỉ áp 1 lần cho cả element → trang 2..N in ra không có lề, chứa nhiều nội dung hơn | `styles.css` `@media print` `.doc-editor { padding: ... }` + `@page { margin: 0 }` |
| 2 | Điểm ngắt do engine JS tính bị vứt bỏ khi in | `styles.css` `@media print` `display:none` cho `.page-stack`, `.page-break-spacer` |
| 3 | Không có `break-inside`/orphans/widows | không tồn tại |
| 4 | Không có page number | không tồn tại |

## Mode & chiến lược test

`--tdd`. Repo hiện **không có test infrastructure** (root scripts chỉ có dev / compile / typecheck / lint / format; `lint` thực chất là `tsc --noEmit`).

Ràng buộc quyết định chiến lược: **jsdom không có layout engine** — `offsetHeight` luôn `0`, `getClientRects()` rỗng. Test engine bằng jsdom = test cái mock. Nên chia đôi:

| Loại | Công cụ | Test cái gì | Cài đặt |
|---|---|---|---|
| Pure algorithm | Vitest (node env) | `computeBreaksFromMeasurements` với fixture `BlockMeasurement[]` | 1 devDep, repo đã có Vite |
| Print fidelity | `google-chrome` + CDP qua Node `WebSocket` | Đếm số trang PDF thật, so với `pageCount` màn hình | **Zero install** |

`/usr/bin/google-chrome` đã có sẵn; Node v24 có `WebSocket` global → script CDP không cần dependency nào.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Test Infrastructure](./phase-01-test-infrastructure.md) | Pending |
| 2 | [Engine Seam Extraction](./phase-02-engine-seam-extraction.md) | Pending |
| 3 | [Page Setup Model & Token Renderer](./phase-03-page-setup-model-token-renderer.md) | Pending |
| 4 | [Print Sliding-Window](./phase-04-print-sliding-window.md) | Pending |
| 5 | [Screen Header-Footer Layer](./phase-05-screen-header-footer-layer.md) | Pending |
| 6 | [Configuration UI](./phase-06-configuration-ui.md) | Pending |
| 7 | [Line-Level Split](./phase-07-line-level-split.md) | Pending |
| 8 | [Table Row Split](./phase-08-table-row-split.md) | Pending |

### Dependency graph

```
P1 (test infra)
 └─ P2 (seam extraction)  ← khoá hành vi block-level hiện tại bằng test
     ├─ P3 (model + token renderer)
     │   ├─ P4 (print sliding-window)  ← MỐC SHIPPABLE
     │   ├─ P5 (screen HF layer)
     │   └─ P6 (config UI)
     └─ P7 (line-level split)
         └─ P8 (table row split, spike-gated)
```

P6 phụ thuộc P3 (model) và P5 (thấy được kết quả trên màn hình).
Sau **P4 + P5 + P6** thì yêu cầu gốc đã đạt: đúng số trang + có số trang đầy đủ. P7/P8 là phần chất lượng ngắt trang "như Google Docs".

## Acceptance criteria (toàn plan)

1. Doc N trang ở paged view → print preview đúng **N** trang, không trang trắng thừa.
2. Đổi paperSize / orientation / margins → màn hình và in vẫn khớp số trang.
3. Số trang đúng thứ tự, tôn trọng `startAt` + `skipFirstPage`.
4. Header/footer + token render đúng mọi trang, giống hệt giữa màn hình và bản in.
5. Đoạn văn dài hơn 1 trang cắt giữa dòng, không mất chữ (P7).
6. Bảng dài cắt giữa row, không mất row (P8, nếu spike pass).
7. Gõ tiếng Việt (IME) quanh điểm ngắt trang: caret không nhảy, không nuốt ký tự.
8. Doc 50 trang: pagination không lag rõ rệt khi gõ.
9. `pnpm typecheck` và `pnpm test` xanh.

## Rủi ro xuyên suốt

| Rủi ro | Mức | Mitigation | Phase |
|---|---|---|---|
| Table row split có thể không khả thi | Cao | Spike gate trước khi code; fallback giữ hành vi cũ | P8 |
| `posAtCoords` không ổn định ở biên line box | Cao | Fallback về block-level cho block đó | P7 |
| Inline spacer phá caret / IME tiếng Việt | Cao | `ignoreSelection`, `contentEditable=false`; kiểm IME riêng | P7 |
| Trang trắng thừa do rounding subpixel | Trung bình | `.print-page` trừ hụt 1px hoặc dùng đơn vị mm khớp `@page size` | P4 |
| Header/footer mặc định của browser in đè | Thấp | Không tắt được bằng CSS — ghi hướng dẫn user bỏ tick trong dialog | P4 |
| Header text cao hơn vùng lề trên | Thấp | Clip, không đẩy content; ghi known limitation | P5 |
| Clone DOM 50 trang tốn memory lúc in | Thấp | Clone 1 lần, dùng chung qua CSS | P4 |

## Out of scope

- Rich-text editable header/footer (đã chốt plain text + token).
- Docx import/export của header/footer & page number (`packages/docx-io`).
- Section break / khác lề theo section như Word.
- Orphan/widow control.

## Open questions

- Header/footer có cần round-trip qua docx import/export không? (`packages/docx-io` đang có thay đổi chưa commit)
- `MAX_PAGES = 50` giữ nguyên hay nâng? Doc >50 trang hiện bị chặn phân trang.
- Số trang có cần hiện trên `Statusbar` (hiện chỉ word/char count) không?

## Dependencies

Không có plan nào khác trong `plans/ducnd/` (thư mục chỉ có `reports/`). Không có cross-plan `blockedBy`/`blocks`.
