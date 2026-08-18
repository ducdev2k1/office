---
title: "Print fidelity & page numbering (apps/docs)"
description: "Hợp nhất 2 engine phân trang để số trang in khớp màn hình; sửa bug pageCount đếm thiếu; thêm header/footer + số trang; line-level & table row split như Google Docs."
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

`apps/docs` có **2 engine phân trang độc lập**: màn hình dùng engine JS (`computePageBreaks` chèn spacer decoration), khi in thì `@media print` ẩn hết spacer và giao cho browser tự repaginate. Hệ quả: số trang in ≠ số trang màn hình, và không có số trang ở đâu.

Plan hợp nhất 2 đường render bằng **sliding-window clip**, thêm header/footer + số trang, rồi nâng engine lên **line-level** và **table row-level**.

**Brainstorm report:** `../reports/brainstorm-print-pagination-fidelity-260818-1151-print-page-count-and-page-numbers-report.md`

## Root cause

| # | Nguyên nhân | Vị trí |
|---|---|---|
| 1 | Lề trên/dưới chỉ áp 1 lần cho cả element → trang 2..N in ra không có lề | `styles.css` `@media print` `.doc-editor { padding }` + `@page { margin: 0 }` |
| 2 | Điểm ngắt do engine JS tính bị vứt bỏ khi in | `styles.css` `@media print` `display:none` cho `.page-stack`, `.page-break-spacer` |
| 3 | Không có `break-inside`/orphans/widows | không tồn tại |
| 4 | Không có page number | không tồn tại |
| 5 | **`pageCount = breaks.length + 1` đếm thiếu** khi có block cao hơn 1 trang | `pagination.utils.ts:85` vòng `while` không push break; `usePagination.ts:47` |

Nguyên nhân 5 phát hiện qua red team. Hôm nay nó vô hại (browser tự repaginate khi in nên nội dung vẫn ra đủ), nhưng sliding-window sẽ biến nó thành **mất dữ liệu**. Phải fix trước P4.

## Mode & chiến lược test

`--tdd`. Repo **không có test infrastructure** (root scripts chỉ có dev / compile / typecheck / lint / format; `lint` = `tsc --noEmit`).

**jsdom không có layout engine** — `offsetHeight` = 0, `getClientRects()` rỗng. Test engine bằng jsdom = test mock. Chia đôi:

| Loại | Công cụ | Test cái gì | Cài đặt |
|---|---|---|---|
| Pure algorithm | Vitest (node env) | `computeBreaksFromMeasurements` với fixture `BlockMeasurement[]` | 1 devDep |
| Print fidelity | `google-chrome` + CDP qua Node `WebSocket`, `pdfinfo` | **Text liền mạch giữa các trang PDF** (không phải đếm trang — xem dưới) | Zero install |

`/usr/bin/google-chrome` và `/usr/bin/pdfinfo` đã có sẵn; Node v24 có `WebSocket` global.

### Vì sao KHÔNG assert bằng số trang

P4 dựng đúng `pageCount` phần tử `.print-page`, mỗi cái `break-after: page`. Số trang PDF bằng `pageCount` **theo cấu trúc**, không theo hành vi. Assert `pdfPages === pageCount` là so một con số với chính nó. Cả hai lỗi nghiêm trọng nhất (mất nội dung, lệch wrap) đều **giữ nguyên số trang** → harness sẽ xanh khi bản in đã hỏng.

Assertion thật: extract text từng trang PDF, kiểm **dòng cuối trang i nối liền dòng đầu trang i+1**, không trùng, không thiếu. Đếm trang chỉ dùng để bắt trang trắng thừa.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Test Infrastructure](./phase-01-test-infrastructure.md) | Completed |
| 2 | [Engine Seam Extraction](./phase-02-engine-seam-extraction.md) | Completed |
| 3 | [Page Setup Model & Token Renderer](./phase-03-page-setup-model-token-renderer.md) | Completed |
| 4 | [Print Sliding-Window](./phase-04-print-sliding-window.md) | Completed |
| 5 | [Screen Header-Footer Layer](./phase-05-screen-header-footer-layer.md) | Completed |
| 6 | [Configuration UI](./phase-06-configuration-ui.md) | Completed |
| 7 | [Line-Level Split](./phase-07-line-level-split.md) | Completed |
| 8 | [Table Row Split](./phase-08-table-row-split.md) | Completed (Spike concluded) |

