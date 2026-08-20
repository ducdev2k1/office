---
phase: 3
title: 'Page Setup Model & Token Renderer'
status: done
priority: P1
dependencies: [2]
effort: '0.75d'
---

# Phase 3: Page Setup Model & Token Renderer

## Overview

Mở rộng `PageSetup` + token renderer. Chia thành **3a** (tối thiểu để P4 chạy) và **3b** (header/footer đầy đủ, chỉ P5/P6 cần) để không bắt P4 chờ.

## 3a / 3b split

P4 chỉ cần **số trang**. Free-text header/footer, `{title}`, `{date}`, `headerMargin`/`footerMargin` chỉ có consumer thật ở P5/P6.

|        | Nội dung                                                                                    | Unblock |
| ------ | ------------------------------------------------------------------------------------------- | ------- |
| **3a** | `PageNumberSetup`, `renderTokens` cho `{page}`/`{pages}`, normalize trong `withDefaults`    | P4      |
| **3b** | `HeaderFooterSlot`, `{title}`/`{date}`, `headerMargin`/`footerMargin`, `resolveSlot` đầy đủ | P5, P6  |

## Requirements

**Functional**

- Token thay `{page}` `{pages}` `{title}` `{date}` bằng giá trị thật.
- `startAt` và `skipFirstPage` được tôn trọng.

**Non-functional**

- **Backward compatible tuyệt đối**: doc cũ trong IndexedDB thiếu field mới vẫn load và render bình thường.
- Renderer là pure function, không chạm DOM.
- Normalize **không** được phá identity của `activeDoc.pageSetup` (xem dưới).

## Architecture

### Model

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
  format: string; // '{page}' | '{page} / {pages}' | 'Trang {page}'
  startAt: number;
  skipFirstPage: boolean;
}

export interface PageSetup {
  paperSize: PaperSize;
  orientation: Orientation;
  margins: PageMargins;
  header?: HeaderFooterSlot; // 3b
  footer?: HeaderFooterSlot; // 3b
  headerMargin?: number; // 3b — mm từ mép trên. Default 10
  footerMargin?: number; // 3b — mm từ mép dưới. Default 10
  pageNumber?: PageNumberSetup; // 3a
}
```

`pageNumber.enabled` default **`false`** — không tự đổi diện mạo doc cũ của user.

### ⚠️ Normalize ĐÚNG MỘT CHỖ: `withDefaults`

Phiên bản trước ghi _"Gọi ở mọi chỗ hiện đang làm `?? DEFAULT_PAGE_SETUP()`. Grep các chỗ đó: `usePagination.ts`, `usePrintSetup.ts`, `EditorCanvas.tsx`, `PageSetupPanel.tsx`"_. **Sai sự thật.**

Grep thật:

- `EditorCanvas.tsx` — **0 hit** (chỉ forward callback `onPageSetupChange`)
- `PageSetupPanel.tsx` — **0 hit** (nhận `setup` qua prop)
- `usePagination.ts:37,103,117` — **3** site, không phải 1
- `docs.service.ts:20` — **read boundary thật**, không có trong danh sách cũ
- `import.service.ts:26` — cũng bỏ sót
- `DocRuler.tsx:34-36`, `DocVerticalRuler.tsx:27-36` — hardcode default song song (`?? 'a4'`, `?? { top: 20, ... }`), bỏ sót

Repo đã có normalizer đúng chỗ: `withDefaults()` tại `docs.service.ts:12-21`, chạy cho **cả** `loadDocs` (`:87`) và `saveDocs` (`:103`).

**Fix: một dòng, đúng boundary.**

```ts
// docs.service.ts:20
pageSetup: { ...DEFAULT_PAGE_SETUP(), ...doc.pageSetup },
```

Không tạo API `normalizePageSetup` mới, không rải ở call site UI.

### Vì sao KHÔNG normalize ở component

`normalizePageSetup(...)` gọi inline tạo **object mới mỗi render**. Hai chỗ vỡ cụ thể:

1. `PageSetupPanel.tsx:23-27` có `useEffect(() => setDraft(setup), [setup])`. Prop đổi identity mỗi render → effect chạy mỗi render → `setDraft` → re-render → **user không gõ được vào ô margin**, mỗi keystroke bị ghi đè. Dialog P6 copy đúng pattern này nên sẽ dính y hệt.
2. `usePagination.ts:102-126` có `useMemo(..., [activeDoc?.pageSetup])` → `pageStyle`/`viewportStyle` tính lại mỗi render → `EditorCanvas` re-render liên tục.

Normalize ở `withDefaults` giữ identity ổn định vì object chỉ tạo một lần khi đọc từ storage.

### `mmToPx` phải guard non-finite

`docs.types.ts:46` `mmToPx = (mm) => Math.round((mm * 96) / 25.4)`. Với `undefined` → `Math.round(NaN)` = `NaN`.

Hậu quả cụ thể ở P5: `--header-margin: NaNpx` là declaration invalid, bị CSS drop → `.page-header { top: <unset> }` trên box `position: absolute` rơi về static position tức y=0, nằm ngoài lề trên và **sau** `.doc-editor` (`z-index: 1`) → header vô hình hoặc đè text. **Không throw gì cả.**

Thêm guard: `mmToPx` reject input non-finite (trả `0` hoặc throw ở DEV) thay vì lan `NaN`.

### Token renderer (`editor/print/page-tokens.utils.ts`)

```ts
export interface TokenContext {
  page: number;
  pages: number;
  title: string;
  date: Date;
  locale: Locale;      // reuse type từ packages/i18n, KHÔNG widen thành string
}

