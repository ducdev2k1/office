# Web Office

Bộ ứng dụng văn phòng web (Docs / Sheets / Slides) theo mô hình local-first: hoạt động offline hoàn toàn, không bắt buộc đăng nhập ở giai đoạn MVP.

## Language

### Định nghĩa phạm vi

**Đầy đủ tính năng (Docs)**:
Mọi tính năng trong phạm vi MVP hoạt động đúng VÀ chất lượng file được chứng minh bằng fidelity-harness trên bộ mẫu: round-trip Lớp A ≥95%, Lớp B bảo toàn 100% byte, Word/LibreOffice mở không cảnh báo. KHÔNG gộp kiểm chứng vận hành dài hạn.
_Avoid_: "xong rồi", "feature-complete" mơ hồ không nêu thước đo

**Đầy đủ tính năng (Sheets)**:
Hai trục độc lập, phải đạt cùng lúc: (1) Trục tính năng — checklist tính năng cốt lõi bảng tính kiểu Google Sheets chạy đúng; (2) Trục file — chất lượng file chứng minh bằng round-trip `.xlsx` trên Bộ mẫu thật xlsx, ngưỡng ≥95% phần tử Lớp A (.xlsx), phần còn lại bảo toàn opaque. KHÔNG gộp kiểm chứng vận hành dài hạn.
_Avoid_: "như Google Sheets", "hoàn thiện như gg sheet", "xong sheet rồi"

**Sẵn sàng phát hành MVP**:
Đầy đủ tính năng + vượt qua 4 tuần dùng thử nội bộ mà không mất dữ liệu. Đây là mốc vận hành, tách biệt khỏi mốc tính năng.

**Bộ mẫu thật**:
50–100 file `.docx` lấy từ tài liệu thật đã ẩn danh hoá, đại diện hồ sơ thực tế của người dùng cuối. Chỉ bộ mẫu này chứng minh được cam kết "không hỏng file khách".

**Bộ mẫu tổng hợp**:
File `.docx` sinh tự động phủ đủ phần tử Lớp A, dùng để kiểm tra pipeline harness chạy đúng trước khi có Bộ mẫu thật. Không thay thế được Bộ mẫu thật khi tuyên bố đạt.

**MVP (M1–M5)**:
Phạm vi sản phẩm tối thiểu của Docs: editor offline + round-trip `.docx` + quản lý file + PWA. Không gồm SSO OneMail, Drive, cộng tác phân quyền thật (thuộc Giai đoạn 4–5 sau MVP).
_Avoid_: "full product", "production-ready"

**Ngoài scope dài hạn**:
Các tính năng đã chủ động hoãn qua phiên grilling ngày 21/08: AI assist, voice typing, smart chips, RTF/ODT import, pageless mode, shapes/drawing, translate doc. Riêng Sheets (hoãn phiên 24/08): protection khóa sheet/cell, pivot table, sparkline.

**Chuẩn bản mở**:
Mọi dependency bắt buộc license permisssive miễn phí (Apache-2.0, MIT hoặc tương đương). Cấm GPL và license thương mại — kể cả engine/plugin thay thế (không dùng HyperFormula, không mua Univer Pro).
_Avoid_: "free", "bản mở" dùng chung chung không nêu license

### Chất lượng file .docx

**Lớp A**:
Nhóm phần tử docx cam kết sửa được VÀ round-trip đầy đủ: đoạn văn, heading, định dạng ký tự, danh sách nhiều cấp, bảng, ảnh nhúng, hyperlink, bookmark, khổ giấy, header/footer.
_Avoid_: "phần tử chính"

**Lớp B**:
Nhóm phần tử docx cam kết bảo toàn nguyên vẹn từng byte nhưng chỉ-đọc dạng khối mờ (`ooxmlOpaque`): SmartArt, chart, OLE, track changes, comment gốc, hộp văn bản, công thức toán trong file nguồn.
_Avoid_: "phần tử phụ"

**Giữ nguyên (byte-preserving)**:
Mở → lưu KHÔNG sửa, file ra phải giống hệt từng byte file vào.

**Round-trip**:
Mở → sửa → lưu → mở lại: nội dung người dùng sửa còn nguyên VÀ các phần tử Lớp A không bị biến dạng.

**Tính hợp lệ**:
File kết quả mở bằng MS Word + LibreOffice không hiện cảnh báo hỏng file.

**Fidelity-harness**:
Bộ đo tự động chạy trong CI phát ra khác biệt máy đọc được (XPath, thuộc tính, expected vs actual) trên bộ mẫu `.docx` thật.

### Chất lượng file .xlsx

**Lớp A (.xlsx)**:
Nhóm phần tử xlsx cam kết sửa được VÀ round-trip đầy đủ: giá trị ô, formula cơ bản, style (font/fill/border/alignment/number format), merge, row/column size, multi-sheet, freeze, number format.
_Avoid_: "phần tử chính"

**Lớp B (.xlsx)**:
Nhóm phần tử xlsx cam kết bảo toàn opaque khi round-trip: chart gốc, image, pivot cache, data validation phức tạp, macro. File kết quả mở bằng Excel/LibreOffice không hỏng.
_Avoid_: "phần tử phụ"

**Bộ mẫu thật xlsx**:
File `.xlsx` thật của khách iNET đã ẩn danh hoá (30–50 file), bổ sung dần vào harness bắt đầu từ Bộ mẫu tổng hợp sinh tự động phủ Lớp A (.xlsx). Chỉ bộ mẫu này chứng minh được trục file của "Đầy đủ tính năng (Sheets)".

### Kiến trúc

**Preserve-and-patch (T1)**:
Chiến lược xử lý `.docx`: giữ byte OOXML gốc làm nguồn sự thật, chỉ ghi đè đúng phần người dùng chạm vào; phần không hiểu giữ nguyên XML thô.

**Hybrid zip-merge (xlsx-io)**:
Chiến lược ghi `.xlsx`: rebuild bằng ExcelJS các phần mình hiểu (sheet/style/merge/size), đồng thời copy nguyên byte các part không hiểu (chart, image, pivot cache, macro) từ zip gốc sang file mới để bảo toàn Lớp B (.xlsx).

**Local-first**:
Dữ liệu và phiên làm việc sống tại máy người dùng (IndexedDB + Hocuspocus); server là kênh đồng bộ, không phải điều kiện chạy.