### Dependency graph

```
P1 (harness + fixture seeding + pin font, 1d)
 └─ P2  ├─ 2a: fix pageCount + contentOffsets từ offsetTop thật
        ├─ 2b: SPIKE GATE — dựng print-root tay, verify doc ≥30 trang
        └─ 2c: seam extraction + fixture
     ├─ P3a (pageNumber + {page}/{pages}) ─ P4 (print sliding-window) ← SHIPPABLE
     ├─ P3b (header/footer slots) ─┬─ P5 (screen HF) ─ P6 (config UI)
     └─ P7 (line-level) ─ P8 (table row, spike-gated)
```

**Spike gate ở P2b là điểm quyết định.** Rủi ro kiến trúc lớn nhất được verify vào ngày thứ 2, không phải sau 3.5 ngày. Gate fail → dừng, bàn lại kiến trúc trước khi tiêu thêm effort.

Sau **P4 + P5 + P6** yêu cầu gốc đã đạt. P7/P8 là chất lượng ngắt trang.

## Acceptance criteria (toàn plan)

1. Doc N trang paged view → in ra đúng **N** trang, không trang trắng thừa, **cả portrait lẫn landscape** (landscape có failure mode riêng — xem risk).
2. Đổi paperSize / orientation / margins → màn hình và in vẫn khớp.
3. **Không mất nội dung**: text extract từ PDF liền mạch giữa mọi cặp trang liên tiếp. Bao gồm doc có block cao hơn 1 trang và doc > `MAX_PAGES`.
4. Số trang đúng thứ tự, tôn trọng `startAt` + `skipFirstPage`.
5. Header/footer + token render đúng mọi trang, giống hệt màn hình vs bản in.
6. Đoạn văn dài hơn 1 trang cắt giữa dòng, không mất chữ (P7).
7. Bảng dài cắt giữa row, không mất row (P8, nếu spike pass).
8. Gõ tiếng Việt (IME) quanh điểm ngắt trang: caret không nhảy, không nuốt ký tự, không mất dấu.
9. Doc 50 trang: gõ không lag rõ rệt; `buildPrintRoot` dưới ngưỡng thời gian đã đo.
10. `pnpm typecheck` và `pnpm test` xanh.

## Quyết định đã chốt

| Vấn đề | Quyết định |
|---|---|
| Doc vượt `MAX_PAGES = 50` khi in | **Fallback đường in cũ** — `isOverLimit === true` → không dựng print-root, để browser repaginate. Số trang có thể lệch nhưng **không mất nội dung**. |
| Token `{pages}` khi `startAt ≠ 1` | **Tổng số trang** (như `NUMPAGES` của Word). `startAt=5`, doc 3 trang → `{page}=5..7`, `{pages}=3`. |
| Header/footer | Plain text + token, không rich-text editable. |
| P6 entry point | **Một** entry point, không tab (`@office/ui-kit` không có Tabs). |
| Ngưỡng `MAX_PAGES` | **Giữ 50**. Quyết có nâng hay không **sau khi đo** wall time ở P4 bước 8 — đoán trước là đoán mò. |
| Font Google Sans + Roboto | **Pin local** (P1 bước 8), bỏ `@import` CDN. User offline in ra không lệch số trang; test tái lập được. |
| Fixture seeding | `window.__seedDoc` DEV-only trong `src/dev/`, không seed IndexedDB thô từ CDP. |
| Thứ tự thực thi | **Chạy liền P1→P8**, không checkpoint giữa chừng. Hai gate cứng dưới đây vẫn có hiệu lực. |
| **Gate P2b fail** (spike sliding-window) | **DỪNG, báo user quyết.** Không tự chuyển sang per-page slicing hay approach B. |
| **Gate P7 fail** (IME tiếng Việt) | **Bỏ P7, revert về block-level**, đi tiếp P8 hoặc dừng. Timebox fix 1 ngày, không kéo dài. |

