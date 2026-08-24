# Báo cáo chạy Bộ mẫu Fidelity lần 1 (bộ mẫu tổng hợp)

> Ngày 24/08/2026 · Suite: `packages/fidelity-harness/src/__tests__/corpus.fidelity.test.ts`
> Pipeline đo: `file gốc → convertDocxToHtml → exportDocx → so text + format XML`

## Kết quả

| File | Text fidelity | Format | Kết luận |
|---|---|---|---|
| synthetic-danh-sach-bang.docx | 100% | Đủ | ✅ PASS |
| synthetic-van-ban-co-ban.docx | 100% | Mất 4 format | ❌ FAIL |
| synthetic-trang-dai.docx | 100% | Mất page-break | ❌ FAIL |

## Gap phát hiện — nguyên nhân gốc

`convertDocxToHtml` (`packages/docx-io/src/index.ts:37`) dùng **mammoth** bản browser với cấu hình mặc định. Mammoth bỏ qua hoàn toàn các direct formatting sau khi parse:

| Phần tử OOXML | HTML mong đợi (TipTap) | Hiện tại |
|---|---|---|
| `<w:u>` underline | `<u>` | Bị bỏ |
| `<w:color>` màu chữ | `<span style="color:#…">` | Bị bỏ |
| `<w:shd>` highlight | `<mark>` | Bị bỏ |
| `<w:jc>` căn lề đoạn | `style="text-align:…"` | Bị bỏ |
| `<w:br w:type="page"/>` ngắt trang | node PageBreak | Bị bỏ |

Đã xác minh: format được **export đúng** (`document.xml` gốc có đủ `<w:u/>`, `<w:color/>`...) — mất ở chiều **import** (mammoth không sinh HTML tương ứng).

## Mức độ ảnh hưởng thực tế

- **Đường mở file .docx vào editor**: mọi văn bản dùng gạch chân/màu/highlight/căn lề/ngắt trang sẽ hiển thị thiếu định dạng. Đây là định dạng cực phổ biến trong văn bản hành chính VN (Nghị định 30/2020).
- **Đường lưu có nguồn (`docx-sources`, patch T1)**: phần KHÔNG bị sửa vẫn giữ byte gốc an toàn; nhưng vùng bị chạm sẽ tái tạo từ HTML đã mất format → lỗi dần theo từng lần lưu.

## Khuyến nghị xử lý (đã chọn Hướng B cải tiến)

~~1. **Hướng A — tự viết mapper `ooxml→html` cho tập Lớp A**...~~
~~2. **Hướng B — hậu xử lý đầu ra mammoth**: khớp run theo thứ tự, rủi ro lệch vị trí...~~

## Kết quả xử lý

Đã triển khai **hậu xử lý theo offset ký tự** (không phải khớp-run naïve):

- Module mới `packages/docx-io/src/ooxml-to-html/document-formatting.utils.ts` — đọc thẳng `document.xml`, trích xuất per-paragraph: align (`w:jc`), segments định dạng ký tự (`w:u`/`w:strike`/`w:color`/`w:shd`) theo offset, vị trí page break (`w:br w:type="page"`); bỏ qua runs trong `w:hyperlink` (tránh bồi formatting link), hỗ trợ `w:ins`.
- Module mới `packages/docx-io/src/ooxml-to-html/inject-formatting.utils.ts` — parse HTML mammoth bằng `parseHtmlToTree` (có fallback tokenizer cho Node), khớp block `p/h1-h6/li` theo thứ tự tài liệu, tách text node tại ranh giới segment rồi wrap `<u>/<span style=color>/<mark>`; chèn `<div data-type="page-break">`; **an toàn thất bại**: số block lệch → trả nguyên HTML gốc.
- Nối vào `convertDocxToHtml` (`src/index.ts`) với try/catch nuốt lỗi — xấu nhất trở lại như cũ, không bao giờ tệ hơn.

**Kết quả kiểm chứng:**

| Hạng mục | Kết quả |
|---|---|
| Unit test mới (`direct-formatting.test.ts`) | 8/8 pass |
| docx-io toàn bộ | 19/19 pass |
| Corpus gate (3 file tổng hợp) | 6/6 pass — **0 format mất** |
| apps/docs test | 51/51 pass |
| Browser thật (importDocxFile qua Vite module) | 137ms, đủ u/mark/color/align/page-break, không double-strike |

Giới hạn còn lại: chưa đo khác biệt render pixel; các phần tử ngoài tập trên (vd `w:tabs`, spacing) chưa bù.

## Ghi chú vận hành

- 3 file tổng hợp đang nằm tại `corpus/` (gitignored) làm dữ liệu pipeline; thay bằng bộ mẫu thật theo `docs/huong-dan-bo-mau-fidelity.md`.
- Chạy lại: `pnpm --filter @office/fidelity-harness test`
