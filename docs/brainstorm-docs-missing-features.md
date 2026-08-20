# Brainstorm: Bù lỗ hổng tính năng so với Google Docs (Tự build toàn bộ)

Date: 2026-08-20

## 1. Problem statement

Apps/docs hiện đã có nền tảng vững: định dạng cơ bản (bold/italic/underline/strike/sub/sup/color/highlight/font/size/weight), align L/C/R, list, indent, blockquote, code block, HR, link, ảnh base64, table (resizable + add/delete dòng cột), pagination kiểu gg docs (page view, page setup, page break, header/footer + số trang, ruler tương tác), Find & Replace, context menu, menu bar, home dashboard (FileHome), import .docx (giữ byte gốc), export HTML/TXT, print/PDF qua CSS, realtime collaboration (Hocuspocus + Yjs, cursor, avatar, offline sync, share link).

Yêu cầu: **liệt kê và triển khai toàn bộ tính năng còn thiếu so với Google Docs**, với ràng buộc cứng: **không mua TipTap Pro, không dùng thư viện AGPL** — tự build trên nền ProseMirror/Yjs.

## 2. Ràng buộc quyết định mọi lựa chọn

- C1–C3: chỉ OSS MIT/Apache-2.0, không mua bản quyền → **mọi extension Pro của TipTap bị loại** (TOC, Columns, Footnotes, Comments, Track Changes, Mathematics).
- Hệ quả: ta tự xây lại toàn bộ "Pro layer" bằng ProseMirror thuần — khả thi vì là pattern công khai, nhưng tính năng ra sau và chất lượng ban đầu thấp hơn, cải thiện dần (giống quyết định T1 cho docx).
- Quyết định này là **nợ kỹ thuật vĩnh viễn lớn nhất dự án** nhưng đúng tinh thần tự chủ sản phẩm.

## 3. Tổng hợp 5 mảng thiếu + phương án

### Mảng A — Soạn thảo thường dùng (effort thấp–vừa)

| Tính năng                                | Phương án                                                                                  | Effort                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------- |
| Clear formatting (Ctrl+\\)               | `unsetAllMarks()` + `setParagraph()` + bỏ textStyle attrs                                  | 🟢 Thấp                    |
| Justify alignment                        | TextAlign đã cài — thêm option `justify`                                                   | 🟢 Rất thấp                |
| Line/paragraph spacing                   | Pattern fontSize.extension (custom attribute trên TextStyle) + CSS line-height/margin      | 🟡 Vừa                     |
| Checklist                                | `@tiptap/extension-task-list` + task-item (MIT)                                            | 🟢 Thấp                    |
| Table merge/split, màu nền ô, header row | `@tiptap/extension-table` đã có `mergeCells`/`splitCell`/`setCellAttribute` — chỉ thiếu UI | 🟢 Thấp                    |
| Image resize + căn lề                    | Custom nodeview bọc `<img>` + resize handle                                                | 🟡 Vừa                     |
| Link popover                             | Decoration + floating UI khi click link (sửa/unlink/copy)                                  | 🟡 Vừa                     |
| Special chars / emoji                    | Emoji-picker MIT + chèn ký tự                                                              | 🟢 Thấp                    |
| Code block highlight                     | `@tiptap/extension-code-block-lowlight` (MIT)                                              | 🟢 Thấp                    |
| Equation                                 | KaTeX (MIT) + custom inline/block node                                                     | 🔴 Cao — hoãn nếu chưa cần |

### Mảng B — Cấu trúc tài liệu

| Tính năng                                    | Phương án                                                  | Effort                                    |
| -------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| TOC trong doc                                | Tự xây từ `getOutline()` (đã có) → node TOC + click scroll | 🟡 Vừa                                    |
| Columns                                      | Custom node (columnBlock + column), CSS flex/grid          | 🔴 Cao — xung đột pagination reflow, hoãn |
| Section break                                | Node tương tự pageBreak + phân biệt next-page/continuous   | 🟡 Vừa                                    |
| Footnote                                     | Custom node + hover popup + đánh số tự động                | 🔴 Cao — hoãn                             |
| Bookmark + link tới bookmark                 | Custom node + URL hash                                     | 🟡 Vừa                                    |
| Watermark                                    | Render trên `.page` background + CSS print                 | 🟢 Thấp                                   |
| Header/footer trang lẻ/chẵn + khác trang đầu | Mở rộng `PageSetup` schema + pagination render theo index  | 🟡 Vừa                                    |
| Template gallery                             | UI + seed docs (`templates: []` đang rỗng)                 | 🟢 Thấp                                   |

### Mảng C — Cộng tác (quan trọng chiến lược)

| Tính năng                       | Phương án                                                                                 | Effort                  |
| ------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| Version history + restore       | **Yjs snapshots sẵn có** (`Y.snapshot`, `encodeStateAsUpdate`) → checkpoint + UI timeline | 🟡 Vừa                  |
| Comments & threads              | Tự xây: lưu vào Yjs shared map theo anchor + decoration + panel phải                      | 🔴 Cao                  |
| @mention                        | ProseMirror suggestion plugin + popover                                                   | 🟡 Vừa                  |
| Share dialog phân quyền         | UI + encode quyền vào URL params (giả lập, chưa có backend thật)                          | 🟢 Thấp–vừa             |
| Folders / organize              | Thêm `parentId` vào `DocRecord` + cây trong sidebar                                       | 🟡 Vừa                  |
| Suggestion mode / Track changes | Đánh dấu insert/delete trên Yjs + accept/reject                                           | 🔴🔴 Rất cao — làm cuối |

