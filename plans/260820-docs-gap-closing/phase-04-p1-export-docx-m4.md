# Phase 4: P1 export .docx (mốc M4) + import txt/html + markdown export

## Overview

- **Priority**: P1 | **Status**: done | **Effort**: 60h
- Lấp lỗ hổng chiến lược nhất: **export .docx** (mốc M4 roadmap) theo kiến trúc T1 preserve-and-patch. Kèm import .txt/.html, export Markdown, nút tải PDF.

## Context

- Tham chiếu: `docs/brainstorm-docs-missing-features.md` mục 3 (bảng D), mục 6 đợt 2; `docs/roadmap-web-office.md` mốc M4 (Lớp A round-trip).
- Đã có: `packages/docx-io` (chỉ đọc: `convertDocxToHtml`, `convertDocxToText` qua mammoth), `packages/ooxml-core` (unpack/repack giữ byte), `docxSourceStore` lưu byte gốc theo docId (`docs.service.ts`).
- Đã có fidelity-harness (đo round-trip) — dùng để verify.

## Key Insights

- Hai nhánh export:
  1. **Doc từ file .docx gốc** (`sourceType: 'docx'`): đã có byte gốc trong `docx-sources` → **patch `word/document.xml`** với phần đã sửa, giữ nguyên phần khác byte-for-byte (kiến trúc T1).
  2. **Doc tạo mới**: sinh `.docx` từ template cơ bản bằng `docx` npm (MIT) — map HTML/TipTap → OOXML.
- Cần ánh xạ TipTap HTML → OOXML cho Lớp A: paragraph, heading, bold/italic/underline/strike, color, font, sub/sup, bullet/numbered list (đa cấp), table (merge/cell bg), image (media), link.
- `docx` npm sinh docx từ đầu (Node/Web); dùng template byte gốc cho nhánh 1.
- Export Markdown: `turndown` (MIT) — map tương tự HTML→MD.
- Nút PDF: gọi `printDocument()` hiện có (`window.print`).

## Requirements

### Functional

- File > Export > **Word (.docx)**: doc từ file gốc → patch document.xml; doc mới → sinh từ template.
- Export Markdown (.md), Import .txt, Import .html.
- Nút "Tải PDF" (gọi print).
- Xuất đúng: heading, list (bullet + numbered đa cấp), bảng (merge/cell bg), ảnh, link, định dạng ký tự Lớp A.

### Non-functional

- Doc từ file gốc: phần không sửa giữ nguyên byte (đo bằng fidelity-harness).
- File tải về mở được bằng Word/LibreOffice/Google Docs không lỗi.
- Hoạt động offline (không cần backend).

## Related Code Files

- **Create**: `packages/docx-io/src/html-to-ooxml/` — mapper HTML/TipTap → OOXML XML string
- **Create**: `packages/docx-io/src/html-to-ooxml/utils.ts` (escape, number mapping, table mapping)
- **Create**: `packages/docx-io/src/writer.ts` — `exportDocx(html, options)` dùng `docx` npm cho doc mới
- **Modify**: `packages/docx-io/src/index.ts` (export API mới)
- **Create**: `packages/docx-io/src/patch.ts` — patch `document.xml` từ byte gốc
- **Modify**: `apps/docs/src/services/import.service.ts` (import txt/html)
- **Create**: `apps/docs/src/services/export.service.ts` (exportDocx/exportMarkdown/exportPdf)
- **Modify**: `apps/docs/src/modules/header/components/MenuBar.tsx` (menu File: Export Word/Markdown, Import txt/html, Tải PDF)
- **Modify**: `apps/docs/src/modules/toolbar/components/DocTools.tsx` (nút PDF, Markdown)
- **Modify**: `apps/docs/src/modules/editor/hooks/useEditorActions.ts` (wire export actions)
- **Modify**: `packages/docx-io/package.json` (thêm `docx`, `turndown`)
- **Modify**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json`

## Implementation Steps

1. Nghiên cứu cấu trúc `document.xml` chuẩn OOXML (ECMA-376) cho Lớp A: paragraph/run/proof, pPr (spacing, jc, numPr), rPr (b/i/u/strike/color/sz/fonts/vertAlign), tbl/tblGrid/tcPr (vMerge/gridSpan/shd), drawing (inline image), hyperlink.
2. Viết mapper `html-to-ooxml`: parse HTML (domparser) → tạo các phần tử XML bằng string builder (đảm bảo escape + namespace đúng `w:`).
3. Nhánh doc mới: dùng `docx` npm sinh template (section A4) rồi thay body bằng XML map được; đóng gói lại qua `ooxml-core` pack.
4. Nhánh doc từ file: đọc byte gốc từ `docxSourceStore`, unpack qua `ooxml-core`, thay `<w:body>` bằng body mới map được, pack lại giữ nguyên các part khác.
5. Import txt: đọc text → wrap paragraph. Import html: sanitize + `setContent`.
6. Export Markdown: turndown với heading/list/bold/italic/link/table rules.
7. Nút PDF: gọi printDocument.
8. Wire menu/toolbar + i18n.
9. fidelity-harness: chạy trên bộ mẫu Lớp A — đo % byte-identical + mở lại bằng docx-preview không lỗi.

## Todo List

- [x] OOXML mapper Lớp A (html→document.xml)
- [x] Nhánh doc mới (docx npm template)
- [x] Nhánh patch byte gốc (ooxml-core)
- [x] Import txt/html
- [x] Export Markdown
- [x] Nút PDF
- [x] Wire UI + i18n
- [x] fidelity-harness verify

## Success Criteria

- Doc mới → Export .docx → mở bằng Word/Google Docs: đúng định dạng, không lỗi.
- Doc từ file gốc (không sửa) → export → byte-identical ≥ 95%.
- Doc từ file gốc (sửa đoạn) → export → phần sửa đúng, phần khác giữ nguyên byte.
- Import .txt/.html → content đúng.
- Export Markdown đúng cấu trúc.
- Typecheck + test pass.

## Risk Assessment

| Rủi ro                     | Mitigation                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Map OOXML thiếu trường hợp | Làm Lớp A trước (đã chốt trong roadmap); nút mờ (opaque) giữ nguyên cho phần không hiểu |
| Bảng merge map sai         | Test kỹ gridSpan/vMerge với file mẫu; dùng fidelity-harness                             |
| `docx` npm chạy web        | Kiểm tra build web (no Node API); fallback: tự sinh XML string thuần (đã làm mapper)    |
| Ảnh base64                 | Chuyển base64 → media part trong package, reference rId đúng                            |

## Security Considerations

- Sanitize HTML khi import (tránh XSS vào editor).
- Không xuất ra phần user không kiểm soát; escape mọi text trong OOXML.

## Next Steps

- Phase 9 (final verification) — chạy fidelity-harness toàn diện.
- Phase 5 (cấu trúc tài liệu) — section break/bookmark bổ sung mapping sau này.
