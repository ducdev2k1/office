# Brainstorm — Print fidelity & page numbering (apps/docs)

- Date: 2026-08-18 11:51 (+07)
- Branch: `main`
- Scope owner: ducnd
- Status: approved, ready for `/ck:plan`

## 1. Problem statement

Docs editor có 2 engine phân trang độc lập → số trang in KHÁC số trang màn hình. Và không có số trang ở bất kỳ đâu.

Yêu cầu gốc: "docs có bao nhiêu page thì in đúng chừng đấy page, và có số trang đầy đủ".

## 2. Root cause (verified qua đọc source)

| # | Nguyên nhân | Bằng chứng |
|---|---|---|
| 1 | Lề trên/dưới chỉ áp 1 lần cho cả element, không per-page → trang 2..N in ra không có lề, chứa nhiều nội dung hơn → ít trang hơn | `styles.css:@media print` `.doc-editor { padding: var(--margin-t) ... }` + `usePrintSetup.ts` `@page { margin: 0 }` |
| 2 | Điểm ngắt do engine JS tính bị vứt bỏ khi in; browser tự repaginate theo thuật toán riêng | `styles.css` `@media print` `display:none` cho `.page-stack`, `.page-break-spacer`, `.page-break-marker` |
| 3 | Không có `break-inside: avoid` / orphans / widows → browser cắt giữa đoạn tuỳ ý | grep: 0 hit |
| 4 | Không có page number | grep `pageNumber|counter(page)|footer` → 0 hit liên quan |

Kết luận: không tinh chỉnh CSS nào đảm bảo khớp 100%. Phải hợp nhất 2 đường render.

## 3. Kiến trúc hiện tại (touchpoints)

- Engine màn hình: `apps/docs/src/modules/editor/utils/pagination.utils.ts` — `computePageBreaks` duyệt `doc.forEach` top-level node, đo `offsetHeight`, chèn widget decoration `.page-break-spacer`.
- State: `apps/docs/src/modules/editor/hooks/usePagination.ts` — `pageCount = breaks.length + 1`, rAF debounce, `MAX_PAGES = 50`.
- In: `apps/docs/src/modules/editor/hooks/usePrintSetup.ts` — chỉ set `@page size`.
- Trigger in: `apps/docs/src/pages/EditorPage.tsx:167` và `:188` → `window.print()`.
- Model: `apps/docs/src/types/docs.types.ts` — `PageSetup { paperSize, orientation, margins }`.
- UI: `apps/docs/src/modules/editor/components/PageSetupPanel.tsx`, `modules/header/components/MenuBar.tsx` (đã có `menu.insert.*`).
- Canvas: `apps/docs/src/modules/editor/components/EditorCanvas.tsx` — `.page-stack` render `pageCount` div `.page` rỗng, `aria-hidden`.

## 4. Approaches đánh giá

| | Cách | Khớp số trang | Page number | Chi phí | Verdict |
|---|---|---|---|---|---|
| A | Print-from-DOM (dựng DOM in riêng theo breaks engine) | Đảm bảo | Full control | Trung bình | **Chọn** — biến thể sliding-window |
| B | Vá CSS, browser tự flow (`@page margin`, `break-inside`) | Không đảm bảo, lệch 1-2 trang doc dài | `@bottom-center{counter(page)}` Chrome không hỗ trợ → vẫn phải JS | Thấp | Loại — không đáp ứng yêu cầu gốc |
| C | Export PDF bằng lib (jsPDF/html2pdf) | Có | Có | Cao | Loại — đổi UX, font tiếng Việt kém, bundle nặng |

Biến thể chốt của A: **sliding-window clip** thay vì slice DOM. Lý do: nếu đi line-level (P2), cắt DOM giữa dòng cực khó. Sliding-window không cắt DOM lần nào.

## 5. Giải pháp chốt

### 5.1 Data model — extend `PageSetup`

