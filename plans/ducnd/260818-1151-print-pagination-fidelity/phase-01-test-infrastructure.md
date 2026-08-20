---
phase: 1
title: 'Test Infrastructure'
status: done
priority: P1
dependencies: []
effort: '1d'
---

# Phase 1: Test Infrastructure

## Overview

Dựng hạ tầng test tối thiểu **có khả năng bắt lỗi thật**. Red team chứng minh phiên bản trước của phase này sẽ tạo ra harness pass rỗng: không có cách nạp doc fixture, và assertion đếm trang là phép so một số với chính nó.

## Requirements

**Functional**

- `pnpm test` chạy được ở root qua turbo, `pnpm typecheck` vẫn xanh.
- Nạp được doc fixture có độ dài và `pageSetup` tuỳ ý vào headless Chrome.
- Assertion phát hiện được **mất nội dung** và **cắt giữa dòng**, không chỉ lệch số trang.

**Non-functional**

- Không thêm dependency nào ngoài `vitest`. Không Playwright, không Puppeteer, không thư viện PDF.
- Script CDP dùng `WebSocket` global của Node 22+ (repo đang v24.14.0).

## Architecture

### Vì sao không dùng jsdom cho engine

`computePageBreaks` đọc layout thật: `el.offsetHeight`, `getComputedStyle(el).marginTop`, P7 thêm `Range.getClientRects()`. jsdom **không implement layout** — `offsetHeight` trả `0`, `getClientRects()` trả rỗng. Test jsdom cho engine = test mock.

P2 tách pure function nhận `BlockMeasurement[]` → vitest test thuật toán bằng fixture số.

### Fixture seeding — bắt buộc, không có thì harness vô nghĩa

Doc sống trong IndexedDB, địa chỉ qua `/edit/:id` (`App.tsx:8-11`). Chrome headless profile mới có IndexedDB rỗng → app seed 2 starter doc ngắn (`docs.service.ts:33-55`). Không có route `?fixture=`, không có cách đổi `paperSize`/`orientation` bằng URL.

Giải pháp: expose một hook DEV-only, gọi qua `Runtime.evaluate`:

```ts
// chỉ trong import.meta.env.DEV
window.__seedDoc = async (spec: {
  blocks: number; // số paragraph sinh tự động
  paperSize?: PaperSize;
  orientation?: Orientation;
  margins?: Partial<PageMargins>;
}) => Promise<string>; // trả docId để navigate tới /edit/:id
```

Đặt ở một module `dev/` riêng, import có điều kiện — không nằm trong `usePagination.ts`.

### Đọc page count không cần backdoor production

Không thêm `window.__pageCount` vào `usePagination.ts`. `.page-stack` đã render đúng `pageCount` phần tử `.page` (`EditorCanvas.tsx:126-131`):

```js
Runtime.evaluate("document.querySelectorAll('.page-stack .page').length");
```

Zero thay đổi production code.

### Assertion: text continuity, KHÔNG phải đếm trang

P4 dựng đúng `pageCount` phần tử `break-after: page` → số trang PDF bằng `pageCount` **theo cấu trúc**. Assert `pdfPages === pageCount` là tautology; nó sẽ xanh ngay cả khi nội dung bị mất hoặc wrap lệch.

Assertion thật:

```
1. Sinh fixture với nội dung đánh dấu được: mỗi paragraph bắt đầu bằng "[[N]]"
2. pdftotext -layout out.pdf -   → text theo trang (phân cách \f)
3. Kiểm: dãy marker [[1]]..[[N]] xuất hiện ĐẦY ĐỦ, ĐÚNG THỨ TỰ, KHÔNG TRÙNG
   → bắt mất nội dung (Finding 1) và lặp nội dung (double-build)
4. Kiểm: không marker nào bị cắt cụt giữa chừng
   → bắt cắt giữa dòng (Finding 2, Finding 7)
5. pdfinfo out.pdf | grep ^Pages  → so với số .page trên màn hình
   → chỉ dùng bắt trang trắng thừa
```

`pdftotext` và `pdfinfo` đều thuộc poppler, đã có tại `/usr/bin/`.

### Script flow

```
scripts/print-check.mjs
  1. poll dev server (port 2001, KHÔNG phải 5173) tới khi 200, timeout 30s
  2. spawn google-chrome --headless=new --remote-debugging-port=<random>
  3. fetch /json/version → webSocketDebuggerUrl → new WebSocket (global, Node 22+)
  4. Page.navigate tới app; Runtime.evaluate window.__seedDoc(spec) → docId
  5. Page.navigate /edit/:docId
  6. chờ document.fonts.ready, rồi poll .page-stack .page length tới khi ổn định
     (2 lần đọc liên tiếp bằng nhau) — không dùng delay cố định
  7. Page.printToPDF { preferCSSPageSize: true, printBackground: true }
  8. ghi PDF ra scratch, chạy pdftotext + pdfinfo, chạy assertion
  9. finally: kill Chrome
```

### Pin font local — quyết định ở validation

`styles.css:1` load **Google Sans + Roboto** qua `@import` từ fonts.googleapis.com.

Đây không chỉ là vấn đề test. **User offline in ra sẽ dùng font fallback → metric khác → số trang lệch khỏi màn hình**, tức hỏng đúng yêu cầu gốc. Harness offline cũng không tái lập được kết quả.

Quyết định: **pin cả hai font vào repo**, bỏ `@import` CDN. Vẫn giữ `document.fonts.ready` ở bước 6 vì font local cũng cần thời gian load.

