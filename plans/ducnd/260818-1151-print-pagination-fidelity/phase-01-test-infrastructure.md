---
phase: 1
title: "Test Infrastructure"
status: pending
priority: P1
dependencies: []
effort: "0.5d"
---

# Phase 1: Test Infrastructure

## Overview

Repo chưa có test nào. Dựng hạ tầng tối thiểu để P2/P7 rewrite engine mà không regression thầm lặng. Hai đường: vitest cho pure algorithm, script CDP zero-dep cho print fidelity.

## Requirements

**Functional**
- `pnpm test` chạy được ở root, đi qua turbo.
- Script kiểm print fidelity chạy được bằng `node`, không cần cài dependency.

**Non-functional**
- Không thêm dependency nào ngoài `vitest`. Không Playwright, không Puppeteer.
- Script CDP dùng `WebSocket` global của Node 22+ (repo đang Node v24.14.0).

## Architecture

### Vì sao không dùng jsdom cho engine

`computePageBreaks` đọc layout thật: `el.offsetHeight`, `getComputedStyle(el).marginTop`, và P7 sẽ dùng `Range.getClientRects()`. jsdom **không implement layout** — `offsetHeight` trả `0`, `getClientRects()` trả mảng rỗng. Test jsdom cho engine = test mock, cho cảm giác an toàn sai.

Giải pháp: P2 tách pure function nhận `BlockMeasurement[]` → vitest test thuật toán bằng fixture số, không cần DOM.

### Print fidelity check (zero-dep)

```
scripts/print-check.mjs
  1. spawn google-chrome --headless=new --remote-debugging-port=<port> --no-first-run
  2. fetch http://127.0.0.1:<port>/json/version  → webSocketDebuggerUrl
  3. new WebSocket(...)  (global, Node 22+)
  4. Page.navigate → dev server URL với doc fixture
  5. Runtime.evaluate  → đọc window.__pageCount (do usePagination expose ở dev)
  6. Page.printToPDF { preferCSSPageSize: true, printBackground: true }
  7. decode base64 → đếm số lần xuất hiện "/Type /Page" (không tính "/Pages")
  8. so sánh, exit code 0/1
```

`preferCSSPageSize: true` bắt buộc — để `@page { size }` của app quyết định khổ giấy chứ không phải mặc định Letter của CDP.

Bước 5 cần app expose page count ở dev mode. Thêm ở `usePagination.ts` (guard `import.meta.env.DEV`):
```ts
if (import.meta.env.DEV) (window as any).__pageCount = result.breaks.length + 1;
```

## Related Code Files

- Create: `apps/docs/vitest.config.ts`
- Create: `scripts/print-check.mjs`
- Create: `apps/docs/src/modules/editor/utils/__fixtures__/` (thư mục rỗng, P2 đổ fixture vào)
- Modify: `package.json` (root) — thêm script `test`
- Modify: `apps/docs/package.json` — thêm script `test`, devDep `vitest`
- Modify: `turbo.json` — thêm task `test`
- Modify: `apps/docs/src/modules/editor/hooks/usePagination.ts` — expose `__pageCount` ở DEV

## Implementation Steps

1. `pnpm --filter @office/docs add -D vitest`
2. Tạo `apps/docs/vitest.config.ts`: environment `node`, `include: ['src/**/*.test.ts']`, reuse alias `@/` từ `vite.config.ts`.
3. Thêm `"test": "vitest run"` vào `apps/docs/package.json`; `"test": "turbo test"` vào root.
4. Thêm task `test` vào `turbo.json` (`dependsOn: ["^test"]`, `outputs: []`).
5. Viết 1 test smoke (`src/smoke.test.ts`) để xác nhận runner chạy — xoá ở P2 khi có test thật.
6. Expose `window.__pageCount` trong `usePagination.ts`, bọc `import.meta.env.DEV`.
7. Viết `scripts/print-check.mjs` theo kiến trúc trên. Nhận `--url`, `--expect-pages` (optional). Tự spawn và kill Chrome.
8. Chạy thử end-to-end với dev server đang chạy, xác nhận đếm được số trang PDF.

## Success Criteria

- [ ] `pnpm test` chạy xanh ở root
- [ ] `node scripts/print-check.mjs --url http://localhost:5173/...` in ra số trang PDF và số trang màn hình
- [ ] Script tự kill Chrome khi xong, kể cả khi lỗi (`finally`)
- [ ] Không thêm dependency nào ngoài `vitest`
- [ ] `pnpm typecheck` xanh

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Đếm `/Type /Page` sai vì PDF nén stream | Chrome xuất PDF không nén phần page tree; nếu sai, fallback parse `/Count N` trong `/Type /Pages` root |
| `--headless=new` khác layout so với headful | Ghi nhận; khi nghi ngờ chạy lại headful bằng `--remote-debugging-port` không kèm `--headless` |
| Port 9222 bị chiếm | Random port, đọc lại từ `/json/version` |
| Dev server chưa sẵn sàng khi script chạy | Poll URL tới khi 200, timeout 30s |
