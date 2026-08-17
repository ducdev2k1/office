# Phase 2: app-shell — TopBar + ShellLayout + ProductSwitcher + Router

## Overview

- **Priority**: P1 | **Status**: done | **Effort**: 3h
- Muc tieu: them react-router-dom, tach App.tsx thanh HomePage (`/`) va EditorPage (`/edit/:id`), dung `@office/app-shell` TopBar dung chung (search placeholder, theme toggle, avatar, product switcher).

## Requirements

1. `react-router-dom` them vao apps/docs dependencies.
2. `apps/docs/src/main.tsx`: bao `BrowserRouter`.
3. Tach App.tsx:
   - `routes/HomePage.tsx` — mount TopBar (shell) + FileHome (Phase 3, tam la placeholder).
   - `routes/EditorPage.tsx` — noi dung App.tsx hien tai nguyen ven (chi doi cach mount + doc id tu `useParams`).
   - `App.tsx` → `AppRoutes.tsx` voi `<Routes>`.
4. `@office/app-shell`:
   - `ShellLayout.tsx` — khung TopBar + children, dung token workspace bg.
   - `TopBar.tsx` — hamburger, product identity (logo + ten), search input (onChange prop, trong home filter file), phai: theme toggle (theme.ts ui-kit), avatar.
   - `ProductSwitcher.tsx` — Base UI Menu: Docs (active) / Sheets / Slides (disabled, "Sap co"); nut la hien `--o-kind-*` icon.
5. HomePage truyen search state xuong (sau nay cho FileHome filter).

## Architecture

- **TopBar** props-driven: `{ product: ProductConfig-ish, onSearch, searchQuery, theme, onToggleTheme }` — khong biet file, chi la khung.
- **EditorPage**: giu nguyen toan bo editor logic. Lay doc bang `useDocs` + id tu params; neu khong ton tai -> redirect `/`.
- **Back**: thay nut "‹" sidebar cung them link ve `/` trong editor header.

## Implementation Steps

1. `pnpm --filter @office/docs add react-router-dom`.
2. `app-shell`: ShellLayout + TopBar + ProductSwitcher (Tailwind + Base UI Menu), export qua index.ts.
3. `main.tsx` + router + tach EditorPage (copy App.tsx hien tai, bo sidebar state? GIU NGUYEN cho an toan).
4. HomePage: TopBar + placeholder (FileHome stub tu Phase 1, se lap day o Phase 3).
5. Back link `/` trong EditorPage (tren Header: onMenuToggle giu, them lối ve home).
6. Verify: `pnpm --filter @office/docs typecheck` + build; manual: mo `/`, mo `/edit/doc-roadmap`, back ve `/`.

## Todo List

- [ ] Them react-router-dom
- [ ] app-shell: ShellLayout + TopBar + ProductSwitcher
- [ ] main.tsx + BrowserRouter
- [ ] Tach HomePage / EditorPage (editor giu nguyen)
- [ ] Back link ve home
- [ ] typecheck + build + smoke routing

## Success Criteria

- Route `/` va `/edit/:id` chay, back/xuyen link on.
- Editor khong regression (logic nguyen ven).
- TopBar hien thi dung o ca home lan editor (search o home loc — phan Phase 3).

## Risk Assessment

| Risk | Mitigation |
| --- | --- |
| Refactor App.tsx gay regression editor | Copy hien tai nguyen ven thanh EditorPage truoc, chi sua lop mount; typecheck ngay |
| Khong co activeId khi mo /edit/:id | Lay id tu params, setActiveId bang useEffect |

## Next Steps

- Phase 3: lap day FileHome (tabs, list, search, create) tren HomePage.
