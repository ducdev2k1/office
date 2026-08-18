# Lộ trình xây dựng Web Office Suite (Docs · Sheets · Slides)

|                |                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Phiên bản**  | 1.3                                                                                                                            |
| **Ngày**       | 17/08/2026                                                                                                                     |
| **Thay thế**   | `plans/lo-trinh-build-web-office-microservices.txt` (v6.1, 14/08/2026)                                                         |
| **Mục tiêu**   | Thay thế Collabora Online bằng bộ Office web tự chủ, hoàn thiện hệ sinh thái OneMail + Drive → Workspace                       |
| **Trạng thái** | Đề xuất, chờ duyệt                                                                                                             |
| **Đọc nhanh**  | Mục 1 (tóm tắt) → mục 6.1 (công nghệ, giải thích cho người không chuyên) → mục 7.0 (phạm vi cam kết) → mục 12 (điều cần quyết) |

---

## 1. Tóm tắt điều hành

Chúng ta đang dùng Collabora Online cho chức năng soạn thảo tài liệu trong hệ sinh thái OneMail + Drive. Vấn đề cốt lõi **không phải chi phí, mà là chúng ta không kiểm soát được sản phẩm của chính mình** — không tùy biến được giao diện, không nhúng sâu được vào OneMail/Drive, không thêm được tính năng riêng, không sửa được lỗi khi phát sinh.

Đề xuất: xây dựng bộ Office web riêng, chạy hoàn toàn trên trình duyệt, dùng **100% thư viện mã nguồn mở giấy phép dễ dãi (MIT / Apache-2.0), không phí bản quyền, không ràng buộc mở mã nguồn sản phẩm**.

**Kết quả then chốt — giao giá trị theo từng chặng, không chờ tới cuối:**

| Mốc    | Thời điểm | Giao được gì                                                                      | Giá trị nghiệp vụ                                                             |
| ------ | --------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **M1** | Ngày 30   | Docs offline chạy được: IndexedDB, PWA, mở/lưu file trên máy, export HTML/TXT/PDF | Demo được, dùng nội bộ cho tài liệu tạo mới                                   |
| **M2** | Ngày 60   | **Trình xem `.docx`** + lưu lại giống hệt từng byte                               | **Triển khai thật được.** Xem file đính kèm trong OneMail không cần Collabora |
| **M3** | Tháng 2–4 | Sửa được `.docx` trong trình soạn thảo (chưa lưu về `.docx`)                      | Dùng thử nội bộ, đo chất lượng hiển thị                                       |
| **M4** | Tháng 4–6 | Round-trip Lớp A: sửa và lưu về `.docx`                                           | Thay Collabora cho tài liệu thường dùng                                       |
| **M5** | Tháng 6–9 | 🎯 **MVP nghiệm thu** — gia cố, dùng thử diện rộng                                | Đủ điều kiện chuyển đổi chính thức                                            |

**Docs MVP: 6–9 tháng, điểm giữa khoảng 7 tháng.** Sau đó: OneMail SSO + Drive + cộng tác thêm 2 tháng; bộ Office hoàn chỉnh (thêm Sheets và Slides) khoảng **15–20 tháng**.

Với 2–3 kỹ sư: Docs MVP còn **4–5 tháng**, bộ hoàn chỉnh còn **9–13 tháng**.

Con số này dựa trên bóc tách **111–171 ngày** ở mục 8.1, quy đổi theo mức 19–20 ngày làm được việc mỗi tháng. Nó đã tính hỗ trợ AI agentic ở mức tích cực, **với một điều kiện thiết kế bắt buộc nêu ở mục 8.2** — nếu không đáp ứng, tiến độ quay về 8–12 tháng. Năm thứ không nén được bằng tốc độ code liệt kê ở mục 8.3.

**Điểm quan trọng nhất về cách đọc bảng trên:** mốc M2 ở ngày 60 là chiến thắng sớm mạnh nhất. Phần lớn lượt mở Collabora thực tế **chỉ là xem file, không sửa**. Chiếm được luồng "xem" từ tháng thứ hai đã giảm tải Collabora ngay và cho số liệu thật để báo cáo, trong khi phần khó vẫn đang làm.

**Bốn điều cần quyết ngay:**

1. Duyệt lộ trình và **hợp đồng phạm vi MVP ở mục 7.0** — phần quan trọng nhất tài liệu này. Không có nó thì con số 6–9 tháng thành 18–24 tháng.
2. **Cấp quyền thu thập bộ mẫu trước ngày thứ 20**: 50–100 file `.docx` thật đã ẩn danh.
3. Xác nhận ràng buộc "không AGPL, không mua bản quyền". Ràng buộc này **làm dài thêm khoảng 3–5 tháng** so với phương án dùng thư viện AGPL sẵn có, và làm chất lượng round-trip thấp hơn ở giai đoạn đầu (chi tiết mục 4.4).
4. Nhân sự: giữ 1 người hay bổ sung. Rủi ro tổ chức lớn nhất là **toàn bộ dự án phụ thuộc 1 kỹ sư duy nhất** trong 7 tháng. Thêm người thứ hai đưa MVP về 4–5 tháng và xoá luôn rủi ro này (mục 8.5).

---

## 2. Vấn đề: vì sao phải thay Collabora Online

### 2.1 Mất chủ quyền sản phẩm — lý do chính

Collabora Online là LibreOffice chạy phía máy chủ, nhúng vào sản phẩm ta qua giao thức WOPI trong một `iframe`. Hệ quả trực tiếp:

| Ta muốn                                                               | Với Collabora                                         |
| --------------------------------------------------------------------- | ----------------------------------------------------- |
| Giao diện thống nhất với OneMail/Drive                                | Không — giao diện là của Collabora, chỉnh được rất ít |
| Nhúng sâu: mở tài liệu từ email, đính kèm, lưu thẳng vào Drive        | Chỉ ở mức WOPI cho phép                               |
| Tính năng riêng của iNET: mẫu tài liệu, ký số, luồng duyệt, trợ lý AI | Không thêm được                                       |
| Thương hiệu iNET trên toàn bộ trải nghiệm                             | Hạn chế                                               |
| Sửa lỗi khi khách báo                                                 | Phụ thuộc upstream LibreOffice, ta không tự vá được   |
| Kiểm soát hiệu năng, tối ưu theo tải thực tế                          | Không — hộp đen                                       |
| Trải nghiệm riêng cho di động                                         | Không                                                 |

Nói gọn: **Collabora giải quyết được bài toán "có chức năng soạn thảo", nhưng chặn đứng con đường đi từ OneMail + Drive lên một Workspace hoàn chỉnh.** Mọi tính năng khác biệt mà ta muốn xây dựng để cạnh tranh đều nằm đúng chỗ ta không chạm được.

### 2.2 Chi phí hạ tầng — hệ quả phụ, cần đo

Kiến trúc Collabora đặt toàn bộ khối lượng tính toán ở máy chủ: mỗi phiên mở tài liệu sinh một tiến trình LibreOffice riêng, tiêu tốn bộ nhớ và CPU đáng kể, và chi phí tăng tuyến tính theo số người dùng đồng thời.

Kiến trúc đề xuất đẩy toàn bộ tính toán xuống trình duyệt người dùng. Máy chủ chỉ còn lưu trữ và đồng bộ, **chi phí biên trên mỗi người dùng gần bằng không**.

> **Chưa có số liệu thực tế.** Cần thu thập trước khi đưa vào báo cáo tài chính: số người dùng đồng thời đỉnh, RAM/CPU cụm Collabora hiện tại, chi phí bản quyền nếu có. Khung đo đề xuất ở mục 10.3. Cho tới khi có số, **không dùng lập luận chi phí làm lý do chính** — dùng mục 2.1.

### 2.3 Cái được: hoàn thiện hệ sinh thái

OneMail (tài khoản) + Drive (dung lượng, đã có sẵn trong gói) + Office (soạn thảo) = **Workspace**. Đây là bước còn thiếu duy nhất để iNET có một bộ sản phẩm cạnh tranh trực tiếp với Google Workspace ở phân khúc doanh nghiệp Việt Nam, với lợi thế dữ liệu lưu trong nước.

---

## 3. Nguyên tắc thiết kế và ràng buộc

### 3.1 Ràng buộc bất di bất dịch

| #   | Ràng buộc                                              | Hệ quả kiến trúc                              |
| --- | ------------------------------------------------------ | --------------------------------------------- |
| C1  | Chỉ dùng OSS giấy phép dễ dãi (MIT, Apache-2.0, BSD)   | Loại mọi thư viện AGPL/GPL                    |
| C2  | Không mua bản quyền thương mại                         | Loại Univer Pro, SuperDoc Commercial          |
| C3  | Không mở mã nguồn sản phẩm iNET                        | Loại mọi thư viện copyleft mạnh               |
| C4  | Chạy được offline, không cần đăng nhập                 | Dữ liệu ở IndexedDB, mở file trực tiếp từ máy |
| C5  | 3 ứng dụng chạy và triển khai độc lập                  | 3 SPA riêng, chung monorepo và packages       |
| C6  | Dùng chung tài khoản OneMail và dung lượng Drive       | Tầng lưu trữ trừu tượng, đổi driver được      |
| C7  | Chất lượng mở/lưu file Office cũ phải cao (round-trip) | Quyết định kiến trúc ở mục 4                  |

### 3.2 Nguyên tắc kiến trúc

