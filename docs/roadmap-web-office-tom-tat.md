# Web Office Suite — Bản chốt trình lãnh đạo

**Ngày 17/08/2026** · Chi tiết đầy đủ: [`roadmap-web-office.md`](roadmap-web-office.md)

---

## Đề xuất

Xây dựng bộ Office web riêng của iNET (Docs · Sheets · Slides) chạy hoàn toàn trên trình duyệt, thay thế Collabora Online, hoàn thiện **OneMail + Drive → Workspace**.

**Chi phí bản quyền: 0đ.** Toàn bộ dùng mã nguồn mở giấy phép tự do, không phải công khai mã nguồn sản phẩm.

---

## Vì sao phải làm

**1. Ta không kiểm soát được sản phẩm của chính mình.** Collabora là phần mềm chạy trên máy chủ, nhúng vào sản phẩm qua một khung cửa sổ. Ta không đổi được giao diện, không nhúng sâu vào OneMail/Drive, không thêm được tính năng riêng (mẫu tài liệu, ký số, luồng duyệt, trợ lý AI), không tự vá được lỗi khi khách báo.

**2. Đây là mảnh ghép còn thiếu để có Workspace.** OneMail (tài khoản) + Drive (dung lượng, đã có sẵn trong gói) + Office (soạn thảo) = bộ sản phẩm cạnh tranh trực tiếp Google Workspace ở phân khúc doanh nghiệp Việt Nam, với lợi thế dữ liệu lưu trong nước.

**3. Chi phí máy chủ giảm mạnh.** Collabora tính toán ở máy chủ, chi phí tăng theo số người dùng. Hướng mới đẩy tính toán xuống trình duyệt — chi phí máy chủ gần như không tăng dù bao nhiêu người dùng. _(Chưa có số liệu Collabora hiện tại để định lượng.)_

---

## Lộ trình — 5 mốc, mỗi mốc giao được một thứ dùng thật

| Mốc    | Thời điểm     | Giao được gì                                                           | Giá trị                                                                  |
| ------ | ------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **M1** | Ngày 30       | Docs offline chạy được, cài như ứng dụng, mất mạng vẫn soạn thảo       | Demo được, dùng nội bộ cho tài liệu mới                                  |
| **M2** | Ngày 60       | **Xem file Word `.docx`**, mở ra chuẩn xác, lưu lại không sai một byte | **Triển khai thật.** Xem file đính kèm trong OneMail không cần Collabora |
| **M3** | Tháng 2–4     | Sửa được file Word trong trình soạn thảo                               | Dùng thử nội bộ, đo chất lượng                                           |
| **M4** | Tháng 4–6     | Mở, sửa, lưu file Word không hỏng định dạng                            | Thay Collabora cho tài liệu thường dùng                                  |
| **M5** | **Tháng 6–9** | 🎯 **MVP nghiệm thu**                                                  | Đủ điều kiện chuyển đổi chính thức                                       |

**Sau MVP:** ghép OneMail SSO + Drive + cộng tác nhiều người (+2 tháng) → Sheets → Slides → **bộ hoàn chỉnh 15–20 tháng**.

> **M2 ở ngày 60 là điểm đáng chú ý nhất.** Phần lớn lượt mở Collabora thực tế chỉ là _xem_ file, không sửa. Chiếm được luồng xem từ tháng thứ hai đã giảm tải Collabora ngay và cho số liệu thật để báo cáo, trong khi phần khó vẫn đang làm.

---

## Công nghệ sử dụng

