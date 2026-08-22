---
title: 'Docs Completion - Hoàn thiện app Docs: hardening + mobile + PWA'
description: '5 phase: sổ sách + spellcheck native quick win, hardening fidelity export .docx, perf tài liệu lớn, mobile responsive (xem + sửa nhẹ), offline PWA. Benchmark: ngang Google Docs core, giữ local-first, KHÔNG E2E (test thủ công + unit test hiện có).'
status: pending
priority: P1
effort: 112h
branch: main
tags: [feature, frontend, docs, hardening, pwa, mobile]
blockedBy: [260820-docs-gap-closing]
blocks: []
created: 2026-08-21
---

# Plan: Docs Completion — Hoàn thiện app Docs

## Overview

Kết quả phiên grilling ngày 21/08/2026 với owner. Scope chốt:

| # | Hạng mục | Quyết định |
|---|----------|-----------|
| 1 | Benchmark | Ngang Google Docs core |
| 2 | Kiến trúc | Giữ local-first (IndexedDB + Hocuspocus), KHÔNG nối backend/SSO |
| 3 | Hardening | Fidelity export .docx + perf tài liệu lớn. **Bỏ E2E** (test thủ công trực tiếp + giữ unit test hiện có ~60 test). Bỏ a11y |
| 4 | Spellcheck VI | Native browser (`spellcheck="true"`) trước, đánh giá rồi tính tiếp hunspell WASM |
| 5 | Mobile | Xem + sửa nhẹ qua bubble toolbar, KHÔNG full toolbar desktop |
| 6 | PWA | Vào scope (owner ủy quyền quyết) — hợp local-first |
| 7 | Hoãn dài hạn | AI assist, RTF/ODT import, pageless mode, voice typing, smart chips, shapes/drawing, translate doc |

## Cross-Plan Dependencies

| Relationship | Plan | Status |
| ------------ | ---- | ------ |
| Blocked by | [260820-docs-gap-closing](../260820-docs-gap-closing/plan.md) | completed (9/9 phase done, cần cập nhật status ở Phase 01 của plan này) |

## Phases

| #   | Phase                                                                 | File                                                                  | Effort | Status  |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ | ------- |
| 1   | Sổ sách: cập nhật status gap-closing + spellcheck native quick win    | [phase-01](./phase-01-bookkeeping-spellcheck-native.md)               | 2h     | done    |
| 2   | Hardening fidelity export .docx (fidelity-harness driven)             | [phase-02](./phase-02-hardening-fidelity-docx.md)                     | 40h    | pending |
| 3   | Perf tài liệu lớn (50+ trang): pagination/render không lag            | [phase-03](./phase-03-perf-large-docs.md)                             | 30h    | pending |
| 4   | Mobile responsive: xem + sửa nhẹ (bubble toolbar)                     | [phase-04](./phase-04-mobile-responsive-light-edit.md)                | 25h    | pending |
| 5   | Offline PWA: manifest + service worker + cache strategy               | [phase-05](./phase-05-offline-pwa.md)                                 | 15h    | pending |

**Tổng effort ước tính: ~112h** (1 kỹ sư + hỗ trợ AI agentic).

## Nguyên tắc kiểm thử (chốt với owner)

- **KHÔNG cài E2E** (Playwright/Cypress). Kiểm thử = mở app chạy thủ công trực tiếp.
- Giữ nguyên + mở rộng unit test (Vitest) hiện có khi sửa logic thuần (mapper, store, utils).
- Mọi phase: `pnpm build` + typecheck pass, không lỗi console.

## Success Metrics

- Fidelity export .docx tăng đo được qua `packages/fidelity-harness`, mở lại bằng Word không lỗi.
- Tài liệu 50+ trang: gõ/phím mượt (không jank thấy được), scroll 60fps.
- Mobile (viewport < 768px): đọc thoải mái, sửa nội dung + định dạng nhanh được qua bubble toolbar.
- PWA: cài đặt được lên desktop/mobile, mở và soạn thảo hoàn toàn offline.
- Spellcheck tiếng Việt hoạt động trên Chrome/Firefox (gạch đỏ native).