- **Offline-first, không phải cloud-first.** Nguồn dữ liệu gốc nằm ở máy người dùng. Máy chủ là nơi đồng bộ, không phải nơi bắt buộc phải có. Đây là điểm khác biệt lớn nhất so với lộ trình v6.1 cũ, và là lý do MVP không cần backend.
- **YAGNI trên hạ tầng.** Không dựng microservices, Kubernetes, message broker khi chưa có tín hiệu thật cần tới. Bắt đầu bằng monolith có module rõ ràng, tách khi đau.
- **Chỉ đầu tư trước ở chỗ không thể sửa sau.** Có đúng hai chỗ như vậy (mục 5.3), còn lại làm khi cần.
- **Mọi tuyên bố về chất lượng phải đo được.** Không có số liệu thì không được nói "đã thay được Collabora".

---

## 4. Quyết định kỹ thuật cốt lõi: kiến trúc file `.docx`

### 4.1 Vì sao đây là quyết định đắt nhất cả dự án

Yêu cầu "mở file `.docx` cũ, sửa, lưu lại mà không hỏng" nghe đơn giản nhưng là bài toán khó nhất. Lý do: **mô hình dữ liệu của trình soạn thảo web nghèo hơn OOXML rất nhiều.**

TipTap (nền ProseMirror) về bản chất mô tả tài liệu ở mức tương đương HTML. OOXML thì có: thuộc tính phân đoạn, đầu/chân trang theo từng phân đoạn, định nghĩa danh sách đánh số nhiều cấp, chuỗi kế thừa kiểu, trường động, chú thích chân trang, bình luận, theo dõi thay đổi, điều khiển nội dung, đồ họa DrawingML.

Nếu làm theo cách thông thường — `docx → HTML → trình soạn thảo → docx` — thì **mỗi lần người dùng mở file rồi bấm Lưu là file bị mất dữ liệu.** Đây không phải lỗi lập trình, mà là hệ quả tất yếu của kiến trúc.

Kết luận: chất lượng round-trip **không** do chọn thư viện nào quyết định, mà do **đặt nguồn dữ liệu gốc ở đâu**.

### 4.2 Bốn phương án đã đánh giá

|                       | **T0 — Chuyển đổi thẳng**    | **A — SuperDoc (AGPL)**            | **B — SuperDoc (thương mại)** | **T1 — Tự xây, giữ nguyên và vá** |
| --------------------- | ---------------------------- | ---------------------------------- | ----------------------------- | --------------------------------- |
| Cách làm              | `mammoth.js` đọc, `docx` ghi | Dùng thư viện AGPL có sẵn          | Như A, mua bản quyền          | Tự xây trên TipTap                |
| Công sức tới Docs MVP | 1–2 tháng                    | 3–5 tháng                          | 3–5 tháng                     | **6–9 tháng**                     |
| Chất lượng round-trip | **Hỏng file**                | Cao (7.361 commit hậu thuẫn)       | Cao                           | Trung bình lúc đầu, cải thiện dần |
| Chi phí bản quyền     | 0                            | 0                                  | Phải trả                      | 0                                 |
| Ràng buộc pháp lý     | Không                        | **Buộc mở mã nguồn ứng dụng Docs** | Không                         | Không                             |
| Gánh nặng bảo trì     | Thấp                         | Thấp                               | Thấp                          | **Rất cao, vĩnh viễn**            |
| Vi phạm ràng buộc     | C7                           | C1, C3                             | C2                            | Không                             |
| **Kết luận**          | Loại                         | Loại                               | Loại                          | **✅ Chọn**                       |

