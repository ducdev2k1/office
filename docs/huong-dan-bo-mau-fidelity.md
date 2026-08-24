# Hướng dẫn Bộ mẫu Fidelity (.docx thật)

> Mục đích: chứng minh cam kết "không hỏng file khách" — tiêu chí bắt buộc để tuyên bố **Đầy đủ tính năng (Docs)** theo `CONTEXT.md` (round-trip Lớp A ≥95%, không mất format).

## 1. Quy trình ẩn danh hoá bộ mẫu

Thu thập 50–100 file `.docx` từ tài liệu nội bộ/thực tế (hợp đồng, báo cáo, biểu mẫu), sau đó ẩn danh hoá **trước khi** bỏ vào thư mục `corpus/`:

1. **Xoá metadata cá nhân** — mở file bằng Word → File → Info → Inspect Document:
   - Remove personal information (tác giả, công ty, manager)
   - Xoá Comments, Revisions, Versions nếu có
2. **Thay thế dữ liệu nhạy cảm**: tên người dùng thật → tên giả ("Nguyễn Văn A"), số CMND/CCCD/mã hợp đồng → chuỗi giả cùng định dạng, số tiền giữ nguyên cấu trúc.
3. **Giữ nguyên cấu trúc định dạng** — tuyệt đối không chỉnh style/bố cục khi ẩn danh hoá (làm mất giá trị đo lường).
4. **Đổi tên vô nghĩa**: `corpus-sample-001.docx`, `corpus-sample-002.docx`,... (tên file không gợi ý nội dung).
5. Kiểm tra nhanh: mở lại file bằng Word/LibreOffice — vẫn mở bình thường.

## 2. Chạy đo fidelity

```bash
# 1. Bỏ file đã ẩn danh hoá vào thư mục corpus/ ở repo root
mkdir -p corpus
cp /duong/dan/file-da-an-danh/*.docx corpus/

# 2. Chạy bộ đo
pnpm --filter @office/fidelity-harness test
```

Suite `corpus.fidelity.test.ts` sẽ tự động chạy từng file với pipeline:

```
file gốc → convertDocxToHtml → exportDocx → so sánh text + format
```

Tiêu chí từng file:

| Phép đo | Ngưỡng | Ý nghĩa |
|---|---|---|
| Text fidelity | ≥ 95% | Nội dung chữ còn nguyên qua round-trip |
| Format checks | 100% | Format có trong gốc phải còn trong output (heading, bold, bảng, list, link...) |

- Chưa có file nào trong `corpus/`: suite tự SKIP, CI không đỏ.
- Muốn trỏ tới thư mục khác: `CORPUS_DIR=/path/to/dir pnpm --filter @office/fidelity-harness test`.

## 3. Đọc kết quả & xử lý trượt

- Test fail hiển thị: `% text fidelity` + **danh sách format bị mất** theo label (`heading`, `table`, `hyperlink`...).
- Khi trượt: ghi nhận tên file + format mất vào issue, sửa mapping tương ứng trong `packages/docx-io` rồi chạy lại.
- Lưu ý giới hạn hiện tại của bộ đo: đo được **text + format XML**, chưa đo khác biệt render pixel (phép đo 2 đầy đủ theo roadmap). Kết quả này là điều kiện cần, chưa phải điều kiện đủ.

## 4. Bảo mật

- Thư mục `corpus/` đã nằm trong `.gitignore` — **không bao giờ commit** file thật lên repo.
- Sau khi đo xong và ghi kết quả, xoá bản local hoặc lưu trong kho có kiểm soát truy cập.
