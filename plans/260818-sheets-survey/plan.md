---
title: 'Sheets Survey - Khao sat Univer OSS truoc khi vao Giai doan 6'
description: 'Prototype chay that Univer v0.23 + do hieu nang + checklist gap + bao cao go/no-go'
status: completed
priority: P1
effort: 42h
branch: main
tags: [research, prototype, sheets, univer]
created: 2026-08-18
---

# Plan: Khao sat Univer cho Giai doan 6 (Sheets)

## Overview

Khao sat Univer v0.23.0 stable cho `apps/sheets` truoc khi dau tu sau. Khong code san pham — chi prototype chay that + do hieu nang + checklist gap tinh nang + bao cao go/no-go + de xuat pham vi MVP.

**Bat buoc**: Khong dung bat ky package Pro/AGPL nao. Chi danh gia Univer OSS (Apache-2.0).

**Phat hien chot tu research**: Import/export xlsx, charts, collaboration, print, pivot — toan bo Pro-only. `xlsx-io` (ExcelJS) bat buoc tu lam. Collaboration Yjs hoãn. Charts danh gia community plugin.

## Phases

| #  | Phase                                                                 | File                                         | Effort | Status     |
|----|-----------------------------------------------------------------------|----------------------------------------------|--------|------------|
| 1  | Scaffold `apps/sheets` + Univer prototype + nhung app-shell           | `phase-01-scaffold-univer-prototype.md`      | 8h     | completed  |
| 2  | Khao sat chieu doc xlsx + pipeline ExcelJS → Univer snapshot          | `phase-02-xlsx-import-pipeline.md`           | 12h    | completed  |
| 3  | Do hieu nang (bundle, load time, scroll) + checklist gap tinh nang    | `phase-03-perf-measure-gap-checklist.md`     | 12h    | completed  |
| 4  | Viet bao cao + de xuat MVP + quyet dinh go/no-go                     | `phase-04-report-go-no-go.md`                | 10h    | completed  |

**Tong effort: 42h (~5–8 ngay lam viec)**

## Dependencies

- Phase 1 truoc tat ca (co prototype chay moi do duoc).
- Phase 2 bat dau ngay sau Phase 1.
- Phase 3 bat dau khi Phase 2 xong (can co xlsx pipeline de test hieu nang).
- Phase 4 cuoi cung, sau khi co du lieu tu 3 phase truoc.

## Ghi chu ky thuat

- **Univer v0.23.0**: dung `@univerjs/preset-sheets-core` + `@univerjs/preset-sheets-ui`. Khong dung `@univerjs/preset-sheets-advanced` (Pro-only charts/pivot).
- **Facade API**: `createUniver({ presets: [UniverSheetsCorePreset(), UniverSheetsUIPreset()] })` → `univerAPI.getWorkbook()`.
- **storage-adapter**: dung `@office/storage-adapter` (IndexedDB driver da co) cho luu tru sau nay. Phase prototype chua can.
- **xlsx-io bang ExcelJS**: chi danh gia `IWorkbookData` snapshot format cua Univer de xac nhan pipeline ExcelJS → snapshot co kha thi khong.
- **Bundle size**: do bang `vite build --mode production` + `rollup-plugin-visualizer` hoac `npx vite-bundle-visualizer`.
- **1.0-alpha**: theo doi changelog nhung khong dung cho prototype.

## Ket qua

- **Go/No-Go: GO** — report: `docs/report-sheets-univer-survey.md`.
- Prototype chay that: import xlsx qua `ExcelJS → exceljsToUniver → univerAPI.createWorkbook`, 3 file mau 600/30K/400K cells render ok.
- Bug dependency: pin `@univerjs/icons@1.2.0` trong `pnpm.overrides` (xem report muc 2.1).
- Bundle: main 1.97 MB gzip + icons 186 KB gzip — can lazy-load o phase MVP.