```ts
export type HFAlign = 'left' | 'center' | 'right';
export interface HeaderFooterSlot { left: string; center: string; right: string }
export interface PageNumberSetup {
  enabled: boolean;
  position: 'header' | 'footer';
  align: HFAlign;
  format: string;          // '{page}' | '{page} / {pages}' | 'Trang {page}'
  startAt: number;
  skipFirstPage: boolean;
}
export interface PageSetup {
  paperSize; orientation; margins;   // giữ nguyên
  header?: HeaderFooterSlot;
  footer?: HeaderFooterSlot;
  headerMargin?: number;             // mm từ mép trên tới header
  footerMargin?: number;
  pageNumber?: PageNumberSetup;
}
```

Token: `{page}` `{pages}` `{title}` `{date}`. Field mới đều optional → doc cũ trong IndexedDB load ra vẫn chạy; `DEFAULT_PAGE_SETUP()` điền default.

Quyết định: header/footer là **plain text + token, 3 ô căn trái/giữa/phải**, KHÔNG rich-text editable. Rich-text = ProseMirror instance thứ hai + undo stack riêng + serialize riêng + docx import/export riêng, ~+1 tuần cho ~10% giá trị. User đã chốt plain text + token.

### 5.2 In — sliding-window clip

```
#print-root
 └─ .print-page          w/h = khổ giấy, break-after: always, position: relative
     ├─ .print-hf.print-header      3 ô text, trong vùng lề trên
     ├─ .print-clip                 absolute, inset = margins, height = usable, overflow: hidden
     │    └─ .print-content         CLONE nguyên vẹn view.dom, style="top: -{contentOffset[i]}px"
     └─ .print-hf.print-footer
```

Mỗi trang in = cửa sổ nhìn vào **cùng một DOM đã render** → cùng width/font/CSS → wrap không thể lệch. Spacer engine giữ nguyên trong clone nên khoảng trắng cuối trang tự bị clip đúng chỗ.

Engine trả thêm `contentOffsets: number[]`. `@media print` ẩn `#root`, hiện `#print-root`. `@page { size; margin: 0 }` giữ nguyên.

### 5.3 Engine — line-level split (P2)

Thay `doc.forEach` đo `offsetHeight` cả block bằng: block nào **giao ranh giới trang** thì zoom xuống line box.

1. `document.createRange()` trên text node của block → `getClientRects()` = rect từng dòng
2. Dòng đầu tiên có `bottom` vượt `usable` = split point
3. `view.posAtCoords({left, top})` map ngược về ProseMirror pos
4. Chèn inline widget `display:block; height:spacerPx`, `side: -1`, `ignoreSelection: true`, `contentEditable=false`

Chi phí: chỉ chạy line-level cho 1 block/trang (block giao ranh giới) → O(pages), không O(nodes). Giữ rAF debounce + `MAX_PAGES` guard hiện có.

### 5.4 Table row split (P3) — cần spike

Không chèn widget giữa 2 `<tr>` được (ProseMirror đặt sai vị trí). Hướng khả thi: `Decoration.node` trên row đầu trang mới với `style: padding-top: Xpx`. **Chưa chứng minh khả thi** → spike ngắn trước khi cam kết. Fallback nếu fail: bảng dài vẫn nhảy nguyên trang (hành vi hiện tại).

### 5.5 Screen WYSIWYG

Đổ header/footer/số trang vào `.page-stack` (lớp decorative `aria-hidden` sẵn có) → không đụng ProseMirror. Dùng chung hàm render token với print.

### 5.6 UI

- `PageHeaderFooterPanel.tsx` (mới): 6 ô text + token chips click-to-insert + config số trang (enabled, position, align, format, startAt, skipFirstPage).
- MenuBar: `Chèn > Số trang`, `Chèn > Đầu trang & chân trang` — cùng dialog, khác tab mặc định.
- PageSetupPanel: nút `Đầu trang & chân trang…` mở cùng dialog (DRY).
- i18n keys mới: `packages/i18n/src/locales/{en,vi}/docs.json`.

## 6. Files touched

