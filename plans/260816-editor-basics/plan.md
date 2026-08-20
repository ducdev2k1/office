---
title: 'OneMail Docs - Hoan thien editor basics (format, image, table, find-replace, pagination)'
description: '6 phase: extensions dinh dang nang cao, anh + bang, find & replace, page setup + page break, page view phan trang tren man hinh, modularize + verify'
status: completed
priority: P1
effort: 22.5h
branch: main
tags: [feature, frontend, editor]
created: 2026-08-16
---

# Plan: Hoan thien editor basics cho OneMail Docs

## Overview

Nang cap web docs editor MVP tu App.tsx 207 dong thanh editor day du: dinh dang nang cao (color, highlight, font, sub/sup), chen anh base64, bang, find & replace bang ProseMirror decorations, phan trang kieu Google Docs (page setup, page break, page view do DOM) va modularize toan bo. Tham chieu: `docs/brainstorm-editor-basics.md` (da chot giai phap A: DIY pagination). Stack: React 19 + Vite + TS + TipTap 3.30. Tuan thu AGENTS.md: arrow function, const, ES7+.

## Phases

| #   | Phase                                                        | File                                | Effort | Status  |
| --- | ------------------------------------------------------------ | ----------------------------------- | ------ | ------- |
| 1   | Extensions dinh dang + toolbar + phim tat co ban             | `phase-01-extensions-formatting.md` | 4h     | pending |
| 2   | Chen anh (base64 ≤1MB) + bang                                | `phase-02-image-table.md`           | 3.5h   | pending |
| 3   | Find & Replace (decorations + UI bar Ctrl+H)                 | `phase-03-find-replace.md`          | 3h     | pending |
| 4   | Page setup (data model + panel) + PageBreak node + CSS print | `phase-04-page-setup-break.md`      | 3h     | pending |
| 5   | Page view phan trang tren man hinh (pagination engine)       | `phase-05-page-view-pagination.md`  | 6h     | pending |
| 6   | Modularize + hoan thien phim tat + Help + typecheck/build    | `phase-06-modularize-final.md`      | 3h     | pending |

**Tong effort: 22.5h**

## Dependencies

- Phase 1 truoc Phase 2 (extensions nen foundation cho toolbar).
- Phase 4 truoc Phase 5 (pageSetup + PageBreak la input cua pagination engine).
- Phase 5 phu thuoc storage migration (DocRecord.pageSetup) cua Phase 4.
- Phase 6 (modularize) lam cuoi cung, sau khi moi tinh nang da chay on trong App.tsx — tranh conflict khi refactor.
- Phase 3 (find & replace) doc lap, co the song song Phase 4.
- Tat ca phases: `pnpm install` them extension packages truoc khi code.
- Verify cuoi moi phase: `pnpm --filter @office/web typecheck` (trong apps/web: `pnpm typecheck`).

## Ghi chu ky thuat xuyen suot

- TipTap v3: `useEditor` tu `@tiptap/react`, `editorProps.attributes`, `keyboardShortcuts` trong `Extension.create({ addKeyboardShortcuts() })`.
- `@tiptap/extension-font-family` va `font-size` BAT BUOC di kem `@tiptap/extension-text-style`.
- `@tiptap/extension-color` cung can text-style (dependency).
- localStorage: DocRecord cu thieu `pageSetup` → migration default khi load (khong duoc crash).
- Anh base64: gioi han 1MB/anh, nhanh bao quota 5MB localStorage.
- Pagination: do `nodeDOM(nodeStart).offsetHeight` chi cho top-level blocks; container `.doc-editor` la chuan do.
- PageBreak node: `atom: true, selectable: true`, render `div[data-type=page-break]`.