export const renderTokens = (template: string, ctx: TokenContext): string;

export const resolveSlot = (
  slot: HeaderFooterSlot | undefined,
  pageNumber: PageNumberSetup | undefined,
  band: 'header' | 'footer',
  pageIndex: number,      // 0-based
  pageCount: number,
  ctx: Omit<TokenContext, 'page' | 'pages'>,
): Record<HFAlign, string>;
```

Quy tắc:

- `page = pageIndex + startAt`
- **`pages = pageCount`** — tổng số trang, như `NUMPAGES` của Word. Không phải `pageCount + startAt - 1`. `startAt=5`, doc 3 trang → `{page}` = 5,6,7 và `{pages}` = 3.
- `pageNumber.enabled` và `position === band` → chèn `renderTokens(format, ctx)` vào ô `align`.
- Ô đó đã có text từ `slot` → nối bằng khoảng trắng, không ghi đè.
- `skipFirstPage && pageIndex === 0` → bỏ số trang (text slot vẫn giữ).
- Token không nhận diện → giữ literal, không throw.

**`{date}`: reuse `packages/i18n/src/formatters.ts`** (`formatDateTime`, `LOCALE_TAGS` map `vi → vi-VN`, `en → en-US`). Không viết `Intl.DateTimeFormat` mới — DRY, và giữ được type `Locale` thay vì widen `string`.

## Related Code Files

- Modify: `apps/docs/src/types/docs.types.ts` — types mới, guard `mmToPx`
- Modify: `apps/docs/src/services/docs.service.ts:20` — spread default vào `withDefaults`
- Create: `apps/docs/src/modules/editor/print/page-tokens.utils.ts`
- Create: `apps/docs/src/modules/editor/print/page-tokens.utils.test.ts`
- Create: `apps/docs/src/services/docs.service.test.ts` — test `withDefaults` với doc cũ
- Modify: `apps/docs/src/modules/editor/hooks/usePagination.ts:37,103,117` — bỏ `?? DEFAULT_PAGE_SETUP()` thừa
- Modify: `apps/docs/src/components/ruler/DocRuler.tsx`, `DocVerticalRuler.tsx` — bỏ default hardcode song song

## Implementation Steps

**3a (unblock P4) — tests trước:**

1. `withDefaults`: doc không có `pageSetup` → full default; doc chỉ có `{paperSize, orientation, margins}` → giữ 3 field, điền phần còn lại; doc đầy đủ → giữ nguyên. **Identity ổn định** khi gọi lại với cùng input từ storage.
2. `mmToPx(undefined)` / `mmToPx(NaN)` → không trả `NaN`.
3. `renderTokens` cho `{page}`/`{pages}`: từng token; nhiều token; token lạ giữ literal; token lặp.
4. `resolveSlot` phần số trang: enabled false; đúng ô theo `align`; `position` khác `band`; `startAt=5` doc 3 trang → page 5,6,7 và **`{pages}` = 3**; `skipFirstPage`.
5. Implement 3a: `PageNumberSetup`, sửa `withDefaults:20`, guard `mmToPx`, `renderTokens` + `resolveSlot` (nhánh số trang).
6. Bỏ `?? DEFAULT_PAGE_SETUP()` ở 3 site `usePagination.ts` và default hardcode ở 2 file ruler.
7. Browser: doc cũ load không lỗi, paged view không đổi. → **P4 unblock**

**3b (cho P5/P6):**

8. Test `resolveSlot` phần slot: 3 ô căn lề; ô đã có text thì nối không ghi đè; `{title}`/`{date}`.
9. Implement `HeaderFooterSlot`, `headerMargin`/`footerMargin`, `{title}`/`{date}` qua `formatDateTime` của `packages/i18n`.

## Success Criteria

- [ ] `withDefaults` test ≥3 case xanh, identity ổn định
- [ ] `mmToPx` không bao giờ trả `NaN`
- [ ] `renderTokens` ≥4 case, `resolveSlot` ≥8 case xanh
- [ ] `{pages}` = tổng số trang, không phụ thuộc `startAt`
- [ ] Doc cũ trong IndexedDB load không lỗi, layout không đổi
- [ ] `PageSetupPanel` vẫn gõ được vào ô margin (không render loop)
- [ ] `page-tokens.utils.ts` không tham chiếu `document` / `window`
- [ ] Không có `Intl.DateTimeFormat` mới — dùng `packages/i18n/formatters`
- [ ] `pnpm typecheck` + `pnpm test` xanh

## Risk Assessment

| Rủi ro                                                                     | Mitigation                                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Normalize phá identity → render loop, không gõ được                        | Normalize ở `withDefaults` (storage boundary), không ở component. Test case "gõ vào ô margin" |
| `mmToPx(undefined)` = `NaN` → CSS var invalid, header đè text, không throw | Guard trong `mmToPx`; test tường minh                                                         |
| Doc cũ vỡ vì thiếu field                                                   | Field mới optional + spread default ở `withDefaults` phủ cả load lẫn save                     |
| `{date}` lệch giữa các trang                                               | Truyền `date` từ ngoài qua `TokenContext`, tính 1 lần ở call site                             |
| Duplicate logic locale với `packages/i18n`                                 | Reuse `formatDateTime` + type `Locale`                                                        |