<!-- Updated: Validation Session 1 - pin font local thay vì chỉ chờ fonts.ready -->

### tsconfig — nếu không xử lý, `pnpm typecheck` đỏ ngay

`apps/docs/tsconfig.json:12` có `include: ["src", "vite.config.ts"]`. Test file trong `src/` sẽ bị `tsc --noEmit` biên dịch nhưng không có type của vitest. Và `lint` = `tsc --noEmit` nên `pnpm lint` cũng đỏ.

Xử lý: thêm `"vitest.config.ts"` vào `include`, và **import tường minh** `import { describe, it, expect } from 'vitest'` trong mọi test (không dùng globals — tránh phải thêm `types` vào tsconfig chung).

`tsconfig.base.json:17` có `noUncheckedIndexedAccess: true` → `blocks[i]` ra `T | undefined`. Ghi chú này áp cho P2 và P7.

## Related Code Files

- Create: `apps/docs/vitest.config.ts`
- Create: `apps/docs/src/dev/seed-print-fixture.ts` (DEV-only, `window.__seedDoc`)
- Create: `scripts/print-check.mjs`
- Create: `apps/docs/public/fonts/` — Google Sans + Roboto (woff2, các weight đang dùng: 400/500/600/700 và 400/500/700)
- Modify: `apps/docs/src/assets/styles/styles.css:1` — bỏ `@import` CDN, thay bằng `@font-face` local
- Modify: `apps/docs/tsconfig.json` — thêm `vitest.config.ts` vào `include`
- Modify: `apps/docs/package.json` — script `test`, devDep `vitest`
- Modify: `package.json` (root) — script `test`
- Modify: `turbo.json` — task `test`
- Modify: `apps/docs/src/main.tsx` hoặc `App.tsx` — import có điều kiện module dev

## Implementation Steps

1. `pnpm --filter @office/docs add -D vitest`
2. `apps/docs/vitest.config.ts`: environment `node`, `include: ['src/**/*.test.ts']`, alias `'@' → ./src` (khớp `vite.config.ts:8-10`).
3. Thêm `"vitest.config.ts"` vào `include` của `apps/docs/tsconfig.json`.
4. Scripts: `"test": "vitest run"` (apps/docs), `"test": "turbo test"` (root), task `test` trong `turbo.json` (`dependsOn: ["^test"]`, `outputs: []`).
5. Viết `src/smoke.test.ts` với import tường minh từ `vitest`. Chạy `pnpm test` **và** `pnpm typecheck` — cả hai phải xanh. Xoá ở P2.
6. Viết `src/dev/seed-print-fixture.ts`: sinh HTML `blocks` paragraph, mỗi cái mở đầu `[[N]]`, tạo `DocRecord` qua đường `docs.service` hiện có, trả `docId`. Import có điều kiện `import.meta.env.DEV`.
7. Viết `scripts/print-check.mjs` theo flow trên. Nhận `--blocks`, `--paper`, `--orientation`.
8. **Pin font local**: tải Google Sans + Roboto woff2 vào `apps/docs/public/fonts/`, thay `@import` CDN ở `styles.css:1` bằng `@font-face`. Verify không còn request nào ra fonts.googleapis.com (devtools Network, filter domain).
9. Chạy end-to-end trên doc 3 trang, xác nhận assertion marker chạy đúng.
10. **Chạy trên doc 40 trang** để có sẵn fixture cho spike gate ở P2b.

## Success Criteria

- [ ] `pnpm test` xanh ở root
- [ ] `pnpm typecheck` xanh **sau khi** đã có file `.test.ts` trong `src/`
- [ ] `node scripts/print-check.mjs --blocks 200 --paper a4 --orientation portrait` chạy được end-to-end
- [ ] Assertion marker phát hiện được mất nội dung: thử xoá tay 1 `.print-page` → script phải fail
- [ ] Assertion phát hiện được nội dung lặp: thử build 2 lần → script phải fail
- [ ] Script tự kill Chrome trong `finally`, kể cả khi lỗi
- [ ] Không thêm dependency nào ngoài `vitest`
- [ ] Không có `window.__pageCount` trong production code
- [ ] **Không còn request nào ra fonts.googleapis.com** — font đã pin local
- [ ] Chạy `print-check.mjs` hai lần cho cùng fixture → kết quả giống hệt (tái lập được)

## Risk Assessment

| Rủi ro                                                                     | Mitigation                                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Font CDN không load offline → user in ra số trang lệch, test không tái lập | **Pin font local** (bước 8); vẫn chờ `document.fonts.ready`                                       |
| Pin font làm tăng bundle / đổi rendering nhẹ                               | Chỉ lấy weight đang dùng, woff2; so sánh screenshot trước/sau                                     |
| `__seedDoc` rò vào production bundle                                       | Module riêng trong `dev/`, import có điều kiện `import.meta.env.DEV`, kiểm bundle sau khi compile |
| Poll page count không bao giờ ổn định (pagination loop)                    | Timeout 10s + fail rõ ràng, đó cũng là tín hiệu bug thật                                          |
| Port 2001 bị chiếm                                                         | Đọc port từ `vite.config.ts` hoặc nhận qua `--port`                                               |
| `pdftotext -layout` gộp/tách dòng khác kỳ vọng                             | Assertion dựa trên **marker `[[N]]`**, không dựa vào layout dòng chính xác                        |