## Rủi ro xuyên suốt

| Rủi ro | Mức | Mitigation | Phase |
|---|---|---|---|
| Clone mất cascade `.is-paged` → wrap lệch | **Cao** | Bọc clone trong `.page-viewport.is-paged`, force light palette, assert `clone.scrollHeight === view.dom.scrollHeight` trước khi dựng | P4 |
| `pageCount` đếm thiếu → in mất nội dung | **Cao** | Fix ở P2a: `pageCount = contentOffsets.length`, emit offset cho cả trang vòng `while` nhảy qua | P2 |
| `beforeprint` đồng bộ → đọc React state cũ | **Cao** | `runPagination` return `PageBreaks`; đọc từ return value hoặc ProseMirror plugin state, không đọc React state. `composing === true` → abort build, fallback in cũ | P4 |
| Inline spacer phá caret / IME tiếng Việt | **Cao** | Map decoration qua `tr.mapping`; tắt hẳn inline spacer khi `view.composing`; gate kiểm IME | P7 |
| N clone đồng bộ trong `beforeprint` → đơ/OOM | **Cao** | Đo wall time doc 50 trang + 20 ảnh, đặt ngưỡng abort cứng trong AC | P4 |
| Table row split có thể không khả thi | Cao | Spike gate; fallback giữ hành vi cũ | P8 |
| `posAtCoords` không ổn định ở biên | Cao | Trả `{pos, inside} \| null` → null check + fallback block-level | P7 |
| `contentOffsets` drift tích luỹ từ `offsetHeight` làm tròn | Cao | Đọc `offsetTop` thật thay vì cộng dồn model; verify trên doc ≥30 trang, không phải 2-3 trang | P2 |
| Trang trắng thừa ở **landscape** do margin lạc trong ancestor chain | Trung bình | `.print-page` dùng đơn vị **mm** khớp `@page size`; zero tường minh margin/padding trên `#print-root` và `.print-page`; `:last-child { break-after: auto }` | P4 |
| `#root { display:none }` vô điều kiện → in trang trắng | Trung bình | Gate bằng class trên `body` do builder toggle sau khi build thành công; try/catch + `finally` gỡ class | P4 |
| Font load qua `@import` từ CDN → user offline in ra lệch số trang, test không tái lập | Trung bình | **Pin font local** (P1 bước 8) + chờ `document.fonts.ready` | P1 |
| Header text cao hơn vùng lề trên | Thấp | Clip, không đẩy content; known limitation | P5 |

## Out of scope

- Rich-text editable header/footer.
- Docx import/export của header/footer & page number (`packages/docx-io`).
- Section break / khác lề theo section như Word.
- Orphan/widow control.
- Lặp header row của bảng qua trang (Google Docs cũng không mặc định).
- **Autosave ghi cả mảng docs mỗi keystroke** (`useDocs.ts:56-59` `useEffect([docs]) → saveDocs(docs)`). Vấn đề có sẵn, P6 làm tăng tần suất. Validation chốt **tách issue riêng** — không trộn refactor persistence vào plan này.
- **Docx round-trip header/footer**: không khả thi vì `packages/docx-io` chỉ có import (`mammoth` .docx → HTML), **không có export**, và mammoth không surface header/footer. Open question này tự giải.

## Open questions

- Nâng `MAX_PAGES` trên 50 không? **Chờ số đo** wall time `buildPrintRoot` ở P4 bước 8 rồi quyết. Không chặn phase nào.

## Dependencies

Không có plan nào khác trong `plans/ducnd/`. Không có cross-plan `blockedBy`/`blocks`.

