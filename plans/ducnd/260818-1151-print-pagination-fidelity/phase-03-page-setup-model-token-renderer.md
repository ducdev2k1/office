---
phase: 3
title: "Page Setup Model & Token Renderer"
status: pending
priority: P1
dependencies: [2]
effort: "0.5d"
---

# Phase 3: Page Setup Model & Token Renderer

## Overview

Mở rộng `PageSetup` để chứa header/footer + cấu hình số trang, và viết token renderer dùng chung cho cả màn hình (P5) lẫn bản in (P4). Pure logic, test-first, chưa đụng UI.

## Requirements

**Functional**
- `PageSetup` chứa `header`, `footer`, `headerMargin`, `footerMargin`, `pageNumber`.
- Token renderer thay `{page}` `{pages}` `{title}` `{date}` bằng giá trị thật.
- `startAt` và `skipFirstPage` được tôn trọng.

**Non-functional**
- **Backward compatible tuyệt đối**: doc cũ trong IndexedDB thiếu field mới vẫn load và render bình thường.
- Renderer là pure function, không chạm DOM.

## Architecture

### Model (`types/docs.types.ts`)

```ts
export type HFAlign = 'left' | 'center' | 'right';

export interface HeaderFooterSlot {
  left: string;
  center: string;
  right: string;
}

export interface PageNumberSetup {
  enabled: boolean;
  position: 'header' | 'footer';
  align: HFAlign;
  format: string;          // '{page}' | '{page} / {pages}' | 'Trang {page}'
  startAt: number;
  skipFirstPage: boolean;
}

export interface PageSetup {
  paperSize: PaperSize;
  orientation: Orientation;
  margins: PageMargins;
  header?: HeaderFooterSlot;      // MỚI, optional
  footer?: HeaderFooterSlot;      // MỚI, optional
  headerMargin?: number;          // mm từ mép trên tới header. Default 10
  footerMargin?: number;          // mm từ mép dưới tới footer. Default 10
  pageNumber?: PageNumberSetup;   // MỚI, optional
}
```

Tất cả field mới **optional** → `DocRecord.pageSetup` cũ deserialize vẫn hợp lệ, không cần migration.

`DEFAULT_PAGE_SETUP()` bổ sung:
```ts
header: { left: '', center: '', right: '' },
footer: { left: '', center: '', right: '' },
headerMargin: 10,
footerMargin: 10,
pageNumber: {
  enabled: false, position: 'footer', align: 'center',
  format: '{page}', startAt: 1, skipFirstPage: false,
},
```

`pageNumber.enabled` default `false` — không tự đổi diện mạo doc cũ của user. User bật ở P6.

### Normalizer

Doc cũ có `pageSetup` nhưng thiếu field mới → cần merge với default khi đọc, không phải khi ghi:

```ts
export const normalizePageSetup = (setup?: Partial<PageSetup>): PageSetup
```

Gọi ở mọi chỗ hiện đang làm `activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP()`. Grep các chỗ đó: `usePagination.ts`, `usePrintSetup.ts`, `EditorCanvas.tsx`, `PageSetupPanel.tsx`.

### Token renderer (`editor/print/page-tokens.utils.ts`)

```ts
export interface TokenContext {
  page: number;        // số trang đã áp startAt
  pages: number;       // tổng, đã áp startAt
  title: string;
  date: Date;
  locale: string;
}

export const renderTokens = (template: string, ctx: TokenContext): string;

/** Trả text 3 ô của header hoặc footer cho 1 trang. '' nếu trang bị skip. */
export const resolveSlot = (
  slot: HeaderFooterSlot | undefined,
  pageNumber: PageNumberSetup | undefined,
  band: 'header' | 'footer',
  pageIndex: number,      // 0-based
  pageCount: number,
  ctx: Omit<TokenContext, 'page' | 'pages'>,
): Record<HFAlign, string>;
```

Quy tắc `resolveSlot`:
- `page = pageIndex + startAt`, `pages = pageCount + startAt - 1`
- Nếu `pageNumber.enabled` và `pageNumber.position === band`: chèn `renderTokens(pageNumber.format, ctx)` vào ô `pageNumber.align`.
- Nếu ô đó **đã có** text từ `slot` → nối bằng khoảng trắng, không ghi đè.
- Nếu `skipFirstPage && pageIndex === 0` → bỏ số trang (text slot vẫn giữ, giống Google Docs).
- Token không nhận diện được → giữ nguyên literal, không throw.
- `{date}` format theo `locale` (`vi` / `en`) qua `Intl.DateTimeFormat`.

## Related Code Files

- Modify: `apps/docs/src/types/docs.types.ts` — thêm types, `normalizePageSetup`, cập nhật `DEFAULT_PAGE_SETUP`
- Create: `apps/docs/src/modules/editor/print/page-tokens.utils.ts`
- Create: `apps/docs/src/modules/editor/print/page-tokens.utils.test.ts`
- Create: `apps/docs/src/types/docs.types.test.ts` — test `normalizePageSetup`
- Modify: `apps/docs/src/modules/editor/hooks/usePagination.ts` — dùng `normalizePageSetup`
- Modify: `apps/docs/src/modules/editor/hooks/usePrintSetup.ts` — dùng `normalizePageSetup`
- Modify: `apps/docs/src/modules/editor/components/EditorCanvas.tsx` — dùng `normalizePageSetup`

## Implementation Steps

**Tests trước:**

1. `normalizePageSetup`: `undefined` → full default; object cũ chỉ có `{paperSize, orientation, margins}` → giữ nguyên 3 field đó, điền default phần còn lại; object đầy đủ → giữ nguyên.
2. `renderTokens`: từng token; nhiều token 1 chuỗi; token lạ `{foo}` giữ literal; chuỗi rỗng; token lặp `{page}-{page}`.
3. `resolveSlot`:
   - `pageNumber.enabled === false` → chỉ text slot
   - số trang vào đúng ô theo `align`
   - `position` khác `band` → band này không có số trang
   - `startAt: 5`, 3 trang → page lần lượt 5,6,7; `pages` = 7
   - `skipFirstPage` → trang 0 không có số, trang 1 có
   - ô đã có text → nối chứ không ghi đè
   - `{pages}` đúng tổng

**Rồi implement:**

4. Thêm types + `normalizePageSetup` vào `docs.types.ts`.
5. Viết `page-tokens.utils.ts`.
6. Thay các chỗ `?? DEFAULT_PAGE_SETUP()` bằng `normalizePageSetup(...)`.
7. Chạy test + typecheck.
8. Mở browser xác nhận doc cũ vẫn load, paged view không đổi.

## Success Criteria

- [ ] Test `normalizePageSetup` ≥3 case xanh
- [ ] Test `renderTokens` ≥5 case xanh
- [ ] Test `resolveSlot` ≥7 case xanh
- [ ] Doc cũ trong IndexedDB load lên không lỗi, layout không đổi
- [ ] `page-tokens.utils.ts` không tham chiếu `document` / `window`
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Doc cũ vỡ vì thiếu field | Field mới đều optional + `normalizePageSetup` ở điểm đọc; test case doc cũ |
| `pageNumber.enabled` default `true` làm đổi diện mạo doc cũ | Default `false`, user tự bật ở P6 |
| `{date}` khác nhau giữa màn hình và bản in (2 lần gọi `new Date()`) | Truyền `date` từ ngoài vào qua `TokenContext`, tính 1 lần ở call site |
