# Brainstorm: Hoàn thiện tính năng cơ bản Web Docs editor

Date: 2026-08-16

## 1. Problem statement

Web Docs MVP hiện tại mới có định dạng cơ bản (bold/italic/underline/H1-H2/list/align/link), autosave localStorage, export HTML/TXT. User muốn:

1. **Phân trang các kiểu**: page view như gg docs (nhiều trang A4 trên màn hình), page setup (khổ giấy, lề, hướng), chèn page break, phân trang đúng khi in/export.
2. **Đầy đủ tính năng cơ bản**: strikethrough, highlight, text color, sub/superscript, code block, blockquote, HR, font family/size, chèn ảnh, bảng (table), Find & Replace.
3. **Phím tắt toàn diện** (chuẩn gg docs + tuỳ chỉnh thêm).

## 2. Khó khăn chính (brutal honesty)

**Pagination kiểu gg docs trên TipTap là phần rủi ro nhất.** Đã research:

- **Tiptap Pages (official Pro)**: trả phí + alpha, **không** tự reflow khi content vượt trang → loại.
- **`prosemirror-pagination` (todorstoev)**: MIT nhưng 6 năm không update, demo cũ → rủi ro.
- **`tiptap-pagination-plus` (community)**: Google Docs-style auto pagination (DOM measurement + decorations), có dynamic header/footer → đáng thử nhưng phải kiểm chứng tương thích TipTap 3.x.
- **Cộng đồng ProseMirror xác nhận**: auto reflow đúng nghĩa = đo chiều cao từng block DOM + decorations vẽ page breaks. Giới hạn cứng: **block không thể split giữa 2 trang** (table, image → đẩy nguyên khối xuống trang sau; block cao hơn 1 trang → cho overflow hoặc loop vô hạn). Ngay cả Tiptap Pages cũng có giới hạn này.
- Google Docs phải chuyển sang canvas render vì không làm được pixel-perfect pagination bằng DOM.

## 3. Các phương án đã cân nhắc

### Phân trang

| Phương án                                 | Pros                                                              | Cons                                                                       | Kết luận                                               |
| ----------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| **A. DIY: decorations + DOM measurement** | Miễn phí, kiểm soát toàn bộ, không đổi schema (undo/redo an toàn) | Trung bình-cao độ khó; flicker khi tính lại; cần xử lý table/image         | ✅ **Chọn** — phù hợp MVP, cách này là chuẩn cộng đồng |
| **B. Package `tiptap-pagination-plus`**   | Nhanh, đã có headers/footers                                      | Chất lượng chưa kiểm chứng, TipTap 3.x compatibility chưa chắc, ít control | Thử trước Phase 3, fail thì fallback A                 |
| **C. Page node trong schema**             | Phân trang "thật"                                                 | Di chuyển content giữa các page cực khó, đập vỡ undo/redo                  | ❌ Loại                                                |
| **D. Tiptap Pages Pro**                   | Official                                                          | Trả phí, alpha, không reflow                                               | ❌ Loại                                                |

### Find & Replace

- Tiptap Pro có extension search-and-replace (trả phí) → loại.
- **Chọn: DIY bằng ProseMirror decorations** (~100-150 dòng): highlight tất cả match + navigate + replace/replace-all. Đây là pattern cộng đồng chuẩn, hoạt động tốt TipTap 3.x.

### Table, Image, Font, Color...

Tất cả đều có **extension chính thức miễn phí** của TipTap → không cần bàn cãi:

- Table: `@tiptap/extension-table` + table-row + table-cell + table-header
- Image: `@tiptap/extension-image` (upload → FileReader → base64 data URL)
- Font: `@tiptap/extension-text-style` + `font-family` + `font-size`
- Color: `@tiptap/extension-color`, Highlight: `@tiptap/extension-highlight`
- Sub/Superscript: `@tiptap/extension-subscript` + `superscript`
- Strike, code block, blockquote, HR: **StarterKit đã có sẵn**

## 4. Giải pháp đề xuất (final)

### Kiến trúc (modularize — App.tsx hiện 207 dòng, sẽ tách)

```text
apps/web/src/
  App.tsx                        # layout shell, state docs/activeDoc
  types.ts                       # DocRecord + PageSetup (paperSize, margins, orientation)
  storage.ts                     # load/save localStorage + ảnh base64
  editor/use-docs-editor.ts      # hook: tạo editor + mọi extensions + phím tắt
  editor/extensions/page-break.ts   # custom node PageBreak
  editor/extensions/search-replace.ts # decorations find & replace
  editor/pagination.ts           # đo block heights → tính page breaks → decorations
  components/Toolbar.tsx         # toolbar đầy đủ (tách ToolbarButton)
  components/FindReplaceBar.tsx  # thanh Ctrl+H
  components/PageSetupPanel.tsx  # cài khổ giấy/lề/hướng
  components/DocsSidebar.tsx     # tách từ App
```

### 1. Editor nâng cao (Phase 1)

- Thêm extensions: color, highlight, subscript/superscript, font-family, font-size, image, table.
- Toolbar thêm: font picker, size picker, color, highlight, strike, sub/sup, image, table, HR, code block.
- **Ảnh**: base64 → cảnh báo localStorage quota ~5MB; giới hạn ảnh ≤ 1MB (hoặc nén qua canvas). Đây là giới hạn MVP, khi có backend sẽ lưu file.