---

## Red Team Review

### Session — 2026-08-18
**Reviewers:** 4 (Failure Mode Analyst, Assumption Destroyer, Scope & Complexity Critic, Correctness Adversary)
**Findings:** 35 thô → 15 sau dedupe (15 accepted, 0 rejected)
**Severity breakdown:** 5 Critical, 7 High, 3 Medium
**Evidence filter:** tất cả finding có `file:line` — không cái nào bị loại

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| 1 | `pageCount = breaks.length + 1` đếm thiếu → sliding-window nuốt nội dung; `MAX_PAGES` cắt cụt | Critical | Accept | P2, P4, plan.md |
| 2 | Clone mất cascade `.is-paged` → content width 680px vs 628px, wrap lệch; `.dark` vẫn match; `.print-clip` áp lề hai lần | Critical | Accept | P4 |
| 3 | `#root { display:none }` vô điều kiện → in trang trắng ở continuous view / build fail | Critical | Accept | P4 |
| 4 | `beforeprint` đồng bộ → `pageCount`/`contentOffsets` từ React state luôn stale; `document.fonts.ready` không await được | Critical | Accept | P2, P4 |
| 5 | Không có cơ chế nạp fixture doc → mọi gate pass rỗng; dev port 2001 không phải 5173 | Critical | Accept | P1 |
| 6 | `print-check.mjs` lặp thừa — đếm trang là so một số với chính nó | High | Accept | P1, P4 |
| 7 | `contentOffsets` drift tích luỹ từ `offsetHeight` làm tròn, không phải lệch hằng số | High | Accept | P2, P4 |
| 8 | `ignoreSelection` là no-op khi `contentEditable=false`; `posAtCoords` trả `{pos,inside}\|null`; plugin `apply` không map qua `tr.mapping` | High | Accept | P7 |
| 9 | "Clone 1 lần dùng chung CSS" bất khả thi — phải N clone đồng bộ trong `beforeprint` | High | Accept | P4, plan.md |
| 10 | `.page-break-marker` in ra đường kẻ xanh + chữ "Page break" | High | Accept | P4 |
| 11 | `normalizePageSetup` sai call site, trùng `withDefaults`; `mmToPx(undefined)` = `NaN`; normalize inline phá identity → `PageSetupPanel` useEffect loop | High | Accept | P3, P5 |
| 12 | Cost model P7 O(pages) sai — 1 bảng 50 trang là 1 block cắt ngang 49 ranh giới | High | Accept | P7 |
| 13 | Thứ tự phase front-load 2.5-3.5d hạ tầng trước fix đầu tiên | Medium | Accept | plan.md, P2 (spike gate) |
| 14 | `*.test.ts` trong `src/` làm `pnpm typecheck` đỏ; `noUncheckedIndexedAccess: true` | Medium | Accept | P1, P2, P7 |
| 15 | Gộp: `@office/ui-kit` không có Tabs; `aria-hidden` che số trang khỏi screen reader; `{date}` trùng `packages/i18n/formatters.ts`; barrel `modules/editor/index.ts:12` quên cập nhật; font `@import` từ CDN | Medium | Accept | P1, P3, P5, P6, P4 |

### Giả định đã verify là ĐÚNG (thực nghiệm CDP, đừng churn thêm)

- `break-after: page` **có** hoạt động trên block `position:relative; overflow:hidden` trong normal flow — 3 div → 3 trang. `overflow:hidden` chỉ làm box monolithic, không chặn break giữa sibling.
- `preferCSSPageSize: true` **có** honor `@page { size }` inject runtime qua `<style>` append trong `beforeprint` — MediaBox trả `594.96 × 420pt`.
- `beforeprint` **có** fire với CDP `Page.printToPDF`, và DOM dựng trong handler đó **có** vào PDF.
- Chrome PDF **không** nén object stream → đếm `/Type /Page` tin cậy được (nhưng `pdfinfo` đơn giản hơn).
- Không có custom ProseMirror node view nào trong repo → `cloneNode(true)` an toàn.
- `@office/*` là workspace source (`exports: "./src/index.ts"`) → Vitest resolve không cần build.
- Persistence path carry field optional mới bình thường (`useDocs.ts:157-159` → `saveDocs` → `putMany`).

