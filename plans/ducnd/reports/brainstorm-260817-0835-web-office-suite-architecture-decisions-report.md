# Biên bản quyết định kỹ thuật — Web Office Suite

|            |                                                               |
| ---------- | ------------------------------------------------------------- |
| Ngày       | 17/08/2026                                                    |
| Phiên      | `/brainstorm` — lộ trình bộ Office web thay Collabora         |
| Đầu ra     | `docs/roadmap-web-office.md` · `docs/roadmap-web-office.html` |
| Trạng thái | Đã chốt kiến trúc, chưa triển khai                            |

## Bối cảnh

Repo `onemail-docs` đã có Docs editor TipTap chạy được (106 file, React 19 + Vite 6 + TipTap 3.30, toolbar đầy đủ, bảng, ảnh, find-replace, pagination tự build, localStorage). Chưa có khả năng đọc/ghi file Office. Roadmap cũ v6.1 (microservices NestJS từ đầu, cloud-first) không còn phù hợp với hướng offline-first mới.

## Ràng buộc do người dùng chốt

| #   | Ràng buộc                                     | Nguồn            |
| --- | --------------------------------------------- | ---------------- |
| C1  | Chỉ OSS giấy phép dễ dãi (MIT/Apache-2.0/BSD) | chốt trong phiên |
| C2  | Không mua bản quyền thương mại                | chốt trong phiên |
| C3  | Không mở mã nguồn sản phẩm iNET               | chốt trong phiên |
| C4  | Offline-first, không cần đăng nhập ở MVP      | yêu cầu ban đầu  |
| C5  | 3 app chạy/triển khai độc lập                 | yêu cầu ban đầu  |
| C6  | Dùng chung OneMail SSO + Drive (lưu trên S3)  | chốt trong phiên |
| C7  | Round-trip `.docx` chất lượng cao             | chốt trong phiên |
| C8  | 1 dev + AI, muốn MVP càng sớm càng tốt        | chốt trong phiên |

## Quyết định đã chốt

**Q1 — Kiến trúc file `.docx`: T1 preserve-and-patch, tự xây.**
Giữ nguyên OOXML gốc làm source of truth trong IndexedDB; TipTap là view sửa được trên body; chỉ patch phần đã sửa; phần không hiểu → opaque node bảo toàn nguyên vẹn. Không thể retrofit — xuyên qua storage, editor binding, Yjs schema.

**Q2 — Loại SuperDoc.** Đã hiện thực đúng T1 (967 sao, 7.361 commit, ProseMirror + Yjs, client-side). AGPLv3 → vi phạm C1/C3. Bản thương mại → vi phạm C2. Chi phí của quyết định: **3–4 tháng** trong tổng 6–9 tháng (gần một nửa tiến độ), cộng chất lượng round-trip thấp hơn ở giai đoạn đầu.
Vệ sinh pháp lý: **không đọc source SuperDoc**. Tham chiếu hợp lệ = ECMA-376 + `docx-preview` (Apache-2.0).

**Q3 — Loại T0 (convert thẳng `mammoth` → TipTap → `docx`).** Vi phạm C7: mỗi lần save là mất dữ liệu.

**Q4 — Hợp đồng phạm vi MVP (điều kiện để ước lượng 6–9 tháng có nghĩa; nới phạm vi → 18–24 tháng).**
Lớp A (sửa được, round-trip đầy đủ): đoạn văn, heading, định dạng ký tự, list nhiều cấp, bảng gộp ô, ảnh, hyperlink, bookmark, page setup, styles, header/footer hiển thị.
Lớp B (bảo toàn 100%, chưa sửa): SmartArt, chart, OLE, content control, field, footnote/endnote, comment, track changes, textbox, công thức toán.
Ngoài phạm vi: Sheets, Slides, login, Drive, collab, PDF chất lượng in.

**Q5 — Không microservices.** MVP không cần backend. Từ tháng 9: **một** NestJS nhiều module. Drive trên S3 → browser PUT/GET thẳng qua pre-signed URL, byte file không qua server → càng ít thứ để tách.

**Q6 — Hai khoản đầu tư trước (vi phạm YAGNI có ý thức):** `storage-adapter` và `Y.Doc` làm source of truth ngay từ MVP. Không retrofit được.

