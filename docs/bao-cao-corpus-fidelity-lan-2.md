# Báo cáo chạy Bộ mẫu Fidelity lần 2 (bộ mẫu tổng hợp mở rộng — 17 file)

> Ngày 26/08/2026 · Suite: `packages/fidelity-harness/src/__tests__/corpus.fidelity.test.ts`
> Pipeline đo: `file gốc → convertDocxToHtml → exportDocx → so text + format XML`

## Phương pháp đo (tóm tắt)

Giữ nguyên phương pháp lần 1 (`docs/bao-cao-corpus-fidelity-lan-1.md`): mỗi file chạy round-trip import → export rồi so sánh:

| Phép đo | Ngưỡng | Ghi nhận |
|---|---|---|
| Text fidelity (keyword match, tối đa 200 từ) | ≥ 95% | Đạt trên cả 17 file |
| Format lost (nhãn có trong XML gốc nhưng thiếu ở XML output) | `= []` | Đạt trên cả 17 file |

Thư mục corpus giờ là **17 file .docx** tại `<root>/corpus/` (gitignored): **4 file legacy ad-hoc** (lần 1) + **13 file sinh tự động mới**. Suite tự SKIP khi thư mục rỗng, hỗ trợ `CORPUS_DIR` trỏ thư mục khác.

## Bộ sinh corpus tái lập (mới)

- `packages/fidelity-harness/src/corpus-generator.utils.ts` — khai `CORPUS_ENTRIES` (12 HTML nguồn TipTap-compatible), `generateCorpus()` dựng .docx bằng chính `exportDocx` của docx-io; riêng file header/footer dùng `injectHeaderFooter()` **phẫu thuật part** qua `@office/ooxml-core` (`setPartText` trên `header1.xml`/`footer1.xml` + `[Content_Types].xml` + rels + chèn `w:headerReference`/`w:footerReference` vào `sectPr`).
- `packages/fidelity-harness/scripts/gen-corpus.ts` — CLI ghi 13 file ra `<root>/corpus/`.
- Chạy lại: `pnpm --filter @office/fidelity-harness corpus`.

Lợi ích: bộ mẫu **reproducible**, sinh lại bất cứ lúc nào không cần Word/LibreOffice; mỗi file nhắm đúng một nhóm tính năng để trượt nào biết lỗi mapping đó.

## Danh mục 17 file corpus

### 4 file legacy ad-hoc (từ lần 1)

| File | Phạm vi phủ |
|---|---|
| synthetic-van-ban-co-ban.docx | Văn bản cơ bản: heading/bold/italic/underline/color/highlight/align/page-break (file từng ❌ FAIL trước khi có hậu xử lý) |
| synthetic-danh-sach-bang.docx | Danh sách + bảng đơn giản |
| synthetic-trang-dai.docx | Trang dài, ngắt trang giữa nội dung |
| ui-test-dinh-dang.docx | Hỗn hợp định dạng phục vụ kiểm thử UI |

### 13 file sinh tự động (lần 2)

| File | Phạm vi phủ |
|---|---|
| synthetic-bang-merge-colspan.docx | Bảng gộp ô ngang (`colspan`) kèm tô nền ô (`background-color`) |
| synthetic-danh-sach-da-cap.docx | Danh sách lồng 3 cấp (`ul → ul → ol`) |
| synthetic-anh-nhung.docx | Ảnh base64 PNG nhúng, 2 kích thước khác nhau |
| synthetic-hyperlink-dang-cach.docx | Hyperlink hỗn hợp: web, `mailto:`, link giữa câu |
| synthetic-bookmark-anchor.docx | Bookmark anchor đặt giữa câu (`data-bookmark-id`/`data-bookmark-name`) |
| synthetic-chan-trang-chu-thich.docx | Chú thích cuối trang (`data-type="footnote"` kèm nội dung) |
| synthetic-nd30-cong-van.docx | Công văn phong NĐ 30/2020: justify, Times New Roman, 13.5pt, line-height 1.5, khối số/v/v căn phải, `<hr>` |
| synthetic-ma-nguon-pre.docx | Code block `pre/code` với `data-language` |
| synthetic-callout-bon-loai.docx | 4 loại callout: info / tip / warning / danger |
| synthetic-task-list-checklist.docx | Task list checklist `data-checked` true/false |
| synthetic-ngat-trang-da-phan.docx | Nhiều page-break chia tài liệu thành các phần |
| synthetic-tong-hop-lop-a.docx | Mix tổng hợp Lớp-A: inline formats + căn giữa + blockquote + `<hr>` + bảng có tô ô + list + ảnh + link + page-break |
| synthetic-header-footer-so-trang.docx | Header + footer + field `PAGE` (chỉ đo robustness chiều import — xem Gap còn lại) |

## Kết quả gate — 100% PASS

**Fidelity-harness 19/19 pass**, gồm 17 test round-trip corpus (mỗi file 1 test) đều đạt: text ≥ 95%, format lost `[]`. Không file nào ❌ FAIL.