Ghi chú về [SuperDoc](https://github.com/Harbour-Enterprises/SuperDoc): đây là dự án đã hiện thực đúng kiến trúc T1, 967 sao, 7.361 commit, đang phát triển tích cực, có sẵn Yjs và theo dõi thay đổi. Giấy phép AGPLv3 nghĩa là nhúng vào ứng dụng chạy trên trình duyệt sẽ biến toàn bộ ứng dụng Docs thành tác phẩm phái sinh, buộc công khai mã nguồn. Vi phạm C1 và C3 nên bị loại.

> **Lưu ý pháp lý bắt buộc tuân thủ:** tuyệt đối **không đọc mã nguồn SuperDoc** rồi viết lại. Đọc mã nguồn AGPL rồi hiện thực bản của mình là vùng rủi ro thật về tác phẩm phái sinh. Nguồn tham chiếu hợp lệ là **đặc tả ECMA-376 (OOXML)** — công khai, miễn phí — và các thư viện giấy phép dễ dãi như `docx-preview` (Apache-2.0).

### 4.3 Phương án chọn: T1 — giữ nguyên và vá (preserve-and-patch)

Nguyên lý:

1. **Giữ nguyên vẹn toàn bộ file OOXML gốc** (giải nén tất cả các phần) trong IndexedDB. Đây là nguồn dữ liệu gốc, không phải mô hình của trình soạn thảo.
2. **TipTap chỉ là khung nhìn sửa được** trên phần thân tài liệu.
3. Khi lưu: **chỉ ghi đè đúng những đoạn trong `document.xml` mà người dùng thật sự chạm vào.** Các phần `styles.xml`, `numbering.xml`, `theme1.xml`, đầu/chân trang, hình ảnh, cấu hình — **giữ nguyên từng byte**.
4. Cấu trúc trình soạn thảo không hiểu (SmartArt, điều khiển nội dung, trường phức tạp) trở thành **nút mờ (opaque node)**: hiển thị dạng ảnh/khối chỉ đọc, nhưng XML gốc được bảo toàn và ghi lại nguyên vẹn.

Điểm mấu chốt: **suy giảm có kiểm soát.** Thứ ta không hiểu thì ta không đụng vào, thay vì âm thầm xóa mất.

Đây là quyết định **không thể sửa sau** — nó xuyên qua tầng lưu trữ, ràng buộc trình soạn thảo và lược đồ Yjs. Phải chốt trước dòng mã đầu tiên.

### 4.4 Cái giá của ràng buộc pháp lý — cần nói thẳng

Chênh lệch công sức giữa phương án A (dùng thư viện AGPL sẵn có) và T1 (tự xây) là **khoảng 3–4 tháng** với 1 kỹ sư. Cụ thể: A xóa bỏ gần như toàn bộ 62–96 ngày của tầng `docx-io` (đọc, ghi, và đuôi dài gỡ lỗi) trong bảng bóc tách ở mục 8.1, đổi lại khoảng 20–30 ngày tích hợp và dựng lại giao diện quanh nó.

Nghĩa là: **khoảng 3–4 tháng trong tổng 6–9 tháng — gần một nửa tiến độ — là chi phí trực tiếp của quyết định "không AGPL, không mua bản quyền".** Không phải do tốc độ triển khai.

Đưa điều này vào tài liệu không phải để phàn nàn, mà để lãnh đạo nắm được **đòn bẩy rút ngắn tiến độ đang nằm ở đâu**. Nếu sau này có áp lực về thời gian, có hai nút bấm sẵn:

- Nới ràng buộc C3 (chấp nhận mở mã nguồn phần giao diện Docs) → MVP về khoảng **3–5 tháng**. Lưu ý: phần giao diện vốn đã tải xuống trình duyệt người dùng; backend, SSO, Drive, logic nghiệp vụ **không bị ảnh hưởng** vì là tiến trình riêng giao tiếp qua API. Nghĩa vụ thực tế hẹp hơn nhiều so với cảm giác khi nghe "AGPL".
- Nới ràng buộc C2 (mua bản quyền) → MVP về khoảng **3–5 tháng**. So sánh giá bản quyền với 3–4 tháng lương kỹ sư thường nghiêng về mua.

Quan trọng hơn cả tốc độ: cả hai phương án A và B đều cho **chất lượng round-trip cao hơn hẳn** ngay từ ngày đầu, vì đứng sau chúng là hàng nghìn lần cập nhật xử lý các trường hợp biên của OOXML. Đi đường T1 nghĩa là ta tự đi lại quãng đường đó, và chất lượng sẽ tăng dần theo tháng chứ không có sẵn.

Hai nút này để lãnh đạo quyết, không phải để kỹ thuật quyết.

---

## 5. Kiến trúc hệ thống

### 5.1 Tổng thể

```
┌──────────────────── TRÌNH DUYỆT NGƯỜI DÙNG ────────────────────┐
│                                                                 │
│   apps/docs        apps/sheets       apps/slides                │
│   TipTap           Univer            pptx-viewer (fork)         │
│      │                 │                  │                    │
│      └────────┬────────┴──────────────────┘                    │
│               │                                                 │
│   ┌───────────┴─────────────────────────────────┐              │
│   │ packages/                                    │              │
│   │   docx-io   xlsx-io   pptx-io                │              │
│   │        └────── ooxml-core ──────┘            │  ← toàn bộ  │
│   │   collab-core (Y.Doc)                        │    tính toán │
│   │   storage-adapter                            │    ở client  │
│   └───────────┬─────────────────────────────────┘              │
│               │                                                 │
│   IndexedDB      File System Access API                         │
│   (bộ nhớ cục bộ) (file trên máy)                               │
└───────────────┬─────────────────────────────────────────────────┘
                │  (từ Giai đoạn 4 trở đi — MVP không cần)
┌───────────────┴─────────────────────────────────────────────────┐
│  NestJS — MỘT ứng dụng, nhiều module (không phải microservices) │
│  session · document-metadata · storage-token · hocuspocus       │
│  Chỉ xác thực + phát pre-signed URL. Byte file KHÔNG đi qua đây.│
└───────────────┬─────────────────────────────────────────────────┘
                │
      OneMail SSO API      Drive / S3 iNET       PostgreSQL
      (đã có)   (đã có)               (metadata)
                                ▲
                                └── trình duyệt PUT/GET thẳng
                                    qua pre-signed URL
```

### 5.2 Cấu trúc monorepo

```
apps/
  docs/              đổi tên từ apps/web hiện tại
  sheets/            Giai đoạn 6
  slides/            Giai đoạn 7
  shell/             launcher + quản lý file chung, Giai đoạn 8
packages/
  ooxml-core/        giải nén/nén giữ nguyên byte, sổ đăng ký phần, bảo toàn nút mờ
  docx-io/           docx ↔ TipTap (T1)          ← trái tim dự án
  xlsx-io/           xlsx ↔ Univer (ExcelJS)
  pptx-io/           bọc quanh bản fork pptx-viewer
  storage-adapter/   driver: IndexedDB | FileSystemAccess | Drive
  collab-core/       Y.Doc + đổi provider (indexeddb → websocket)
  auth-sdk/          OneMail SSO, rỗng ở MVP
  ui-kit/            tái dùng từ components/tiptap-ui-primitive hiện có
  fidelity-harness/  bộ đo chất lượng round-trip, chạy trong CI
services/
  api/               NestJS, Giai đoạn 4
```

"Độc lập" ở đây nghĩa là **triển khai và chạy độc lập** (tên miền con riêng, build riêng, hỏng một cái không kéo theo hai cái kia), chứ không phải ba kho mã tách rời — vì cả ba dùng chung tầng lưu trữ, tầng cộng tác và tầng đọc/ghi file.

### 5.3 Hai khoản đầu tư trước bắt buộc

Vi phạm YAGNI có ý thức, vì hai thứ này không thể lắp thêm sau:

1. **`storage-adapter` ngay từ MVP.** Một giao diện `DocumentStore`, driver đầu tiên là IndexedDB, driver thứ hai là Drive. Nếu MVP ghi thẳng vào IndexedDB rải rác trong mã, tới Giai đoạn 4 phải viết lại toàn bộ.
2. **`Y.Doc` là nguồn dữ liệu gốc ngay từ MVP**, dù chưa có cộng tác. Provider ban đầu chỉ là `y-indexeddb`. Lắp Yjs vào một trình soạn thảo đã chạy là việc cực kỳ tốn kém — chi phí bây giờ khoảng 1 tuần, chi phí sau này khoảng 4–6 tuần cộng rủi ro mất dữ liệu.

### 5.4 Vì sao KHÔNG microservices từ đầu

Lộ trình v6.1 cũ đề xuất 7 dịch vụ NestJS + PostgreSQL + Redis + NATS + Kubernetes **trước khi người dùng gõ được ký tự đầu tiên**. Với hướng offline-first mới, điều này vừa không cần thiết vừa có hại:

- MVP **không cần backend nào cả**. Ba SPA tĩnh đẩy lên CDN là xong.
- Với 1 kỹ sư, 7 dịch vụ là chi phí vận hành thuần túy: 7 pipeline, 7 bộ log, 7 lần triển khai, gỡ lỗi phân tán — đổi lại con số không giá trị nghiệp vụ.
- Ranh giới dịch vụ đúng chỉ lộ ra sau khi hệ thống chạy thật. Vẽ trước gần như luôn vẽ sai, và sửa ranh giới sai đắt hơn tách monolith.

Đề xuất: **một ứng dụng NestJS nhiều module** từ Giai đoạn 4, ranh giới module rõ ràng để tách được sau. Tách khi có tín hiệu thật — một module cần scale riêng, hoặc một team riêng sở hữu nó.

---

## 6. Công nghệ sử dụng

### 6.1 Giải thích cho người không chuyên

Mục này viết để người không làm kỹ thuật vẫn nắm được ta dùng gì và vì sao. Nguyên tắc chung: **mọi thành phần đều là mã nguồn mở miễn phí, không ràng buộc pháp lý** — ta không trả tiền cho ai và cũng không phải công khai sản phẩm của mình.

**Nền tảng chung cho cả ba ứng dụng**

| Thành phần                             | Nó là gì, nói dễ hiểu                                                                                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **React + TypeScript + Vite**          | Bộ công cụ dựng giao diện web. Đây là lựa chọn phổ biến nhất hiện nay, dễ tuyển người, đã dùng sẵn trong sản phẩm hiện tại                                                                                                                             |
| **shadcn/ui + Base UI + Tailwind CSS** | Bộ thành phần giao diện dựng sẵn: nút, hộp thoại, menu, dropdown, tooltip. **Không phải thư viện phụ thuộc — là mã nguồn chép thẳng vào dự án, ta sở hữu hoàn toàn.** Nhờ vậy không có rủi ro chuỗi cung ứng và không phụ thuộc tác giả bên ngoài      |
| **Bộ design token dùng chung**         | Một tập biến màu, phông, bo góc dùng chung cho cả ba ứng dụng, **lấy bảng màu thương hiệu iNET** để bộ Office trông đúng là một phần của OneMail. Chỉ dùng lại giá trị màu — **không phụ thuộc ViUI, Vuetify hay Vue**; ba ứng dụng đều là React thuần |
| **IndexedDB**                          | Kho dữ liệu có sẵn trong mọi trình duyệt. Là nơi cất tài liệu để làm việc khi không có mạng                                                                                                                                                            |
| **File System Access API**             | Tính năng của trình duyệt cho phép mở và lưu file thẳng trên máy người dùng, giống hệt phần mềm cài đặt                                                                                                                                                |
| **PWA**                                | Công nghệ biến trang web thành ứng dụng cài được lên máy, có biểu tượng riêng, mở ra là chạy kể cả khi mất mạng                                                                                                                                        |
| **Yjs**                                | Thư viện đồng bộ dữ liệu. Cho phép nhiều người sửa cùng một tài liệu mà không đè lên nhau, và cho phép làm việc offline rồi tự hợp nhất khi có mạng lại. Đây là nền của tính năng cộng tác thời gian thực                                              |

**Riêng cho Docs**

| Thành phần                  | Nó là gì, nói dễ hiểu                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **TipTap / ProseMirror**    | Động cơ soạn thảo văn bản. Là thứ tạo ra vùng gõ chữ, in đậm, danh sách, bảng — vai trò tương đương phần lõi của Word. **Đã có và đang chạy tốt trong sản phẩm hiện tại**                                          |
| **docx-preview**            | Thư viện hiển thị file Word trong trình duyệt với độ chính xác cao. Dùng làm trình xem ở mốc M2 — tiết kiệm nhiều tháng so với tự viết                                                                             |
| **JSZip + fast-xml-parser** | File `.docx` thực chất là một gói nén chứa nhiều tệp XML bên trong. Hai thư viện này để mở gói và sửa đúng phần cần sửa, **giữ nguyên những phần không đụng tới** — chính là cơ chế bảo vệ dữ liệu khách ở mục 4.3 |

**Riêng cho Sheets và Slides** (bắt đầu sau MVP)

| Thành phần      | Nó là gì, nói dễ hiểu                                                                                                                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Univer**      | Động cơ bảng tính. Vai trò với Sheets giống TipTap với Docs                                                                                                                                                                                                                                                                                 |
| **ExcelJS**     | Thư viện đọc và ghi file Excel. **Bắt buộc phải có** vì phần đọc ghi Excel của Univer là tính năng trả phí, mà ta không mua bản quyền                                                                                                                                                                                                       |
| **echarts**     | Thư viện vẽ biểu đồ, thay cho biểu đồ bản trả phí của Univer                                                                                                                                                                                                                                                                                |
| **pptx-viewer** | Thư viện đọc, hiển thị và sửa file PowerPoint — đầy đủ nhất trong các lựa chọn mã nguồn mở: ribbon, kéo thả trên canvas, 187 hình khối, 23 loại biểu đồ, SmartArt, hiệu ứng, xuất PDF/video, đồng sửa nhiều người. **Vẫn là thành phần rủi ro nhất cả dự án**, nhưng vì tuổi đời và tác giả chứ không phải vì thiếu tính năng — xem mục 6.4 |

**Cho phần máy chủ** (từ tháng 9 trở đi, MVP không cần)

| Thành phần                | Nó là gì, nói dễ hiểu                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NestJS**                | Nền tảng viết máy chủ. Chỉ làm hai việc: xác thực người dùng và giữ thông tin tài liệu                                                                                    |
| **Pre-signed URL lên S3** | Cách để trình duyệt tải file lên và xuống **thẳng kho lưu trữ của Drive**, không đi qua máy chủ ta. Nhờ vậy chi phí máy chủ gần như không tăng dù có bao nhiêu người dùng |
| **Hocuspocus**            | Máy chủ đi kèm Yjs, chuyển tiếp thay đổi giữa những người đang mở cùng một tài liệu                                                                                       |

**Công cụ đo chất lượng** — thành phần ta tự xây, không phải thư viện ngoài

| Thành phần             | Nó là gì, nói dễ hiểu                                                                                                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`fidelity-harness`** | Bộ kiểm tra tự động: lấy 50–100 file thật của khách, mở ra rồi lưu lại, so sánh với bản gốc và cho ra con số phần trăm chính xác. **Đây là thước đo duy nhất trả lời được câu hỏi "đã thay được Collabora chưa"**, và là con số báo cáo hàng tháng |

### 6.2 Bảng giấy phép đầy đủ

Toàn bộ đã kiểm tra trực tiếp trên npm registry ngày 17/08/2026. **Không có thành phần nào vi phạm C1, C2 hoặc C3.**

| Thư viện                                          | Giấy phép            | Vai trò                                                                  |
| ------------------------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| `@tiptap/*` (gồm cả `extension-find-and-replace`) | **MIT**              | Trình soạn thảo Docs                                                     |
| `@tiptap/pm` / ProseMirror                        | MIT                  | Nền tảng mô hình tài liệu                                                |
| `docx-preview`                                    | **Apache-2.0**       | Trình xem `.docx` ở M2; cũng là tham chiếu hợp lệ cho `docx-io`          |
| `jszip`                                           | MIT (chọn nhánh MIT) | Giải nén/nén OOXML                                                       |
| `fast-xml-parser`                                 | MIT                  | Phân tích/tuần tự XML giữ nguyên định dạng                               |
| `yjs`, `y-prosemirror`, `y-indexeddb`             | **MIT**              | Cộng tác + offline                                                       |
| `@hocuspocus/server`                              | MIT                  | Máy chủ đồng bộ Yjs (Giai đoạn 5)                                        |
| `exceljs`                                         | **MIT**              | Đọc/ghi xlsx                                                             |
| `@univerjs/core`                                  | Apache-2.0           | Bảng tính                                                                |
| `pptx-viewer`                                     | Apache-2.0           | Trình chiếu — xem đánh giá rủi ro riêng ở mục 6.4                        |
| `echarts`                                         | Apache-2.0           | Biểu đồ cho Sheets                                                       |
| `pixelmatch`                                      | ISC                  | So sánh ảnh trong bộ đo chất lượng                                       |
| `shadcn/ui`                                       | **MIT**              | Thành phần giao diện — chép mã vào dự án, không phải dependency          |
| `@base-ui/react`                                  | MIT                  | Nền primitive của shadcn (mặc định từ 7/2026), **đã cài sẵn trong repo** |
| `tailwindcss`                                     | MIT                  | Hệ thống class CSS mà shadcn dựa vào                                     |
| React 19, Vite 6, TypeScript                      | MIT / Apache-2.0     | Nền tảng                                                                 |
| NestJS                                            | MIT                  | Máy chủ (Giai đoạn 4)                                                    |

### 6.3 Đã cân nhắc và loại, kèm lý do

| Thư viện                                     | Lý do loại                                                                                                                                                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperDoc**                                 | Chất lượng tốt nhất trong các lựa chọn, nhưng giấy phép AGPLv3 buộc công khai mã nguồn (vi phạm C3), còn bản thương mại thì mất phí (vi phạm C2). **Đây là lựa chọn tốt nhất bị loại, và là đòn bẩy rút ngắn 3–4 tháng nếu lãnh đạo nới ràng buộc** |
| **Univer Pro**                               | Bản trả phí, chứa đọc ghi Excel, cộng tác, in ấn, biểu đồ, pivot, công thức nâng cao. Bản miễn phí có watermark và giới hạn dung lượng nhập                                                                                                         |
| **SheetJS Community**                        | Giấy phép không vướng, nhưng **âm thầm loại bỏ định dạng khi ghi file** — phát hiện muộn sẽ rất tốn kém. Dùng ExcelJS thay thế                                                                                                                      |
| **HyperFormula**                             | Nhiều khả năng GPLv3 kèm bản thương mại. Cần kiểm chứng ở Giai đoạn 6 trước khi cân nhắc                                                                                                                                                            |
| **Chuyển đổi thẳng qua HTML** (`mammoth.js`) | Cách làm phổ biến nhất, nhưng làm hỏng file khách mỗi lần lưu. Xem mục 4                                                                                                                                                                            |

### 6.4 Đánh giá riêng: `pptx-viewer` — thành phần rủi ro nhất

Vì đây là phụ thuộc rủi ro nhất cả dự án, mục này ghi lại dữ liệu đã kiểm chứng để lần sau không phải tranh luận bằng cảm tính. Số liệu lấy trực tiếp từ GitHub API và npm registry ngày 17/08/2026.

| Chỉ số                         | Giá trị                                                              | Nghĩa là gì                                                                                                                                                              |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lượt tải npm                   | **~21.000/tuần** (`pptx-viewer-core`), 19.300/tuần (bản React)       | **Có người dùng thật.** Số sao GitHub (61) là chỉ báo tồi, không nên dùng                                                                                                |
| Ngày tạo                       | **16/03/2026 — mới 5 tháng**                                         | ⚠️ Với thư viện xử lý định dạng file, tuổi đời chính là thước đo. Độ chính xác OOXML đến từ việc va phải hàng chục nghìn file kỳ quặc ngoài đời, không đến từ đọc đặc tả |
| Lần đẩy mã cuối                | 14/08/2026                                                           | Đang phát triển rất tích cực, không bỏ hoang                                                                                                                             |
| Người đóng góp                 | ChristopherVR **2.319 commit**; ba người khác tổng cộng **7 commit** | ⚠️ **Bus factor = 1**, y hệt tình trạng dự án của ta                                                                                                                     |
| Nhịp commit                    | ~15 commit/ngày liên tục trong 5 tháng                               | ⚠️ Gần như chắc chắn là mã sinh bằng AI ở quy mô lớn — mang đúng rủi ro ghi ở R2d, nhưng ở quy mô lớn hơn và ta không kiểm soát được                                     |
| Số phiên bản phát hành         | 103–180 bản trong 5 tháng, ~1 bản/ngày                               | ⚠️ **API chưa ổn định.** Phải ghim phiên bản cứng, chủ động nâng cấp, không để trôi                                                                                      |
| Issue đang mở / người theo dõi | 1 / 0                                                                | ⚠️ Với thư viện có SmartArt, 23 loại biểu đồ và hiệu ứng, con số này không có nghĩa "không lỗi" mà là **chưa ai đẩy tới giới hạn và báo lại**                            |
| Giấy phép                      | Apache-2.0, 25 fork                                                  | ✅ Fork được, không vướng pháp lý                                                                                                                                        |

**Tính năng thì đầy đủ thật** — demo có ribbon, bảng thuộc tính, kéo thả trên canvas, 187 hình khối dựng sẵn, 23 loại biểu đồ, SmartArt, hiệu ứng và morph, xuất PNG/JPEG/SVG/PDF/GIF/video, đồng sửa nhiều người qua Yjs, hỗ trợ 5 khung giao diện. Hạn chế tác giả tự công bố: đối tượng OLE chỉ đọc, một số hiệu ứng hình ảnh chỉ mô phỏng gần đúng, phông chữ phụ thuộc trình duyệt.

**Kết luận: vẫn dùng, vì không có lựa chọn nào tốt hơn.** Tự xây trình chiếu từ đầu tốn hơn 6 tháng riêng cho Slides; Univer Slides còn non hơn. Nhưng cách dùng phải là **fork và coi như mã nhà ngay từ đầu**, không phải dependency thông thường.

**Bài kiểm tra bắt buộc ở khảo sát 2 tuần trước Giai đoạn 7:** lấy file `.pptx` **thật của khách hàng iNET** — có logo, bảng biểu, phông chữ tiếng Việt, mẫu slide doanh nghiệp — mở, sửa, lưu, mở lại bằng PowerPoint thật. **Không dùng file demo của tác giả.** Rủi ro nằm ở chỗ thư viện chưa gặp file thực tế đủ nhiều, nên kiểm bằng file demo sẽ cho kết quả sai lệch một cách nguy hiểm.

---

## 7. Lộ trình

Ước lượng cho **1 kỹ sư fullstack toàn thời gian + hỗ trợ AI**. Kịch bản nhiều người ở mục 8.

### 7.0 Hợp đồng phạm vi MVP — phần quan trọng nhất tài liệu này

Mốc MVP chỉ có nghĩa khi đi kèm định nghĩa rõ MVP là gì. "Round-trip đầy đủ với mọi file `.docx`" là mục tiêu không sản phẩm nào trên thị trường đạt được, kể cả Google Docs. Thứ đạt được — và thứ ta cam kết — là:

**Lớp A — sửa được, round-trip đầy đủ:**

- Đoạn văn, heading, định dạng ký tự (đậm, nghiêng, gạch chân, màu, cỡ chữ, phông chữ)
- Danh sách bullet và đánh số, kể cả nhiều cấp
- Bảng: gộp ô, viền, màu nền
- Hình ảnh nhúng, siêu liên kết, dấu trang
- Khổ giấy, lề, hướng giấy, kiểu tài liệu (styles)
- Đầu/chân trang: hiển thị đúng, giữ nguyên khi lưu (chưa sửa được trong MVP)

**Lớp B — bảo toàn nguyên vẹn, chưa sửa được trong MVP:**

- SmartArt, biểu đồ nhúng, đối tượng OLE
- Điều khiển nội dung, trường động
- Chú thích chân trang và cuối trang, bình luận, theo dõi thay đổi
- Hộp văn bản, hình vẽ phức tạp, công thức toán

**Cam kết với Lớp B:** hiển thị dạng khối chỉ đọc, và khi lưu **được ghi lại nguyên vẹn từng byte**. Đây là điểm đa số sản phẩm cạnh tranh làm sai — họ xóa mất. Ta giữ nguyên. Lời hứa bán được là **"không bao giờ mất dữ liệu"**, không phải "sửa được mọi thứ".

**Ngoài phạm vi MVP:** Sheets, Slides, đăng nhập, Drive, cộng tác thời gian thực, xuất PDF chất lượng in ấn.

> Nếu phạm vi này bị nới ra trong lúc triển khai, ước lượng 6–9 tháng mất hiệu lực và trở thành 18–24 tháng. Đây là ràng buộc hai chiều: kỹ thuật cam kết ngày, lãnh đạo cam kết không nới phạm vi.

### M1 · Ngày 1–30 — Docs offline chạy được

**Mục tiêu:** đóng gói trình soạn thảo đã có thành một sản phẩm offline dùng được thật, chưa động tới `.docx`. Rủi ro thấp, giá trị demo cao.

- Tái cấu trúc monorepo: `apps/web` → `apps/docs`, dựng khung `packages/`.
- **Dựng nền giao diện shadcn/ui:** cài Tailwind, thêm hàm `cn()` vào `lib/utils.ts`, chuyển 9 primitive trong `components/tiptap-ui-primitive/` từ SCSS sang Tailwind, dọn `styles/_variables.scss` thành CSS variables. Repo đã có sẵn `@base-ui/react` (nền mặc định của shadcn từ 7/2026), `clsx`, `class-variance-authority`, `lucide-react` — nên chỉ thiếu Tailwind.
- **`packages/ui-kit` + bộ design token dùng chung**, dùng bảng màu thương hiệu iNET (tham chiếu giá trị màu từ ViUI, **không phụ thuộc ViUI/Vuetify/Vue** — cả ba ứng dụng đều React thuần). Bắt buộc làm ở đây: token này về sau còn dùng để ghi đè giao diện riêng của Univer và pptx-viewer (xem R9).
- Sửa phân loại sai trong `apps/web/package.json`: `@base-ui/react` và `class-variance-authority` đang ở `devDependencies` nhưng chạy lúc runtime.
- `packages/storage-adapter`: giao diện `DocumentStore` + driver IndexedDB. **Bỏ `localStorage`** — hạn mức ~5MB là chặn cứng, một file có ảnh đã vượt.
- File System Access API: mở/lưu file trực tiếp trên máy (Chromium). Dự phòng cho Firefox/Safari: `<input type="file">` + tải blob về.
- PWA: `vite-plugin-pwa`, service worker, vỏ ứng dụng offline, cài được lên desktop.
- Quản lý file cục bộ, export HTML/TXT/Markdown, xuất PDF qua CSS in (đã có sẵn).
- **Song song, không chờ được:** khởi động thu thập 50–100 file `.docx` thật (đã ẩn danh). Việc này phụ thuộc người khác nên phải bắt đầu từ tuần 1.

**🚩 Mốc M1:** cài được như ứng dụng, mất mạng vẫn soạn thảo, không cần đăng nhập.
**Ngày:** 16–24 (đã gồm 4–6 ngày dựng nền shadcn + Tailwind).

### M2 · Ngày 31–60 — Trình xem `.docx`

**Mục tiêu:** chiếm luồng "xem file" — mốc có giá trị nghiệp vụ thật sớm nhất.

- `packages/ooxml-core`: giải nén qua JSZip → sổ đăng ký phần (ánh xạ đường dẫn → byte thô). Nén lại **giữ nguyên byte** phần không đổi, đúng thứ tự phần, đúng `[Content_Types].xml`.
- Trình xem dùng **`docx-preview` (Apache-2.0)** — kết xuất `.docx` chất lượng cao đã có sẵn, **không cần tự viết phần hiển thị**. Chỉ chế độ _sửa_ mới cần ánh xạ sang TipTap.
- `packages/fidelity-harness`: script CI mở → lưu → so byte, và kết xuất → chụp ảnh → so pixel. **Bắt buộc phát ra khác biệt máy đọc được** — XPath phần tử lệch, tên thuộc tính, giá trị mong đợi so với thực tế, toạ độ vùng pixel sai. Đây là điều kiện để vòng lặp gỡ lỗi ở M3/M4 chạy được bằng agentic AI; xem mục 8.2. Bộ đo chỉ trả về phần trăm sẽ làm tiến độ dài thêm 1,5–2 tháng.

**🚩 Mốc M2 — triển khai thật được:** mở `.docx` bất kỳ từ máy hoặc từ đính kèm OneMail, xem chuẩn xác, lưu lại **giống hệt bản gốc từng byte**.
**Tiêu chí:** ≥95% bộ mẫu giống hệt khi lưu mà không sửa gì; kết xuất không lỗi trên 100% bộ mẫu.
**Ngày công:** 15–23.

> Đây là điểm dừng an toàn của cả dự án. Nếu `ooxml-core` không đạt byte-identical, kiến trúc T1 không đứng vững — dừng lại xem xét khi mới tiêu 2 tháng. Đồng thời đây là mốc đầu tiên **giảm tải Collabora thật**, nên nên triển khai ngay chứ không giữ trong nội bộ.

### M3 · Tháng 2–4 — Sửa được `.docx` trong trình soạn thảo

Chuyển từ _xem_ sang _sửa_. Chưa lưu ngược về `.docx`.

- Yjs: `Y.Doc` làm nguồn gốc, ràng buộc `y-prosemirror`, lưu bền `y-indexeddb`, `UndoManager`. Sổ đăng ký phần OOXML lưu song song trong IndexedDB theo `docId`. **Phải làm trước khi dựng ánh xạ `docx-io`** — lắp sau là viết lại.
- **Chuỗi phân giải kiểu**: `docDefaults` → kiểu tài liệu (`basedOn`, `link`) → đánh số → định dạng trực tiếp (`rPr`/`pPr`). Nguồn sai lệch hiển thị lớn nhất nếu làm ẩu; cần kiểm thử đơn vị theo từng tầng.
- Mở rộng lược đồ TipTap để **giữ `styleId` và định danh nút OOXML bền vững trong thuộc tính**, phục vụ ghi ngược ở M4.
- Đọc: danh sách nhiều cấp (`numbering.xml`), bảng (`tblPr`, `tblGrid`, `gridSpan`, `vMerge`), ảnh, siêu liên kết, dấu trang, `sectPr`, đầu/chân trang chỉ đọc.
- **Nút mờ (Lớp B)**: mọi phần tử không nhận diện được → nút `ooxmlOpaque` nguyên tử, giữ XML thô, hiển thị khối giữ chỗ.
- Đuôi dài gỡ lỗi hiển thị trên bộ mẫu.

**🚩 Mốc M3:** mở file thật, sửa được nội dung trong trình soạn thảo, chất lượng hiển thị so với `docx-preview` đạt ≥90% trên bộ mẫu Lớp A.
**Ngày công:** 30–45.

### M4 · Tháng 4–6 — Round-trip Lớp A ⚠️ chặng khó nhất

- Ánh xạ vị trí hai chiều: giữ định danh nút bền vững qua các transaction của ProseMirror (vị trí dịch chuyển liên tục — đây là bài toán thiết kế khó nhất).
- Theo dõi nút bẩn: chỉ đoạn văn / run bị sửa mới tuần tự hóa lại.
- Nút mới → sinh `w:p` / `w:r`, kế thừa `rPr` từ ngữ cảnh. Nút xóa → gỡ khỏi XML, giữ nguyên anh em. Nút mờ → ghi lại nguyên vẹn.
- Ghi ngược cho bảng và danh sách (khó hơn đoạn văn đáng kể).
- **Không đụng tới** `styles.xml`, `numbering.xml`, theme, cấu hình, đầu/chân trang, media.
- Đuôi dài gỡ lỗi round-trip trên bộ mẫu — **hạng mục tốn nhất cả dự án, 10–17 ngày**, và phụ thuộc trực tiếp vào chất lượng bộ đo dựng ở M2.

**🚩 Mốc M4:** mở file → sửa một từ → lưu → mở lại bằng MS Word và LibreOffice, khác biệt duy nhất là từ đó.
**Tiêu chí:** bộ mẫu Lớp A round-trip ≥90%; **0 file bị Word báo hỏng**.
**Ngày công:** 32–51.

> **Nếu M4 trượt hạn:** cắt phạm vi, không cắt chất lượng — hạ một số mục Lớp A xuống Lớp B (bảng gộp ô, danh sách nhiều cấp) và giao đúng hạn với phạm vi hẹp hơn. Trong lúc đó trình xem M2 vẫn đang chạy thật và vẫn đang giảm tải Collabora, nên dự án không bị coi là không có kết quả.

### M5 · Tháng 6–9 — Gia cố và nghiệm thu MVP

- Ghép lại toàn bộ thanh công cụ / phân trang / tìm-thay-thế **đã có sẵn** với lược đồ mới.
- Cảnh báo rõ khi tài liệu chứa phần tử Lớp B; xử lý lỗi và trạng thái rỗng.
- Dùng thử nội bộ diện rộng, sửa lỗi thực tế.

**🎯 Mốc MVP.** Tiêu chí nghiệm thu, phải đạt toàn bộ:

1. Dùng được hoàn toàn offline, không đăng nhập.
2. Mở `.docx` thật từ máy, sửa, lưu về máy, mở lại bằng MS Word không cảnh báo.
3. Bộ mẫu Lớp A round-trip đạt **≥95%**.
4. Phần tử Lớp B: **100% bảo toàn**, không mất một byte nào — kiểm chứng tự động trong CI.
5. Cài được như ứng dụng (PWA), mất mạng vẫn chạy.
6. Không mất dữ liệu trong 4 tuần dùng thử nội bộ.

**Ngày công:** 11–17.

> Tiêu chí 4 quan trọng hơn tiêu chí 3. Sửa được ít nhưng không bao giờ làm hỏng file của khách là sản phẩm dùng được; sửa được nhiều nhưng thỉnh thoảng nuốt mất nội dung là sản phẩm không ai dám dùng.

### Sau MVP

Các giai đoạn dưới đây bắt đầu **sau mốc M5**, ước lượng vẫn cho 1 kỹ sư + AI. Mốc tháng tính từ khi khởi động dự án.

> Giai đoạn 4 (OneMail SSO + Drive) có thể **kéo lên sớm hơn, chạy song song với M3/M4** nếu lãnh đạo muốn thấy tích hợp hệ sinh thái sớm. Nó độc lập với `docx-io` và rủi ro thấp. Đánh đổi: lùi mốc MVP tương ứng khoảng 1–1,5 tháng.

### Giai đoạn 4 · Tháng 9–10 — Ghép hệ sinh thái · 4–6 tuần

- `auth-sdk`: OneMail SSO. **Rủi ro thấp** — API đã có, có tài liệu, team khác sở hữu.
- `storage-adapter`: driver Drive, dùng dung lượng sẵn có trong gói OneMail.
- `services/api`: **một** ứng dụng NestJS, module `session` · `document-metadata` · `storage-token`.
- Đồng bộ: cục bộ là gốc, Drive là bản sao từ xa. Xung đột → giữ cả hai bản (tới Giai đoạn 5 thì Yjs tự hợp nhất).

**Drive iNET lưu file trên S3 — điều này đơn giản hóa kiến trúc đáng kể:**

- Trình duyệt lấy **pre-signed URL** từ máy chủ, rồi `PUT`/`GET` **trực tiếp lên S3**. Byte file không đi qua máy chủ ta → không có bài toán scale băng thông, chi phí máy chủ vẫn gần bằng không đúng như luận điểm ở mục 2.2.
- Máy chủ chỉ còn hai việc: xác thực và phát URL có thời hạn, cùng lưu metadata. Đây là lý do một ứng dụng NestJS là đủ, và tách microservices càng không cần thiết.
- **Kiểm soát đồng thời**: S3 không có khóa file. Dùng **ETag với ghi có điều kiện** (`If-Match`) để phát hiện xung đột theo cơ chế lạc quan — ai lưu sau nhận lỗi và được hỏi cách xử lý, thay vì ghi đè im lặng.
- **Phiên bản tài liệu gần như miễn phí**: nếu bật S3 versioning trên bucket, lịch sử phiên bản có sẵn ở tầng hạ tầng, không cần tự xây.
- Cần cấu hình CORS trên bucket cho phép các tên miền của ba ứng dụng, và dùng multipart upload cho file lớn.

**Mốc:** đăng nhập OneMail → thấy file trên Drive → mở → sửa → lưu về Drive → vẫn dùng được khi mất mạng.

### Giai đoạn 5 · Tháng 10–11 — Cộng tác thời gian thực · 4–6 tuần

- Hocuspocus (MIT) làm máy chủ đồng bộ.
- Chuỗi provider: `y-indexeddb` (offline) **+** `y-websocket` (online) — offline-first giữ nguyên, không đánh đổi.
- Awareness: con trỏ, hiện diện, danh sách người đang mở.
- Phân quyền xem / bình luận / sửa, ánh xạ từ quyền Drive.

**Mốc:** 2 người sửa cùng file thấy con trỏ nhau; rút mạng vẫn làm việc; cắm lại tự hợp nhất không mất dữ liệu.

### Giai đoạn 6 · Tháng 11–15 — Sheets · 12–16 tuần

- **Tuần 1: khảo sát bắt buộc** — đo khoảng cách tính năng giữa Univer bản mở và bản Pro. Đã biết bản Pro giữ: import/export, cộng tác, in ấn, biểu đồ, pivot, công thức nâng cao.
- `apps/sheets` trên Univer OSS.
- `packages/xlsx-io` tự xây bằng **ExcelJS**, áp dụng lại nguyên tắc giữ-nguyên-và-vá của `ooxml-core`.
- Biểu đồ: `echarts` (Apache-2.0) thay cho biểu đồ bản Pro.
- Công thức: đánh giá công thức bản mở; **không dùng HyperFormula nếu xác nhận là GPL**.
- Cộng tác: Univer bản mở không có sẵn → tự ràng buộc Yjs hoặc hoãn.

**Rủi ro:** khoảng cách bản mở/Pro lớn hơn dự kiến. Giảm thiểu bằng tuần khảo sát đầu giai đoạn — nếu quá lớn, cân nhắc đổi nền bảng tính trước khi đã đầu tư sâu.

### Giai đoạn 7 · Tháng 15–19 — Slides · 14–18 tuần ⚠️ rủi ro cao nhất

- **Tuần 1–2: khảo sát bắt buộc** — mở, sửa, lưu, mở lại bằng PowerPoint thật, dùng **file `.pptx` thật của khách hàng iNET** (logo, bảng biểu, phông tiếng Việt, mẫu slide doanh nghiệp). Không dùng file demo của tác giả.
- Fork `pptx-viewer` (Apache-2.0) và **coi như mã nhà, tự bảo trì**. Đây không phải một dependency thông thường: dự án mới 5 tháng, một tác giả duy nhất, phát hành ~1 bản/ngày nên API chưa ổn định. Ghim phiên bản cứng. Đánh giá đầy đủ ở mục 6.4.
- Có sẵn và khá đầy đủ: ribbon, bảng thuộc tính, kéo thả trên canvas, 187 hình khối dựng sẵn, 23 loại biểu đồ, SmartArt, hiệu ứng và morph, xuất PNG/PDF/GIF/video, cộng tác Yjs với hiện diện, hỗ trợ 5 khung giao diện.
- Phải bổ sung hoặc kiểm chứng: master/layout, chế độ trình chiếu, theme, và **quan trọng nhất là độ chính xác trên file thật** — đây mới là phần tốn thời gian, không phải tính năng.
- Hạn chế đã biết của thư viện: không sửa được đối tượng OLE nhúng; xuất ảnh raster chất lượng hạn chế; phông chữ phụ thuộc trình duyệt.

**Dự phòng:** nếu khảo sát cho kết quả xấu, cân nhắc Univer Slides hoặc tự xây trên canvas — cả hai đều đắt hơn, cần quyết lại về phạm vi.

### Giai đoạn 8 · Tháng 19–20 — Vỏ chung và hoàn thiện · 4–6 tuần

- `apps/shell`: launcher, quản lý file chung, gần đây, tìm kiếm, chia sẻ.
- Theme thống nhất, đa ngôn ngữ.
- Gia cố bảo mật, trợ năng, hiệu năng.

### Tầm nhìn dài hạn — chưa cam kết thời gian

- **Desktop (Tauri 2.0).** Chi phí **thấp hơn nhiều** so với lộ trình v6.1 cũ, vì offline-first đã giải quyết xong ở tầng web. Tauri chỉ còn thêm: gắn phần mở rộng file, khay hệ thống, SQLite tùy chọn.
- **Di động.** PWA gần như miễn phí (đã có từ Giai đoạn 3). React Native chỉ khi có nhu cầu thật.
- **Trợ lý AI.** Soạn thảo, tóm tắt, dịch — tích hợp qua API, là điểm khác biệt mà Collabora không cho phép làm.
- **Tách microservices.** Chỉ khi có tín hiệu thật: một module cần scale riêng, hoặc một team riêng sở hữu.

---

## 8. Cơ sở ước lượng và kịch bản nhân sự

### 8.1 Bóc tách theo ngày

Con số 6–9 tháng không phải cảm tính. Bóc tách cho **1 kỹ sư có hỗ trợ AI agentic**, tính bằng số ngày làm việc:

| Hạng mục                                                                         | Mốc | Ngày             |
| -------------------------------------------------------------------------------- | --- | ---------------- |
| Nền tảng: monorepo, IndexedDB, File System Access, PWA, quản lý file             | M1  | 12–18            |
| Nền giao diện: Tailwind + shadcn/ui, chuyển 9 primitive, design token dùng chung | M1  | 4–6              |
| `ooxml-core` giải nén/nén giữ nguyên byte                                        | M2  | 6–9              |
| `fidelity-harness` — **phát khác biệt máy đọc được**, không chỉ phần trăm        | M2  | 6–9              |
| Trình xem dùng `docx-preview`                                                    | M2  | 3–5              |
| Yjs làm nguồn dữ liệu gốc                                                        | M3  | 6–8              |
| Đọc: paragraph, run, chuỗi phân giải kiểu                                        | M3  | 7–10             |
| Đọc: danh sách nhiều cấp                                                         | M3  | 3–5              |
| Đọc: bảng                                                                        | M3  | 5–8              |
| Đọc: ảnh, siêu liên kết, dấu trang                                               | M3  | 4–6              |
| Đọc: `sectPr`, đầu/chân trang, nút mờ                                            | M3  | 5–8              |
| Đuôi dài gỡ lỗi chiều đọc                                                        | M3  | 7–11             |
| Ghi: ánh xạ vị trí + định danh nút bền vững                                      | M4  | 7–10             |
| Ghi: theo dõi nút bẩn + tuần tự hóa chọn lọc                                     | M4  | 4–7              |
| Ghi: nút mới/xóa + kế thừa thuộc tính                                            | M4  | 6–9              |
| Ghi: bảng và danh sách                                                           | M4  | 5–8              |
| **Đuôi dài gỡ lỗi round-trip**                                                   | M4  | **10–17**        |
| Ghép lại thanh công cụ / phân trang với lược đồ mới                              | M5  | 3–5              |
| Gia cố + dùng thử nội bộ + sửa lỗi                                               | M5  | 8–12             |
| **Tổng**                                                                         |     | **111–171 ngày** |

Trừ họp, chuyển ngữ cảnh, việc phát sinh và nghỉ phép, một người làm toàn thời gian thực tế chỉ có **19–20 ngày làm được việc mỗi tháng**. Chia ra: **6–9 tháng**, điểm giữa khoảng **7 tháng**.

### 8.2 Hỗ trợ AI: giúp ở đâu, và điều kiện để giúp được

| Loại công việc                         | Mức tăng tốc                 | Ví dụ trong dự án                                                       |
| -------------------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| Sinh mã cơ học bám đặc tả              | **Cao, 2x trở lên**          | Ánh xạ OOXML sang lược đồ, dựng khung kiểm thử, chuyển đổi kiểu dữ liệu |
| Tra cứu và hiểu đặc tả                 | Cao                          | ECMA-376 rất dài; AI rút ngắn thời gian tìm đúng chỗ                    |
| **Vòng lặp gỡ lỗi có thước đo cơ học** | **Cao — nhưng có điều kiện** | Xem ô cảnh báo bên dưới                                                 |
| Thiết kế thuật toán                    | Trung bình                   | Ánh xạ vị trí hai chiều, giữ định danh nút qua transaction              |
| Xác minh tính đúng đắn so với đặc tả   | **Không**                    | Phải có người đối chiếu với hành vi thật của MS Word                    |

> **Điều kiện then chốt — quyết định thiết kế đáng giá 1,5–2 tháng.**
> Gỡ lỗi sai lệch là vòng lặp: chạy bộ đo → đọc khác biệt → sửa ánh xạ → chạy lại. Đây đúng là dạng vòng lặp agentic AI làm tốt, **nhưng chỉ khi `fidelity-harness` phát ra khác biệt máy đọc được**: XPath của phần tử lệch, tên thuộc tính, giá trị mong đợi so với giá trị thực, toạ độ vùng pixel sai.
> Nếu bộ đo chỉ trả về "đạt 87%" thì con người vẫn phải mò từng file, và đuôi dài gỡ lỗi quay về mức 25–40 ngày. **Vì vậy `fidelity-harness` phải được thiết kế cho máy đọc ngay từ M2, không phải cho người xem.**

### 8.3 Năm thứ không nén được bằng tốc độ code

Đây là sàn thật của tiến độ. Mọi ước lượng bỏ qua chúng đều lạc quan quá mức:

1. **Thu thập bộ mẫu** — phụ thuộc người khác, 2–4 tuần lịch. Phải khởi động từ tuần đầu.
2. **Bốn tuần dùng thử nội bộ ở M5** — thời gian lịch, không phải công sức. Muốn biết có mất dữ liệu không thì phải để người dùng thật dùng đủ lâu.
3. **Xác minh tính đúng đắn OOXML.** AI viết được ánh xạ, nhưng phải có người xác nhận ánh xạ đó đúng đặc tả. Với OOXML, AI sinh mã sai một cách rất hợp lý là chuyện thường, và loại sai đó chỉ lộ ra ở file thứ hai trăm của khách. **Dùng AI mạnh mà không kiểm chứng thì đuôi dài gỡ lỗi phình ra chứ không co lại.**
4. **Băng thông của một người.** AI sinh mã nhanh gấp mười không giúp nếu nút cổ chai là khả năng đọc hiểu và kiểm chứng. Một người review được ngần ấy mỗi ngày, bất kể ai viết.
5. **Quyết định kiến trúc.** Ánh xạ vị trí hai chiều, giữ định danh nút bền vững qua transaction — phải nghĩ, không phải gõ.

### 8.4 Kịch bản nhân sự

| Kịch bản                    | Docs MVP      | + Hệ sinh thái + Cộng tác | Bộ hoàn chỉnh   |
| --------------------------- | ------------- | ------------------------- | --------------- |
| **1 kỹ sư + AI** (hiện tại) | **6–9 tháng** | +2 tháng                  | **15–20 tháng** |
| **2–3 kỹ sư + AI**          | 4–5 tháng     | +1,5 tháng                | **9–13 tháng**  |
| **4–6 kỹ sư + AI**          | 3–4 tháng     | +1 tháng                  | **7–9 tháng**   |

**Lưu ý khi cân nhắc bổ sung người:** chiều ghi của `docx-io` (M4) là đường găng và **rất khó chia nhỏ** — cần một người hiểu sâu OOXML làm xuyên suốt. Người thứ hai và thứ ba tăng tốc rõ rệt ở Sheets, Slides, vỏ chung và backend. Thời điểm bổ sung hiệu quả nhất: **đầu M3**, khi Yjs, đọc file và tích hợp hệ sinh thái có thể chạy song song.

### 8.5 Muốn xuống dưới 6 tháng: cắt phạm vi hoặc thêm nguồn lực

Không phải ước lượng lại. Bốn đòn bẩy, xếp theo giá trị thật:

| Đòn bẩy                               | Rút được                            | Đánh đổi                                                                  |
| ------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| **Nới ràng buộc C3 (chấp nhận AGPL)** | −3 đến −4 tháng → còn **3–5 tháng** | Phải mở mã nguồn phần giao diện Docs. Backend, SSO, Drive không ảnh hưởng |
| **Thêm kỹ sư thứ hai**                | → còn **4–5 tháng**                 | Chi phí nhân sự, nhưng xoá luôn rủi ro phụ thuộc một người                |
| Bỏ bảng khỏi Lớp A, hạ xuống Lớp B    | −1 đến −1,5 tháng                   | Bảng rất phổ biến trong tài liệu thật. **Không khuyến nghị**              |
| Bỏ Yjs khỏi MVP                       | −0,5 tháng                          | Phải viết lại sau, tốn gấp bốn. **Không nên**                             |

Hai đòn bẩy đầu là thật và lớn. Hai đòn bẩy sau là tự lừa mình.

### 8.6 Lịch sử điều chỉnh ước lượng

Ghi lại để tránh lặp và để người đọc sau hiểu vì sao con số thay đổi:

| Bản                 | Con số        | Đánh giá                                                                                                                            |
| ------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| v1.0                | 5–7 tháng     | Gần đúng, hơi lạc quan                                                                                                              |
| v1.1                | 90 ngày       | **Sai.** Nén bằng cách nhét quá nhiều vào 30 ngày đầu, và ước lượng đuôi dài gỡ lỗi quá nhẹ. Không có cơ chế kỹ thuật nào biện minh |
| v1.2                | 8–12 tháng    | Quá thận trọng ở chiều ngược lại: coi vòng lặp gỡ lỗi là việc thủ công                                                              |
| **v1.3 (hiện tại)** | **6–9 tháng** | Có cơ chế cụ thể: bộ đo phát khác biệt máy đọc được biến gỡ lỗi thành vòng lặp agentic (mục 8.2)                                    |

---

## 9. Chiến lược chuyển đổi khỏi Collabora

Không thay một lần. Collabora là LibreOffice với hàng chục năm xử lý định dạng Office — tuyên bố "6 tháng thay xong" là cách chắc chắn nhất để mất uy tín khi khách mở một file phức tạp.

| Pha                          | Thời điểm  | Nội dung                                                                                                                                                                                                  |
| ---------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Song song**            | Ngày 0–60  | Collabora vẫn là chính. Thu thập file thật làm bộ mẫu đo lường.                                                                                                                                           |
| **A+ — Chiếm luồng xem**     | Tháng 2–7  | **Trình xem M2 triển khai thật.** Mọi thao tác chỉ-xem chuyển sang nền tảng mới; Collabora chỉ còn phục vụ sửa. Đây là mốc giảm tải Collabora đầu tiên và sớm nhất.                                       |
| **B — Mặc định có dự phòng** | Tháng 7–11 | Docs mới thành mặc định cho tạo mới và tài liệu Lớp A. **Bộ định tuyến tự động**: file chứa nhiều phần tử Lớp B hoặc có điểm chất lượng dưới ngưỡng → mở bằng Collabora. Người dùng không thấy khác biệt. |
| **C — Thu hẹp**              | Tháng 11+  | Giảm dần phạm vi Collabora theo số liệu thực tế, không theo cảm tính. Mỗi tháng chuyển thêm một nhóm phần tử từ Lớp B lên Lớp A.                                                                          |

**Tiêu chí định lượng để tắt hẳn Collabora cho Docs** — phải đạt đồng thời:

1. Bộ mẫu round-trip đạt ≥95%.
2. Tỉ lệ chuyển tiếp sang Collabora thực tế dưới 5%, duy trì liên tục 60 ngày.
3. Không có sự cố mất dữ liệu nào trong 90 ngày.
4. Thời gian mở file ở phân vị 95 không chậm hơn Collabora hiện tại.

Bộ tiêu chí này bảo vệ cả hai phía: kỹ thuật không bị ép tắt sớm, và lãnh đạo có mốc rõ ràng để biết khi nào việc đầu tư hoàn tất.

---

## 10. Đo lường

### 10.1 Bộ đo chất lượng round-trip — `fidelity-harness`

Thành phần bắt buộc, dựng ngay ở M2 (tháng thứ 2), chạy trong CI mỗi lần build:

- **Bộ mẫu**: 50–100 file `.docx` thật từ người dùng hiện tại (đã ẩn danh), phủ các loại: hợp đồng, báo cáo, biểu mẫu, tài liệu có ảnh/bảng/danh sách nhiều cấp.
- **Phép đo 1 — Giữ nguyên**: mở → lưu, không sửa. So từng byte. Mục tiêu 100%.
- **Phép đo 2 — Round-trip**: mở → sửa → lưu → mở lại. Kết xuất và so pixel với bản gốc. Mục tiêu ≥95%.
- **Phép đo 3 — Tính hợp lệ**: file kết quả mở được bằng MS Word và LibreOffice không cảnh báo. Mục tiêu 100%.

Con số của Phép đo 2 chính là **báo cáo tiến độ hàng tháng** — thuyết phục hơn mọi slide.

### 10.2 Chỉ số sản phẩm (từ Pha B)

Tỉ lệ chuyển tiếp sang Collabora · số tài liệu tạo mới trên nền tảng mới · thời gian mở file (p50/p95) · tỉ lệ lỗi · số sự cố mất dữ liệu (mục tiêu tuyệt đối: 0).

### 10.3 Khung đo chi phí — cần điền số

Chưa có số liệu thực tế. Cần thu thập trước khi dùng lập luận chi phí:

| Hạng mục                     | Collabora hiện tại | Nền tảng mới              |
| ---------------------------- | ------------------ | ------------------------- |
| Số người dùng đồng thời đỉnh | _cần đo_           | như nhau                  |
| RAM cụm máy chủ              | _cần đo_           | ~0 (tính toán ở client)   |
| CPU cụm máy chủ              | _cần đo_           | ~0                        |
| Chi phí bản quyền/năm        | _cần xác nhận_     | 0                         |
| Lưu trữ                      | Drive (đã có)      | Drive (đã có)             |
| Băng thông đồng bộ           | —                  | _ước lượng ở Giai đoạn 4_ |

---

## 11. Rủi ro và giảm thiểu

| #   | Rủi ro                                                                                                                                                                                                                                     | Khả năng   | Mức độ           | Giảm thiểu                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Chất lượng round-trip `.docx` không đạt                                                                                                                                                                                                    | Trung bình | **Nghiêm trọng** | Bộ đo từ M2; mốc chứng minh byte-identical ở ngày 60; dự phòng chỉ-đọc + chuyển tiếp Collabora                                                                        |
| R2  | **Toàn bộ dự án phụ thuộc 1 kỹ sư trong 7 tháng**                                                                                                                                                                                          | Cao        | **Nghiêm trọng** | Rủi ro tổ chức lớn nhất. Bắt buộc: ghi chép quyết định kiến trúc, tài liệu hóa `ooxml-core`/`docx-io`, bổ sung người thứ hai chậm nhất đầu M3                         |
| R2b | **Bộ đo không phát được khác biệt máy đọc được** → vòng lặp gỡ lỗi quay về thủ công, tiến độ +1,5–2 tháng                                                                                                                                  | Trung bình | **Nghiêm trọng** | Coi đây là tiêu chí nghiệm thu của M2, không phải tính năng phụ. Nếu M2 không đạt, điều chỉnh kỳ vọng tiến độ ngay chứ không chờ tới M4                               |
| R2d | **Lạm dụng AI sinh mã mà không kiểm chứng** — với OOXML, mã sai một cách hợp lý chỉ lộ ra ở file thứ hai trăm của khách                                                                                                                    | Cao        | **Nghiêm trọng** | Mọi ánh xạ phải có kiểm thử đơn vị đối chiếu đặc tả ECMA-376; bộ đo chạy mỗi lần build; không nhận mã mà chưa hiểu                                                    |
| R2c | **Mất động lực do chu kỳ dài không có kết quả nhìn thấy** — rủi ro thật với dự án solo 7 tháng                                                                                                                                             | Trung bình | Nghiêm trọng     | Chính là lý do chia M1–M5: mỗi mốc đều có thứ demo được, M2 còn triển khai thật được                                                                                  |
| R3  | `pptx-viewer`: dự án 5 tháng tuổi, một tác giả, ~1 bản phát hành/ngày, mã sinh bằng AI quy mô lớn. Tính năng đầy đủ nhưng **chưa được kiểm chứng ngoài thực địa**                                                                          | Cao        | Trung bình       | Khảo sát 2 tuần **bằng file thật của khách**, không dùng file demo; fork và coi là mã nhà; ghim phiên bản cứng. Chi tiết mục 6.4                                      |
| R4  | Khoảng cách tính năng Univer bản mở vs Pro                                                                                                                                                                                                 | Trung bình | Trung bình       | Khảo sát 1 tuần đầu Giai đoạn 6, trước khi đầu tư sâu                                                                                                                 |
| R5  | File System Access API chỉ có trên Chromium                                                                                                                                                                                                | Chắc chắn  | Thấp             | Dự phòng bằng input file + tải blob cho Firefox/Safari                                                                                                                |
| R6  | **Trình duyệt xóa IndexedDB** (Safari xóa sau 7 ngày không dùng)                                                                                                                                                                           | Trung bình | **Nghiêm trọng** | Dùng Storage Persistence API; cảnh báo rõ cho người dùng; khuyến khích lưu lên Drive; không bao giờ để IndexedDB là bản duy nhất của tài liệu quan trọng              |
| R9  | **Ba ứng dụng trông không giống nhau.** Univer và `pptx-viewer` mang giao diện riêng (toolbar, ribbon, bảng thuộc tính), không tự động theo shadcn. Đánh thẳng vào lập luận số một để thay Collabora là "giao diện thống nhất với OneMail" | Cao        | Trung bình       | Bộ design token dùng chung dựng từ M1, điều khiển đồng thời theme shadcn và ghi đè theme Univer/pptx-viewer. Phải thiết kế chủ động ngay từ đầu, không hy vọng có sẵn |
| R7  | API OneMail/Drive thay đổi                                                                                                                                                                                                                 | Thấp       | Trung bình       | Cô lập sau `auth-sdk` và `storage-adapter`                                                                                                                            |
| R8  | Áp lực rút ngắn tiến độ giữa chừng                                                                                                                                                                                                         | Trung bình | Trung bình       | Hai đòn bẩy đã chuẩn bị sẵn ở mục 4.4, để lãnh đạo quyết                                                                                                              |

---

## 12. Đề xuất quyết định

1. **Duyệt hợp đồng phạm vi MVP ở mục 7.0** — Lớp A sửa được, Lớp B bảo toàn. Đây là điều kiện để ước lượng 6–9 tháng có nghĩa. Duyệt lộ trình mà không duyệt phạm vi thì mốc sẽ trượt.
2. **Cấp quyền thu thập bộ mẫu trước ngày thứ 20**: 50–100 file `.docx` thật đã ẩn danh từ người dùng Collabora hiện tại. Không có bộ mẫu thì không đo được chất lượng và không chứng minh được đã thay xong. Việc này phụ thuộc người khác nên phải khởi động từ tuần đầu.
3. **Xác nhận ràng buộc pháp lý** C1/C2/C3, hiểu rằng nó chiếm khoảng một nửa tổng tiến độ. Nới C3 đưa MVP về 3–5 tháng; thêm kỹ sư thứ hai đưa về 4–5 tháng (mục 8.5).
4. **Quyết nhân sự**: giữ 1 người (chấp nhận rủi ro R2 và kế hoạch 7 tháng không có dự phòng) hay bổ sung từ M3.

---

## 13. Câu hỏi còn mở

1. Số liệu chi phí Collabora hiện tại (người dùng đồng thời, RAM/CPU, bản quyền) — chưa có, cần thu thập để hoàn thiện mục 10.3.
2. Quy trình lấy file `.docx` thật làm bộ mẫu có vướng quy định bảo mật dữ liệu khách hàng không? Cần thống nhất cách ẩn danh.
3. Giấy phép HyperFormula — cần xác minh trước Giai đoạn 6.
4. Univer bản mở có ràng buộc được Yjs không, hay bắt buộc dùng cộng tác bản Pro? Xác minh ở tuần khảo sát Giai đoạn 6.
5. Drive iNET (S3) đã bật **versioning** trên bucket chưa? Nếu chưa, bật lên thì có lịch sử phiên bản gần như miễn phí. Cần xác nhận với team Drive.
6. S3 iNET có hỗ trợ **ghi có điều kiện** (`If-Match` theo ETag) không? Quyết định cách xử lý xung đột ở Giai đoạn 4. Nếu không hỗ trợ, cần cơ chế khóa ở tầng metadata.
7. Chính sách CORS trên bucket S3 — ai cấu hình, quy trình thế nào?
8. Có yêu cầu tuân thủ nào về nơi lưu dữ liệu (dữ liệu phải nằm trong nước) ảnh hưởng tới thiết kế đồng bộ không?