**Q11 — Frontend UI: shadcn/ui + Base UI + Tailwind.**
Repo đã có sẵn `@base-ui/react` (nền mặc định shadcn từ 7/2026), `clsx`, `class-variance-authority`, `lucide-react`. Thiếu Tailwind — hiện dùng SCSS (13 file). Chi phí: cài Tailwind + `cn()` + chuyển 9 primitive `tiptap-ui-primitive/` sang Tailwind = **4–6 ngày, làm ở M1** (làm sau = viết lại toàn bộ UI của M2–M5). M1 tăng 12–18 → 16–24 ngày.
Ưu điểm hợp ràng buộc: shadcn **không phải dependency**, là mã chép vào dự án, MIT, ta sở hữu → không rủi ro chuỗi cung ứng, không ghim version.
Kèm theo: sửa `@base-ui/react` và `class-variance-authority` từ `devDependencies` sang `dependencies` (phân loại sai).

**Q12 — Design token: chỉ lấy bảng màu iNET, không phụ thuộc ViUI/Vue.**
ViUI chạy Vue3+Vuetify nên component không tái dùng được trong React; chỉ tái dùng **giá trị màu**. `packages/ui-kit` giữ bộ token dùng chung, điều khiển theme shadcn và về sau ghi đè theme Univer/pptx-viewer.

**R9 (mới) — ba ứng dụng trông không giống nhau.** Univer và pptx-viewer mang UI riêng (toolbar, ribbon, inspector), không tự theo shadcn. Đánh thẳng vào lập luận số một để thay Collabora ("giao diện thống nhất với OneMail"). Mitigate bằng design token dùng chung dựng từ M1 — phải chủ động, không hy vọng có sẵn.

**Q7 — Sheets trước Slides.** Sheets dùng nhiều hơn, rủi ro thấp hơn.

**Q8 — Luận điểm trình cấp trên: chủ quyền sản phẩm, không phải chi phí.** Người dùng không có số liệu chi phí Collabora; pain point thật là "không control được". Chi phí giữ lại làm hệ quả phụ kèm khung đo.

## Kiểm chứng giấy phép (npm registry, 17/08/2026)

Sạch: `@tiptap/*` MIT (kể cả `extension-find-and-replace`) · `docx-preview` Apache-2.0 · `jszip` MIT · `fast-xml-parser` MIT · `yjs`/`y-prosemirror`/`y-indexeddb` MIT · `exceljs` MIT · `@univerjs/core` Apache-2.0 · `pptx-viewer` Apache-2.0.

Loại: SuperDoc (AGPL/thương mại) · Univer Pro (thương mại — chứa import/export xlsx, collab, print, chart, pivot, formula nâng cao) · SheetJS CE (âm thầm bỏ styling khi ghi → dùng ExcelJS).

## Diễn biến ước lượng trong phiên — 4 lần

| Lần          | Con số                      | Đánh giá                                                                                                                           |
| ------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1            | 5–7 tháng                   | Gần đúng, hơi lạc quan                                                                                                             |
| 2            | 90 ngày                     | **Sai — chiều theo áp lực.** Nhét quá nhiều vào 30 ngày đầu; ước lượng đuôi dài gỡ lỗi quá nhẹ. Không có cơ chế kỹ thuật biện minh |
| 3            | 8–12 tháng                  | Quá thận trọng ở chiều ngược lại: coi vòng lặp gỡ lỗi là việc thủ công                                                             |
| **4 (chốt)** | **6–9 tháng, điểm giữa ~7** | Có cơ chế cụ thể (Q10). Bóc tách 107–165 ngày, quy đổi 19–20 ngày/tháng                                                            |

**Q9 — Tách "xem" khỏi "sửa".**
`docx-preview` (Apache-2.0) đã kết xuất `.docx` chất lượng cao sẵn → không cần tự viết phần hiển thị; chỉ chế độ _sửa_ mới cần ánh xạ sang TipTap. Cho phép giao **trình xem `.docx` ở ngày 60** — mốc có giá trị nghiệp vụ thật sớm nhất, vì phần lớn lượt mở Collabora chỉ là xem file.

**Q10 — `fidelity-harness` phải phát khác biệt máy đọc được. Quyết định đáng giá 1,5–2 tháng.**
Vòng lặp gỡ lỗi fidelity (chạy bộ đo → đọc khác biệt → sửa ánh xạ → lặp) là dạng vòng lặp agentic AI làm tốt — **nhưng chỉ khi bộ đo trả về XPath phần tử lệch, tên thuộc tính, giá trị mong đợi vs thực tế, toạ độ pixel sai.** Nếu chỉ trả về "đạt 87%" thì con người phải mò và đuôi dài quay về 25–40 ngày. Đây là tiêu chí nghiệm thu của M2, không phải tính năng phụ.