### Phát hiện thực nghiệm mới

- **Trang trắng ở landscape KHÔNG do rounding.** Nguyên nhân thật: margin lạc trong ancestor chain. Giảm width 1px không fix; zero body margin thì fix. → `.print-page` phải dùng **mm**, zero tường minh margin/padding. Portrait pass mà landscape fail → test một khổ giấy là không đủ bằng chứng.
- **Double-build tái hiện được:** build eager + build trong `beforeprint` → 6 trang cho doc 3 trang. Guard idempotent là **bắt buộc**, không phải phòng xa.

### Whole-Plan Consistency Sweep

Chạy sau khi apply 15 finding, quét `plan.md` + toàn bộ `phase-*.md`.

**Decision delta đã kiểm:**

| Thuật ngữ / quyết định cũ | Trạng thái sau sweep |
|---|---|
| `pageCount = breaks.length + 1` | Chỉ còn xuất hiện dạng **mô tả bug** (plan.md:33,153; phase-02:35,62,64). Không còn chỗ nào dùng làm invariant |
| Invariant `contentOffsets.length === breaks.length + 1` | Đã gỡ khỏi P2 Success Criteria, thay bằng `contentOffsets.length === pageCount` |
| "Zero behavior change" ở P2 | Chỉ còn ở phase-02:22-24 dạng **bác bỏ tường minh** |
| `normalizePageSetup` như API mới | Đã gỡ. P3 thay bằng spread default trong `withDefaults` (`docs.service.ts:20`) |
| Danh sách call-site sai (`EditorCanvas`, `PageSetupPanel`) | Đã sửa trong P3, kèm grep thật và 2 file ruler bị bỏ sót |
| `window.__pageCount` backdoor | Đã gỡ. P1 đọc `.page-stack .page` từ DOM; còn 2 mention ở phase-01:55,140 dạng **cấm tường minh** |
| Port `5173` | Đã sửa thành 2001; 2 mention còn lại (phase-01:86, plan.md:157) là ghi chú "KHÔNG phải 5173" |
| `ignoreSelection` như mitigation IME | Đã gỡ khỏi risk table. 4 mention còn lại đều là **giải thích no-op** |
| `defaultTab` / hệ tab | Đã cắt. Mention còn lại ở phase-06:20,21,55 là **lý do cắt** |
| "Clone 1 lần, dùng chung qua CSS" | Đã gỡ khỏi risk table plan.md. Mention ở phase-04:150 là **bác bỏ tường minh** |
| Cost model `O(pages)` của P7 | Đã sửa thành `O(Σ dòng block cắt ngang)`. Mention ở phase-07:51 là bản trước được trích để bác |
| Assertion đếm trang trong harness | Đã đổi sang **text continuity qua marker `[[N]]`**; đếm trang chỉ dùng bắt trang trắng thừa |
| `{pages}` = `pageCount + startAt - 1` | Đã sửa thành `pageCount` (tổng số trang) |
| `MAX_PAGES` trong Open questions | Đã chuyển thành **quyết định đã chốt** (fallback đường in cũ); Open questions chỉ còn câu hỏi có nâng ngưỡng không |

**Dependency graph vs frontmatter:** khớp. `P1←[] P2←[1] P3←[2] P4←[3] P5←[3] P6←[3,5] P7←[2] P8←[7]`.
Lưu ý: P4 khai `dependencies: [3]` ở mức phase, thực chất chỉ cần **3a**; phase-03 mô tả rõ split 3a/3b nên không mâu thuẫn.

