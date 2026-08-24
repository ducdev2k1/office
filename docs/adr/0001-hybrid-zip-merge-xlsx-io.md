# Hybrid zip-merge cho chiều ghi xlsx-io

Trục file của "Đầy đủ tính năng (Sheets)" cam kết Lớp B (.xlsx) bảo toàn opaque, nhưng `@office/xlsx-io` hiện rebuild toàn bộ file qua ExcelJS nên chart/image/pivot cache/macro của file gốc bị loại bỏ khi export. Quyết định (phiên grilling 24/08/2026): **rebuild bằng ExcelJS các part mình hiểu (sheet/style/merge/size), đồng thời copy nguyên byte các part không hiểu từ zip gốc sang file mới** — đủ cam kết Lớp B với công sức trung bình.

## Considered Options

| Phương án | Kết luận |
| --- | --- |
| Rebuild thuần (ExcelJS toàn bộ) | ❌ Nhanh nhất nhưng mất Lớp B → phải hạ cam kết thành "chấp nhận mất" |
| **Hybrid zip-merge** | ✅ Chọn — giữ cam kết Lớp B, không phải đổi kiến trúc lớn |
| Preserve-and-patch toàn phần kiểu docx-io (zip gốc làm nguồn sự thật) | ❌ Mạnh nhất nhưng nặng nhất; cân nhắc lại chỉ khi Bộ mẫu thật cho thấy đa số file có Lớp B dày đặc |

## Consequences

- Chiều import bắt buộc lưu thêm **zip gốc dạng sidecar** cạnh snapshot trong `storage-adapter` — nếu không có byte gốc thì không có gì để merge lúc export.
- Các part copy nguyên byte không được phá relationship/content-types; phần wiring rId trỏ vào sheet XML đã rebuild phải xử lý cẩn thận.
- Fidelity-harness phải assert thêm: part Lớp B sau round-trip giống hệt từng byte part trước đó.
