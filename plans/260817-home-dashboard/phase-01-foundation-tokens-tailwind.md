# Phase 1: Foundation — token `--o-kind-*`, Tailwind quét packages, skeleton package

## Overview

- **Priority**: P1 | **Status**: done | **Effort**: 2h
- Muc tieu: xac nhan Tailwind v4 build duoc source trong workspace packages (spike rui ro lon nhat), them token phan biet loai file, duong khung 2 package moi.

## Requirements

1. Token moi trong `packages/ui-kit/src/tokens.css`:
   ```css
   --o-kind-docs:   var(--o-primary);
   --o-kind-sheets: var(--info);
   --o-kind-slides: var(--o-accent);
   ```
   (light + dark block — info/accent da co ca 2.)
2. Tailwind v4 quet duoc CSS trong `packages/`: them `@source "../../packages"` vao CSS entry cua apps/docs.
3. Skeleton 2 package: `packages/app-shell` + `packages/file-home` — `package.json`, `tsconfig.json` noi theo `packages/ui-kit`, export index.ts rong.
4. Verify: app docs van build/typecheck sau khi them `@source`.

## Architecture

- **ui-kit**: giu token — `--o-kind-*` la semantic alias, neu `--info`/`--accent` khong du tuong phan thi them gia tri cung hue moi (van dam bao WCAG AA).
- **Tailwind**: `@tailwindcss/vite` da cai o apps/docs. Cau hinh `@source` trong styles.css goc de bao gom `../../packages/*/src/**/*.{ts,tsx}`.
- **packages moi**: dependency `@base-ui/react`, `clsx`, `class-variance-authority`, `tailwind-merge` (gio nhu ui-kit); peer `react`/`react-dom`.

## Implementation Steps

1. `ui-kit/tokens.css`: them 3 token `--o-kind-*` vao ca `:root/.light` va `.dark`.
2. `apps/docs/src/styles.css`: them `@source "../../packages";` (dung vi tri voi cac source khac).
3. Tao `packages/app-shell/{package.json,tsconfig.json,src/index.ts}` + `src/ShellLayout.tsx` stub.
4. Tao `packages/file-home/{package.json,tsconfig.json,src/index.ts}` + `src/types.ts` stub (FileRecord, ProductConfig placeholder).
5. Them 2 package vao pnpm-workspace (neu can) + `pnpm install`.
6. Verify: `pnpm --filter @office/docs typecheck` + `pnpm --filter @office/docs build` pass; mot class Tailwind thu (vd `bg-red-500` trong stub) co trong bundle CSS.

## Todo List

- [ ] Token --o-kind-* (light + dark)
- [ ] @source packages trong Tailwind
- [ ] Skeleton app-shell + file-home
- [ ] typecheck + build pass
- [ ] Xac nhan utility class tu packages xuat hien trong bundle

## Success Criteria

- `pnpm typecheck` va `pnpm build` pass.
- CSS bundle chua it nhat 1 class duoc gen tu source ben trong `packages/` (chung minh Tailwind scan on).
- Token `--o-kind-*` co o ca theme.

## Risk Assessment

| Risk | Mitigation |
| --- | --- |
| Tailwind v4 khong quet source trong packages (rui ro lon nhat) | Phase nay la spike dau tien; neu that bai thi chuyen huong: build CSS trong package hoac duong dan `@source` tuyet doi |
| Token --o-kind trung mau nhau (green giong blue trong dark) | Kiem tra tuong phan 2 theme, dieu chinh gia tri cung hue |

## Next Steps

- Chuyen sang Phase 2 (app-shell + router) khi Tailwind build packages on.