| File | Việc |
|---|---|
| `apps/docs/src/types/docs.types.ts` | extend PageSetup |
| `apps/docs/src/modules/editor/utils/pagination.utils.ts` | rewrite engine, trả `contentOffsets` |
| `apps/docs/src/modules/editor/hooks/usePagination.ts` | expose offsets |
| `apps/docs/src/modules/editor/hooks/usePrintSetup.ts` | **thay** bằng `editor/print/usePrintDocument.ts` |
| `apps/docs/src/modules/editor/print/print-document.utils.ts` | **mới** — dựng `#print-root` |
| `apps/docs/src/modules/editor/print/page-tokens.utils.ts` | **mới** — render token, dùng chung screen+print |
| `apps/docs/src/modules/editor/components/PageHeaderFooterPanel.tsx` | **mới** |
| `apps/docs/src/modules/editor/components/PageSetupPanel.tsx` | thêm entry |
| `apps/docs/src/modules/editor/components/EditorCanvas.tsx` | page-stack render HF |
| `apps/docs/src/modules/header/components/MenuBar.tsx` | 2 menu action |
| `apps/docs/src/modules/header/types/header.types.ts` | 2 action trong `HeaderMenuActions` |
| `apps/docs/src/pages/EditorPage.tsx` | wire dialog + đổi `onPrint` |
| `apps/docs/src/assets/styles/styles.css` | `@media print` viết lại + style print-page/hf |
| `packages/i18n/src/locales/{en,vi}/docs.json` | keys mới |

## 7. Phasing

- **P1** — data model + sliding-window print + screen/print header-footer-pagenumber + UI. Đạt yêu cầu gốc: đúng số trang + có số trang.
- **P2** — line-level split (đoạn văn cắt giữa dòng như GG Docs).
- **P3** — table row split. **Spike trước.**

Dù làm 1 lượt, vẫn chia phase để verify từng bước.

## 8. Acceptance criteria

1. Doc N trang paged view → print preview đúng N trang, không trang trắng thừa.
2. Đổi paperSize / orientation / margins → màn hình và in vẫn khớp số trang.
3. Số trang đúng thứ tự, tôn trọng `startAt` + `skipFirstPage`.
4. Header/footer + token render đúng mọi trang, giống hệt giữa màn hình và bản in.
5. Đoạn văn dài hơn 1 trang cắt giữa dòng, không mất chữ (P2).
6. Bảng dài cắt giữa row, không mất row (P3, nếu spike pass).
7. Gõ tiếng Việt (IME) quanh điểm ngắt trang: caret không nhảy, không nuốt ký tự.
8. Doc 50 trang: pagination không lag rõ rệt khi gõ.

## 9. Risks

| Rủi ro | Mức | Mitigation |
|---|---|---|
| Table row split có thể không khả thi | Cao | Spike trước P3; fallback giữ hành vi cũ |
| `posAtCoords` không ổn định ở biên line box | Cao | Fallback về block-level cho block đó |
| Inline spacer phá caret / IME tiếng Việt | Cao | `ignoreSelection`, `contentEditable=false`; test IME riêng |
| Trang trắng thừa do rounding subpixel | Trung bình | `.print-page` height trừ hụt 1px hoặc dùng đơn vị mm khớp `@page size` |
| Header/footer mặc định của browser (URL, ngày) in đè | Thấp | Không tắt được bằng CSS — ghi doc hướng dẫn user bỏ tick trong dialog |
| Header text cao hơn vùng lề trên | Thấp | P1 clip, không đẩy content; ghi known limitation |
| Clone DOM lớn (50 trang) tốn memory lúc in | Thấp | Clone 1 lần, `.print-content` share qua CSS `content-visibility` nếu cần |

## 10. Out of scope

- Rich-text editable header/footer (chốt plain text + token).
- Docx import/export của header/footer & page number (`packages/docx-io`) — chưa bàn.
- Section break / khác lề theo section như Word.
- Orphan/widow control.

## 11. Next steps

1. `/ck:plan --tdd` với report này làm context.
2. Spike table row split trước khi lock P3.

## 12. Unresolved questions

- Header/footer có cần round-trip qua docx import/export không? (`packages/docx-io` đang có thay đổi chưa commit)
- `MAX_PAGES = 50` giữ nguyên hay nâng? In doc >50 trang sẽ bị chặn.
- Số trang có cần hiện trên `Statusbar` (hiện chỉ có word/char count) không?
