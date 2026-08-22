---
title: 'Docs Gap Closing - Bu lỗ hổng tính năng so với Google Docs (tự build, không TipTap Pro)'
description: '9 phase: scaffold package tiptap-extensions + P0 soạn thảo nhanh, P1 cộng tác/export docx (M4)/cấu trúc tài liệu, P2 comments/math/footnotes/columns/track changes. Ràng buộc C1-C3: chỉ OSS MIT/Apache-2.0, tự build mọi tính năng TipTap Pro.'
status: completed
priority: P1
effort: 320h
branch: main
tags: [feature, frontend, docs, collab, tiptap, docx]
blockedBy: [260816-editor-basics]
blocks: []
created: 2026-08-20
---

# Plan: Bù lỗ hổng tính năng Docs so với Google Docs (Tự build toàn bộ)

## Overview

Triển khai toàn bộ tính năng còn thiếu của `apps/docs` so với Google Docs, **không mua TipTap Pro** (ràng buộc C1–C3: chỉ OSS MIT/Apache-2.0). Tự xây lại toàn bộ "Pro layer" bằng ProseMirror/Yjs trên nền codebase hiện có (đã có: định dạng cơ bản, pagination, page setup, header/footer, ruler, find-replace, realtime collab Hocuspocus + Yjs, import .docx giữ byte gốc). Tham chiếu: `docs/brainstorm-docs-missing-features.md` (đã chốt 5 mảng A–E, 3 đợt).

## Cross-Plan Dependencies

| Relationship | Plan                                                    | Status                                                                                 |
| ------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Blocked by   | [260816-editor-basics](../260816-editor-basics/plan.md) | completed — nền extensions/pagination đã có sẵn trong codebase (đã đánh dấu completed) |

## Phases

| #   | Phase                                                                                                          | File                                                     | Effort | Status  |
| --- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------ | ------- |
| 1   | Scaffold package `tiptap-extensions` + P0 quick wins                                                           | [phase-01](./phase-01-scaffold-package-p0-quick-wins.md) | 30h    | done |
| 2   | P0 editor polish: table merge UI, image resize, link popover, emoji, code highlight, bubble toolbar, zoom, TOC | [phase-02](./phase-02-p0-editor-polish.md)               | 50h    | done |
| 3   | P1 collab: version history (Yjs snapshot), @mention, share dialog                                              | [phase-03](./phase-03-p1-collab-enhancements.md)         | 50h    | done |
| 4   | P1 export .docx (mốc M4) + import txt/html + markdown                                                          | [phase-04](./phase-04-p1-export-docx-m4.md)              | 60h    | done |
| 5   | P1 cấu trúc tài liệu: section break, bookmark, watermark, template gallery, header/footer lẻ/chẵn, folders     | [phase-05](./phase-05-p1-doc-structure.md)               | 40h    | done |
| 6   | P2 comments & threads (Yjs-based)                                                                              | [phase-06](./phase-06-p2-comments.md)                    | 40h    | done |
| 7   | P2 math (KaTeX), footnotes, columns                                                                            | [phase-07](./phase-07-p2-math-footnotes-columns.md)      | 30h    | done |
| 8   | P2 track changes / suggestion mode                                                                             | [phase-08](./phase-08-p2-track-changes.md)               | 40h    | done |
| 9   | Final verification: fidelity-harness, typecheck, build, tests                                                  | [phase-09](./phase-09-final-verification.md)             | 10h    | done |

**Tổng effort ước tính: ~320h** (1 kỹ sư + hỗ trợ AI agentic).

## Dependencies

- Phase 1 trước mọi phase khác (package nền).
- Phase 2 phụ thuộc Phase 1 (cùng package).
- Phase 3 phụ thuộc Phase 1 (suggestion/Yjs helpers trong `shared/`).
- Phase 4 (export .docx) độc lập, có thể song song Phase 3/5 nhưng cần docx-io đã có (đã xong từ M2/M3).
- Phase 6–8 (comments, math/footnote/columns, track changes) phụ thuộc Phase 1 `shared/` (suggestion plugin, Yjs helpers, popup utils).
- Phase 9 cuối cùng sau mọi phase.
- Verify mỗi phase: `pnpm --filter @office/docs typecheck` (apps/docs: `pnpm typecheck`) + `pnpm test`.

## Ghi chú kỹ thuật xuyên suốt

- Mọi node/mark mới bắt buộc có `parseHTML`/`renderHTML` chuẩn — không phá round-trip HTML IndexedDB, không hỏng export .docx.
- Node trong tài liệu collab phải tương thích `@tiptap/extension-collaboration`; comment dùng `Y.Map` theo Yjs relative position (anchor) thay vì vị trí tuyệt đối.
- Tuân thủ AGENTS.md: arrow function, const, ES7+, file <400 dòng, path alias `@/*` trong apps, relative import trong packages.
- Package mới `packages/tiptap-extensions` dùng relative import nội bộ, export qua workspace.

## NOT in scope (hoãn, chờ quyết định riêng)

- Spellcheck tiếng Việt (hunspell WASM), AI/Gemini, voice typing, mobile native app — cần backend/quyết định sản phẩm.
- Import .rtf/.odt (thư viện MIT hạn chế, chất lượng kém).
- Nới ràng buộc C2/C3 để mua TipTap Pro (đã loại theo quyết định).