**Hỗ trợ AI — tính riêng theo loại việc:**

| Loại việc                          | Tăng tốc                    |
| ---------------------------------- | --------------------------- |
| Sinh mã cơ học bám đặc tả          | ≥2x                         |
| Tra cứu ECMA-376                   | Cao                         |
| Vòng lặp gỡ lỗi có thước đo cơ học | Cao — **với điều kiện Q10** |
| Thiết kế thuật toán                | Trung bình                  |
| Xác minh đúng đắn so với đặc tả    | Không                       |

**Năm thứ không nén được bằng tốc độ code:** thu thập corpus (phụ thuộc người khác) · 4 tuần dùng thử nội bộ (thời gian lịch) · xác minh đúng đắn OOXML · băng thông đọc hiểu của một người · quyết định kiến trúc.

**Để xuống dưới 6 tháng phải cắt phạm vi hoặc thêm nguồn lực, không phải ước lượng lại:** nới C3 (AGPL) → 3–5 tháng · thêm kỹ sư thứ hai → 4–5 tháng · bỏ bảng khỏi Lớp A → −1 đến −1,5 tháng (không khuyến nghị) · bỏ Yjs → −0,5 tháng nhưng viết lại sau (không nên).

**Năm mốc chốt:** M1 ngày 30 (Docs offline) · M2 ngày 60 (trình xem, triển khai thật) · M3 tháng 2–4 (sửa được) · M4 tháng 4–6 (round-trip Lớp A) · M5 tháng 6–9 (MVP). Trượt mốc → cắt phạm vi trong 1 tuần, không cắt chất lượng.

## Rủi ro nổi bật

- **R2 bus factor 1 dev** — cao/nghiêm trọng. 7 tháng phụ thuộc một người, không có dự phòng; ốm 2 tuần là trượt.
- **R1 round-trip không đạt** — mitigate bằng harness từ M2 và mốc byte-identical ngày 60 làm điểm dừng an toàn.
- **Lạm dụng AI sinh mã không kiểm chứng** — với OOXML, mã sai một cách hợp lý chỉ lộ ra ở file thứ 200 của khách; làm đuôi dài phình ra thay vì co lại.
- **R3 `pptx-viewer` — đánh giá lại bằng dữ liệu (17/08/2026).** Đính chính: ~21k lượt tải npm/tuần, không phải "không ai dùng" — sao GitHub (61) là chỉ báo sai. Tính năng đầy đủ thật (ribbon, 187 shape, 23 chart, SmartArt, animation, export PDF/video, Yjs collab). Rủi ro thật nằm ở: repo tạo 16/03/2026 (5 tháng), 2.319/2.326 commit người là của **một tác giả**, ~15 commit/ngày → mã sinh bằng AI quy mô lớn, 103–180 phiên bản trong 5 tháng → API chưa ổn định, 1 issue mở / 0 watcher → chưa ai đẩy tới giới hạn. Kết luận không đổi: vẫn dùng, nhưng fork + coi là mã nhà + ghim version + **spike bằng file thật của khách, không dùng file demo**.
- **R6 browser xóa IndexedDB** (Safari 7 ngày) — nghiêm trọng, hay bị bỏ sót. Storage Persistence API + không để IndexedDB là bản duy nhất.
- **Nới phạm vi giữa chừng** — rủi ro lớn nhất với mọi mốc thời gian.
- **Bộ đo không phát khác biệt máy đọc được** — làm hỏng giả định tăng tốc AI, +1,5–2 tháng. Là tiêu chí nghiệm thu M2.

## Câu hỏi còn mở

1. Số liệu chi phí Collabora (user đồng thời, RAM/CPU, license) — chưa có.
2. Quy trình ẩn danh file khách để làm corpus — cần thống nhất với bộ phận liên quan.
3. Giấy phép HyperFormula — nghi GPLv3, verify trước Sheets.
4. Univer OSS có bind được Yjs không, hay collab bắt buộc bản Pro.
5. S3 iNET: đã bật versioning chưa? có hỗ trợ conditional write (`If-Match`) không? ai cấu hình CORS?
6. Yêu cầu tuân thủ về nơi lưu dữ liệu.

## Bước tiếp

`/ck:plan` cho M1 (ngày 1–30) — phạm vi hẹp, mốc rõ, là điểm dừng an toàn nếu kiến trúc T1 không đứng vững.
