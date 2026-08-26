---
title: 'Docs Fidelity + Corpus — hoàn tất gap grilling & hardening fidelity import'
description: 'Bản ghi sổ sách công việc ĐÃ HOÀN THÀNH (không có plan formal trước đó): 4 gap app Docs (CharacterCount, PDF hint toast, Markdown import, TextInputDialog), fidelity import docx-io (block pairing, shading/border, cell shading, XSS sanitizer), corpus generator 17 file + gate 100%.'
status: completed
priority: P1
effort: ~1 ngày
branch: main
tags: [bookkeeping, docs, fidelity, docx-io, security, corpus]
blockedBy: [260820-docs-gap-closing, 260821-docs-completion]
blocks: []
created: 2026-08-26
---

# Sổ sách: Docs Fidelity + Corpus (đã hoàn thành)

## Phạm vi thực hiện

| # | Hạng mục | Gói |
|---|----------|-----|
| 1 | apps/docs: CharacterCount registration; PDF export hint toast; import Markdown thật qua `marked`; `TextInputDialog` thay `window.prompt` cho link/bookmark/footnote | apps/docs |
| 2 | docx-io import-side: zero-length block pairing symmetry; paragraph shading/border-left qua `data-bg-color`/`data-border`; `injectTableCellShading` cho nền ô bảng; XSS-hardening sanitizer `importHtml` | packages/docx-io |
| 3 | fidelity-harness: generator corpus tổng hợp tái lập được (+13 .docx → tổng 17 trong `<root>/corpus`); mở rộng `standardFormatChecks` nhãn image + grid-span; script npm `corpus` | packages/fidelity-harness |

## Quyết định phiên grilling

- **Baseline** = scope của plans `260820-docs-gap-closing` + `260821-docs-completion`.
- **Gate fidelity bắt buộc đạt 100%** trên toàn corpus.
- Hai track song song: **docs-fidelity** và **sheets**.
- Bước kế tiếp sheets = phiên grilling riêng, dựa trên `docs/report-sheets-univer-survey.md`.

## Trạng thái Phase (tất cả done)

| Phase | Nội dung | Trạng thái |
|-------|----------|-----------|
| A | 4 gap apps/docs (fulfill quyết định grilling) | ✅ Done |
| B | Fidelity import docx-io + XSS hardening | ✅ Done |
| C | Corpus generator + gate chuẩn hóa | ✅ Done |

## Kiểm chứng (đã chạy xanh toàn bộ)

| Hạng mục | Kết quả |
|----------|---------|
| Typecheck monorepo (`turbo`) | ✅ Pass — turbo 9/9 |
| Unit tests docx-io | ✅ 25/25 pass |
| fidelity-harness (gồm corpus gate 17 file @100%) | ✅ 19/19 pass |
| apps/docs tests | ✅ 55/55 pass |

## Việc tiếp theo

- Sheets: tổ chức phiên grilling riêng theo `docs/report-sheets-univer-survey.md` (pin `@univerjs/icons@1.2.0`, kiểm tra license khi nâng version).