**Effort tổng sau restructure:** ~11.5–15.5 ngày (trước red team ước ~6–9 ngày). Chênh lệch đến từ: P1 +0.5d (fixture seeding + assertion thật), P2 +1d (fix bug `pageCount` + spike gate), P4 +0.5d (cascade wrapper, fallback paths, đo chi phí clone), P7 +1d (fix `tr.mapping`, cache, benchmark). P6 −0.5d nhờ MVP cut.

**Contradiction chưa giải quyết:** không có.


---

## Validation Log

### Session 1 — 2026-08-18
**Questions asked:** 7 (config: 3-8)
**Verification pass:** skipped per guard — `## Red Team Review` đã tồn tại với evidence `file:line`. Quét `[UNVERIFIED]` → **0 tag**.

| # | Câu hỏi | Quyết định | Propagate tới |
|---|---|---|---|
| 1 | Thứ tự thực thi P7 | **Chạy liền P1→P8**, không checkpoint | plan.md Quyết định |
| 2 | Font CDN | **Pin local** Google Sans + Roboto, bỏ `@import` | P1 bước 8, Related Files, AC, risk |
| 3 | Fixture seeding | **`window.__seedDoc` DEV-only** trong `src/dev/` | P1 (đã khớp, xác nhận) |
| 4 | Autosave ghi cả mảng docs mỗi keystroke | **Tách issue riêng**, ngoài scope | plan.md Out of scope, P6 (đã khớp) |
| 5 | Gate P2b fail | **DỪNG, báo user quyết** — không tự chuyển kiến trúc | plan.md Quyết định, P2 (đã khớp) |
| 6 | Gate P7 fail (IME) | **Bỏ P7, revert block-level**, timebox 1 ngày | plan.md Quyết định, P7 (đã khớp) |
| 7 | Ngưỡng `MAX_PAGES` | **Giữ 50**, quyết sau khi đo ở P4 bước 8 | plan.md Quyết định + Open questions, P4 bước 8 |

**Tự giải không cần hỏi:** open question "docx round-trip header/footer" — `packages/docx-io/src/` chỉ có `index.ts` + `mammoth.d.ts` + `mammoth.types.ts`, tức **import-only** (mammoth .docx → HTML), **không có export**, và grep `hdr|ftr|header|footer` trong package → 0 hit. Round-trip không khả thi vì thiếu một nửa đường. Chuyển sang Out of scope.

### Verification Results
- Claims checked: 0 (skipped per guard — red team đã verify với `file:line` evidence, gồm 4 vòng thực nghiệm CDP thật)
- Verified: — | **Failed: 0** | Unverified: 0
- Tier: skipped (guard)
- `[UNVERIFIED]` tags: 0

### Whole-Plan Consistency Sweep

Chạy sau propagation, quét `plan.md` + 8 `phase-*.md`.

| Kiểm | Kết quả |
|---|---|
| Effort P1 trong dependency graph vs frontmatter | **Đã sửa** — graph ghi 0.5d, frontmatter 1d (tăng do pin font). Đồng bộ về 1d |
| Font: `@import` CDN còn được mô tả như hiện trạng chấp nhận được ở đâu không | Sạch — mọi mention đều gắn với quyết định pin local |
| `MAX_PAGES` còn nằm ở Open questions dạng chặn không | Sạch — chuyển sang Quyết định đã chốt + follow-up gắn P4 bước 8 |
| Docx round-trip còn ở Open questions không | Sạch — chuyển sang Out of scope kèm bằng chứng |
| Autosave có bị plan này định sửa ở đâu không | Sạch — P6 và plan.md đều ghi tách issue riêng |
| Hai gate còn mô tả nhất quán sau khi chọn "chạy liền" không | Sạch — plan.md Quyết định nêu tường minh gate vẫn có hiệu lực; P2/P7 khớp |
| Dependency graph vs frontmatter 8 phase | Khớp |

**Contradiction chưa giải quyết:** không có.

**Khuyến nghị:** proceed. `Failed: 0` → plan đủ điều kiện implement.