| Hạng mục kiểm chứng toàn kho | Kết quả |
|---|---|
| Typecheck | Pass |
| docx-io unit test | 25/25 pass |
| fidelity-harness (gồm corpus gate 17 file) | 19/19 pass — **gate 100%** |
| apps/docs test | 55/55 pass |
| turbo build (toàn monorepo) | 9/9 pass |

## Thay đổi engine — bộ mẫu mới lộ trượt thật, đã sửa

Để đạt gate 100%, 13 file mới đã bộc lộ 4 lỗ hổng thật của đường import trong `packages/docx-io`:

1. **Lọc block đối xứng hai phía** — trước đây phía HTML (`collectBlocks`) và phía XML plan (`extractBodyFormatPlan`) đếm block khác nhau (đoạn chỉ chứa ảnh/hr bị tính lệch) → formatting bù sai vị trí cho **toàn tài liệu**. Giờ cả hai phía cùng chỉ đếm block có ký tự text:
   - `collectBlocks` — `packages/docx-io/src/ooxml-to-html/inject-formatting.utils.ts`
   - `extractBodyFormatPlan` — `packages/docx-io/src/ooxml-to-html/document-formatting.utils.ts`
2. **Khôi phục shading + border trái cấp đoạn** — `extractBodyFormatPlan` đọc thêm `pPr > w:shd @fill` (loại trừ trắng/nền mặc định `FFFFFF`/`F1F5F9` qua hằng chung `IGNORABLE_SHD_FILLS`) và màu `pBdr-left`; injector gắn `data-bg-color`/`data-border`/`data-border-color` mà `exportDocx` render lại được.
3. **Mới — `injectTableCellShading`** (`packages/docx-io/src/ooxml-to-html/inject-formatting.utils.ts`): map tuần tự fill trong `w:tc/tcPr` lên `td/th` theo thứ tự dưới dạng `background-color` inline. Guard an toàn: số ô lệch → no-op nguyên HTML; bảng lồng writer chưa hỗ trợ nên không xét. Nối sau `injectDirectFormatting` trong `packages/docx-io/src/index.ts` (`withDirectFormatting`).
4. **Gia cố XSS sanitizer đường import** (`packages/docx-io/src/import.ts`, hàm `importHtml`): strip khối cặp `iframe/object/form/script/style`, thẻ void `base/meta/link/embed`, thuộc tính sự kiện `on*`, URL `javascript:`/`vbscript:`/`data:text/html` trong `href`/`src`/`xlink:href`. Động lực: đường import markdown (marked) mở rộng bề mặt tấn công. Test riêng: `src/__tests__/import-sanitize.test.ts`.

## Nhãn kiểm chuẩn mở rộng

`standardFormatChecks` (`packages/fidelity-harness/src/docx-fidelity.ts`) bổ sung 2 nhãn, nâng tổng lên **14 nhãn**:

| Nhãn mới | Pattern |
|---|---|
| `image` | `/w:drawing/` |
| `grid-span` | `/w:gridSpan /` |

## Gap còn lại (đã xác minh bằng probe — không giấu)

| Gap | Nguyên nhân | Tác động |
|---|---|---|
| `bookmarkStart/bookmarkEnd` mất khi import | mammoth bỏ qua bookmark | Không đưa làm nhãn gate |
| `footnoteReference` mất khi import | mammoth không tái tạo convention `data-type="footnote"` của editor | Chú thích biến mất sau round-trip |
| Header/footer chưa viết lại khi re-export | writer chưa hỗ trợ `headerReference`/`footerReference` — phạm vi roadmap **M4** | File header/footer chỉ đo robustness chiều import |
| rowspan (`vMerge`) không hỗ trợ | renderer bảng chỉ làm colspan | Bảng gộp dọc vẫn mất cấu trúc |
| Byte zip corpus chứa timestamp hiện tại | content giống nhau giữa các lần chạy nhưng MD5 khác | Chỉ ảnh hưởng nếu CI muốn pin checksum |

## Bước tiếp theo

1. **Bộ mẫu thật 50–100 file** từ owner (ẩn danh hoá trước theo `docs/huong-dan-bo-mau-fidelity.md`) — điều kiện tuyên bố Đầy đủ tính năng Docs.
2. Tuỳ chọn determinism: fixed date trong jszip options nếu CI cần pin checksum corpus.
3. Tái tạo bookmark/footnote khi import (không phụ thuộc mammoth).
4. Writer hỗ trợ header/footer khi export = roadmap **M4**.

## Ghi chú vận hành

- `corpus/` nằm ở repo root, gitignored — **không commit**; tái tạo bất kỳ lúc nào bằng `pnpm --filter @office/fidelity-harness corpus`.
- Chạy đo: `pnpm --filter @office/fidelity-harness test` (thư mục rỗng → suite tự SKIP).
