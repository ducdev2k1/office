# Phase 5: Polish + Verify — skeleton/relative time/a11y, storage estimate, demo reuse, build

## Overview

- **Priority**: P1 | **Status**: done | **Effort**: 3h
- Muc tieu: hoan thien trang thai loading/rong/relative time, dung luong storage thuc (`navigator.storage.estimate()` thay `JSON.stringify`), chung minh tai dung bang route demo kind='sheets', chay typecheck/build/lint + smoke test toan bo.

## Requirements

1. **Skeleton loading**: HomePage render skeleton rows khi `useDocs` dang load IndexedDB (docs.length==0 && chua init).
2. **Relative time**: `Intl.RelativeTimeFormat('vi-VN')` — "2 phút trước", "Hôm qua"; helper `formatRelativeTime` trong file-home.
3. **Storage estimate**: StatsCards nhan dung luong tu `navigator.storage.estimate()` (qua 1 util trong file-home), bo `getStorageUsageBytes` (JSON.stringify length sai voi IndexedDB).
4. **Empty states** hoan thien: chua co file (CTA tao moi), khong co ket qua tim kiem (nut "Xóa tìm kiếm"), thung rac rong.
5. **A11y**: tablist/tab roles, grid roles cho bang, focus management dialog, Enter mo file, contrast WCAG AA (check --o-kind-* ca 2 theme).
6. **Demo reuse**: route `/demo/sheets` (phat trien) mount FileHome voi `ProductConfig` kind='sheets' + 2-3 file gia — chung minh component tai dung khong sua.
7. **Verify**: `pnpm typecheck` (toan repo), `pnpm build`, `pnpm lint`; smoke test checklist.

## Architecture

- **formatRelativeTime**: util thuân `file-home/src/lib/time.ts`, dung `Intl.RelativeTimeFormat`, fallback gioi han (qua 30 ngay -> ngay thang).
- **storage.estimate**: util async `file-home/src/lib/storage.ts`; HomePage goi 1 lan + refresh khi docs doi.
- **Demo route**: chi o dev (conditional), khong de vao build production nham tranh nham lan.

## Implementation Steps

1. file-home lib/time.ts + lib/storage.ts.
2. Skeleton component + gan vao HomePage.
3. StatsCards: nhan storageMB prop tu estimate.
4. Empty states hoan thien (3 kieu).
5. A11y pass review cac component (roles, focus, contrast).
6. Route /demo/sheets (dev only) voi config sheets + fake files.
7. Cap nhat README + docs/architecture.md: ghi nhan home dashboard, 2 package moi, hop dong ProductConfig.
8. Verify toan repo + smoke test.

## Todo List

- [x] Relative time util
- [x] Storage estimate util + StatsCards
- [x] Skeleton loading
- [x] Empty states (3 kieu)
- [x] A11y review + fix
- [x] Demo route /demo/sheets (dev)
- [x] Cap nhat README + architecture.md
- [x] typecheck + build + lint toan repo
- [x] Smoke test checklist

## Success Criteria

- `pnpm typecheck`, `pnpm build`, `pnpm lint` pass toan monorepo.
- Home hien skeleton khi load; dung luong la so thuc tu IndexedDB.
- Route demo 'sheets' render dung icon/mau/label tu ProductConfig — khong sua FileHome.
- Khong console error; a11y co ban dat WCAG AA.
- Toan bo tinh nang editor + home chay on (smoke checklist).

## Risk Assessment

| Risk                                  | Mitigation                                                  |
| ------------------------------------- | ----------------------------------------------------------- |
| Relative time lech timezone           | Dung Intl voi timezone local, unit gan dung (phut/gio/ngay) |
| Demo route vao production             | Guard NODE_ENV !== 'production'                             |
| storage.estimate khong chinh xac 100% | Hien "~", dung lam chi so gan dung                          |

## Next Steps

- Chuyen sang plan M1 (roadmap): storage-adapter + IndexedDB hoan thien, File System Access API, PWA — home dashboard da san san ket noi Drive.
- Khi xay sheets/slides: dung `@office/file-home` voi ProductConfig moi, khong can sua component.