### 2. Phân trang (Phase 2-3)

**Page setup**: lưu vào `DocRecord.pageSetup = { paperSize: "a4"|"a5"|"letter", orientation: "portrait"|"landscape", margins: {top,right,bottom,left} }`. Áp CSS variables vào `.doc-editor` (width/height/padding).

**Page break**: custom node `PageBreak`, render `<div class="page-break">` với `break-after: page`. Có nút Insert → Page Break. Serialize ra HTML ổn định (lưu localStorage).

**Page view trên màn hình** (cách A):

- Editor được bọc trong container `position: relative`.
- Render N khối `.page` background (trắng, box-shadow) phía sau, xếp dọc, đúng khổ giấy + lề.
- ProseMirror content chạy liên tục phía trên (absolute), nhưng **decoration plugin** vẽ vạch ngắt trang + ép content vào từng trang: đo `offsetHeight` từng block qua `nodeDOM()`, tính điểm cắt theo remaining height.
- Giới hạn chấp nhận: table/image không split — đẩy nguyên khối xuống trang sau; block cao hơn trang → overflow (giống giới hạn Tiptap Pages).
- Debounce tính toán (~150ms sau khi gõ) để tránh flicker.
- View mode toggle: **Paged** | **Continuous** (scroll liên tục như hiện tại).

**In/export**: CSS `@page { size: <setup>; margin: <setup> }` + `break-before: page` (page break) + `break-inside: avoid` (block). `window.print()` = "Save as PDF" đạt phân trang đúng. Không cần thư viện PDF cho MVP.

### 3. Find & Replace (Phase 4)

- Ctrl+H mở bar: input find + replace, nút Prev/Next/All/Replace/Replace all.
- Decorations highlight match + highlight match đang active; navigation qua `TextSelection`.

### 4. Phím tắt toàn diện

**StarterKit đã có sẵn**: Ctrl+B/I (bold/italic), Ctrl+Z/Y (undo/redo), Ctrl+Shift+7/8 (bullet/numbered), Ctrl+Alt+1/2/3 (H1/H2/H3), Tab/Shift+Tab (indent/outdent), Ctrl+K (link), Ctrl+` (code block).

**Thêm bằng keyboardShortcuts**:

| Phím                        | Chức năng                                              |
| --------------------------- | ------------------------------------------------------ |
| Ctrl+Shift+X                | Strikethrough                                          |
| Ctrl+Shift+Z                | Redo (bổ sung cho Ctrl+Y)                              |
| Ctrl+H                      | Find & Replace                                         |
| Ctrl+Shift+> / Ctrl+Shift+< | Tăng/giảm font size                                    |
| Ctrl+Shift+5                | Subscript                                              |
| Ctrl+Shift+6                | Superscript                                            |
| Ctrl+Shift+9 / 0            | List chỉnh? → **bỏ** (trùng gg docs layout, không cần) |
| Ctrl+Enter                  | Chèn page break                                        |
| Ctrl+Alt+7                  | Đổi màu chữ (mở color picker)                          |
| Ctrl+Shift+F                | Font picker focus                                      |
| Ctrl+P                      | In (browser có sẵn)                                    |

Không override Ctrl+F (find in browser) — dùng Ctrl+H giống gg docs. Hiển thị bảng phím tắt trong menu Help.

## 5. Rủi ro & mitigation

| Rủi ro                             | Mitigation                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Page view flicker / perf khi gõ    | Debounce 150ms; chỉ tính lại blocks thay đổi; giới hạn MVP: doc ≤ ~50 trang |
| Table/image không split được       | Đẩy nguyên khối; block > trang cho overflow (có thông báo)                  |
| Ảnh base64 đầy localStorage (~5MB) | Giới hạn ≤1MB/ảnh + nén canvas; cảnh báo khi gần đầy                        |
| Print không khớp 100% page view    | Chấp nhận cho MVP; kiểm chứng Chrome print-to-PDF                           |
| TipTap 3.x breaking changes        | Dùng extension chính thức (đã support v3); không dùng package cũ            |

## 6. Success metrics

- Tất cả formatting buttons hoạt động đúng (active state, toggle).
- Page view: content tự xuống trang mới khi vượt chiều cao, đúng lề/khổ giấy.
- Page setup thay đổi → page view + bản in cập nhật theo.
- Find & Replace: highlight đúng, replace-all đúng, navigate qua các match.
- Phím tắt gg docs chuẩn hoạt động trong editor.
- Không lỗi console, build + typecheck pass.

## 7. Thứ tự triển khai

1. **Phase 1**: extensions + toolbar + phím tắt cơ bản (nhanh, ít rủi ro).
2. **Phase 2**: page setup + page break node + CSS print rules.
3. **Phase 3**: page view trên màn hình (phần khó nhất — thử `tiptap-pagination-plus` trước, fallback DIY).
4. **Phase 4**: find & replace + phím tắt bổ sung + Help menu.

## 8. Câu hỏi chưa chốt

- Ảnh: chấp nhận giới hạn base64 ≤1MB cho MVP hay cần lưu file qua backend ngay?
- Có cần line spacing (giãn dòng) không? (chưa nằm trong scope đã chọn)