| Dùng gì                       | Để làm gì                                                                                                  | Giấy phép |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | --------- |
| **React + TypeScript**        | Nền dựng giao diện. Phổ biến nhất hiện nay, dễ tuyển người                                                 | Miễn phí  |
| **shadcn/ui**                 | Bộ nút, menu, hộp thoại. **Là mã nguồn chép vào dự án — iNET sở hữu hoàn toàn**, không phụ thuộc bên ngoài | Miễn phí  |
| **Bảng màu thương hiệu iNET** | Để bộ Office trông đúng là một phần của OneMail                                                            | —         |
| **TipTap**                    | Động cơ soạn thảo văn bản — vai trò tương đương phần lõi của Word. **Đã có và đang chạy tốt**              | Miễn phí  |
| **docx-preview**              | Hiển thị file Word chính xác cao. Tiết kiệm nhiều tháng so với tự viết                                     | Miễn phí  |
| **Univer**                    | Động cơ bảng tính cho Sheets                                                                               | Miễn phí  |
| **ExcelJS**                   | Đọc ghi file Excel                                                                                         | Miễn phí  |
| **pptx-viewer**               | Đọc, hiển thị, sửa file PowerPoint                                                                         | Miễn phí  |
| **Yjs**                       | Cho phép nhiều người sửa cùng lúc và làm việc khi mất mạng                                                 | Miễn phí  |
| **NestJS + S3**               | Máy chủ, chỉ xác thực và cấp quyền. File đi thẳng trình duyệt ↔ Drive, không qua máy chủ                   | Miễn phí  |

**Điểm mấu chốt về chất lượng file:** ta giữ nguyên vẹn file gốc của khách và **chỉ sửa đúng chỗ người dùng chạm vào**. Phần nào hệ thống chưa hiểu thì hiển thị dạng chỉ đọc và **giữ nguyên khi lưu**, thay vì xóa mất.

> Cam kết là **"không bao giờ làm mất dữ liệu của khách"**, không phải "sửa được mọi thứ". Đây là điểm đa số sản phẩm cạnh tranh làm sai.

---

## Nguồn lực và thời gian

| Nhân sự                     | Docs MVP      | Bộ hoàn chỉnh |
| --------------------------- | ------------- | ------------- |
| **1 kỹ sư + AI** (hiện tại) | **6–9 tháng** | 15–20 tháng   |
| 2–3 kỹ sư + AI              | **4–5 tháng** | 9–13 tháng    |
| 4–6 kỹ sư + AI              | 3–4 tháng     | 7–9 tháng     |

Con số dựa trên bóc tách chi tiết 111–171 ngày làm việc, đã tính hỗ trợ AI.

---

## Ba rủi ro chính

| Rủi ro                                                                                | Mức độ       | Xử lý                                                                                                            |
| ------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Toàn bộ dự án phụ thuộc 1 kỹ sư trong 7 tháng.** Một đợt ốm 2 tuần là trượt tiến độ | Nghiêm trọng | Bổ sung người thứ hai từ tháng 2 — cũng đưa MVP về 4–5 tháng                                                     |
| **Chất lượng mở/lưu file không đạt**                                                  | Nghiêm trọng | Bộ đo tự động từ tháng 2; mốc ngày 60 là **điểm dừng an toàn** — không đạt thì dừng xem xét khi mới tiêu 2 tháng |
| **Thư viện PowerPoint mới 5 tháng tuổi, một tác giả**                                 | Trung bình   | Xếp cuối lộ trình; khảo sát 2 tuần bằng file thật của khách trước khi cam kết                                    |

---

## Chiến lược chuyển đổi — không thay một lần

Collabora là phần mềm có hàng chục năm xử lý định dạng Office. Cam kết "vài tháng thay xong" là cách chắc chắn nhất để mất uy tín khi khách mở một file phức tạp.

**Tháng 0–2:** Collabora vẫn là chính, ta thu thập file mẫu.
**Tháng 2–7:** nền tảng mới chiếm luồng _xem file_; Collabora chỉ còn phục vụ sửa.
**Tháng 7–11:** nền tảng mới thành mặc định; file phức tạp **tự động** chuyển sang Collabora, người dùng không thấy khác biệt.
**Tháng 11+:** thu hẹp Collabora theo số liệu thực tế.

**Tiêu chí tắt hẳn Collabora** — phải đạt đồng thời: bộ mẫu đạt ≥95% · tỉ lệ phải chuyển sang Collabora dưới 5% liên tục 60 ngày · không có sự cố mất dữ liệu nào trong 90 ngày · tốc độ mở file không chậm hơn hiện tại.
