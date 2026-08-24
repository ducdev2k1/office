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

## Khuyến nghị xử lý (chưa thực thi — cần quyết định)

1. **Hướng A — tự viết mapper `ooxml→html` cho tập Lớp A** thay thế mammoth ở bước import: kiểm soát đầy đủ `w:rPr`/`w:pPr`. Khớp định hướng roadmap M3–M4 (chuỗi phân giải kiểu + direct formatting). Effort lớn (~vài chục giờ), là công việc thật của M4.
2. **Hướng B — hậu xử lý đầu ra mammoth**: tự đọc `document.xml` và bù format còn thiếu vào HTML mammoth (khớp run theo thứ tự). Rủi ro lệch vị trí khi văn bản phức tạp.
3. Không thể đạt tiêu chí nghiệm thu MVP (round-trip ≥95% trên bộ mẫu có định dạng) nếu không xử lý một trong hai hướng trên.

## Ghi chú vận hành

- 3 file tổng hợp đang nằm tại `corpus/` (gitignored) làm dữ liệu pipeline; thay bằng bộ mẫu thật theo `docs/huong-dan-bo-mau-fidelity.md`.
- Chạy lại: `pnpm --filter @office/fidelity-harness test`