### Mảng D — Import/Export (lỗ hổng chiến lược)

| Tính năng            | Phương án                                                                                                                                           | Effort                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Export .docx         | (1) doc từ file gốc → patch `document.xml` theo kiến trúc T1 (byte gốc đã lưu `docx-sources`); (2) doc mới → sinh từ template bằng `docx` npm (MIT) | 🔴 Cao — mốc M4, bắt buộc |
| Import .txt / .html  | Parse trực tiếp                                                                                                                                     | 🟢 Thấp                   |
| Import .rtf / .odt   | Thư viện MIT hạn chế, chất lượng kém                                                                                                                | 🔴 Cao — cân nhắc bỏ      |
| Export Markdown      | `turndown` (MIT)                                                                                                                                    | 🟢 Thấp                   |
| Export PDF trực tiếp | Đã có qua print; thêm nút "Tải PDF" gọi `window.print()`                                                                                            | 🟢 Rất thấp               |

### Mảng E — Trải nghiệm nâng cao

| Tính năng                  | Phương án                                                       | Effort        |
| -------------------------- | --------------------------------------------------------------- | ------------- |
| Zoom                       | CSS `transform: scale` trên viewport + điều chỉnh page width    | 🟡 Vừa        |
| Bubble toolbar khi bôi đen | Floating UI khi selection không rỗng                            | 🟡 Vừa        |
| Spellcheck                 | Native browser (EN) trước; hunspell WASM tiếng Việt rất tốn kém | 🔴 Cao — hoãn |
| Mobile/touch               | Responsive + tap targets                                        | 🟡 Vừa        |
| AI                         | Cần quyết định model/backend                                    | 🔴 Cao — hoãn |

## 4. Kiến trúc đề xuất

Tách các extension Pro tự build thành package riêng để tránh apps/docs phình quá 400 dòng/file và tái dùng cho Sheets/Slides:

```text
packages/tiptap-extensions/       # nội bộ, MIT
├── toc/                          # node TOC + click scroll
├── columns/                      # node columns (hoãn)
├── footnote/                     # node footnote + popup (hoãn)
├── comments/                     # Yjs-based comment + decoration
├── track-changes/                # suggestion mode + accept/reject (cuối)
├── math/                         # KaTeX inline/block (hoãn)
└── shared/                       # suggestion plugin, popup utils, Yjs helpers
```

## 5. Nguyên tắc build bắt buộc

1. **Mọi node/mark mới phải có `parseHTML`/`renderHTML` chuẩn** — không phá round-trip HTML trong IndexedDB, không hỏng export .docx sau này.
2. **Tương thích Yjs:** node trong tài liệu collab phải qua `@tiptap/extension-collaboration`; comment dùng `Y.Map` theo anchor, tránh 2 client ghi cùng key.

## 6. Thứ tự triển khai (đã chốt)

1. **Đợt 1 (P0, ~2 tuần):** mảng dễ — Clear formatting, Justify, Line spacing, Checklist, Table merge/split UI, Image resize, Link popover, TOC, Zoom, Bubble toolbar.
2. **Đợt 2 (P1):** Version history (Yjs snapshot) → Export .docx (M4) → @mention → Share dialog → Section break → Bookmark → Watermark → Template gallery → Header/footer lẻ/chẵn → Folders.
3. **Đợt 3 (P2):** Comments → Math → Footnotes → Columns → Track changes (cuối cùng, khó nhất).

## 7. Rủi ro & mitigation

| Rủi ro                                                | Mitigation                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| Columns xung đột pagination reflow                    | Hoãn tới P2; block phức tạp không split, đẩy nguyên khối              |
| Track changes cực khó trên Yjs                        | Làm cuối; cân nhắc giảm scope (chỉ highlight, accept/reject đơn giản) |
| Comments tự build chậm, dễ mất anchor khi sửa văn bản | Dùng Yjs anchor (relative position) thay vì tuyệt đối                 |
| Export .docx chất lượng thấp ban đầu                  | Có sẵn byte gốc; dùng fidelity-harness đo %, cải thiện dần            |
| Phình apps/docs vượt 400 dòng                         | Tách package tiptap-extensions từ đầu                                 |

## 8. Success metrics

- 100% tính năng mảng A hoạt động đúng, active state + toggle chuẩn.
- TOC cập nhật theo heading, click scroll đúng.
- Version history: restore về snapshot đúng nội dung, không hỏng collab.
- Export .docx: mở lại bằng Word không lỗi; fidelity ≥ mức cam kết từng tháng.
- Comments: tạo/xoá/resolve thread, sống sót khi đồng sửa.
- Không lỗi console, build + typecheck pass, test hiện có không vỡ.

## 9. Next steps

1. Tạo plan chi tiết (`/ck:plan`) cho toàn bộ 3 đợt với frontmatter `status: pending`.
2. Dựng khung `packages/tiptap-extensions` trước khi viết extension đầu tiên.
3. Chốt mảng D trước (export .docx) vì là mốc chiến lược M4.
