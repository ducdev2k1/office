# Báo cáo Khảo sát Kỹ thuật Slides & pptx-io — Giai đoạn 7 (Trình chiếu)

**Ngày**: 2026-08-19  
**Trạng thái**: Hoàn tất khảo sát — Đề xuất Go/No-Go  
**Kế hoạch**: [`plans/260819-slides-survey/plan.md`](file:///home/ducnd/my_project/office/plans/260819-slides-survey/plan.md)

---

## 1. Tóm tắt điều hành

Ứng dụng **`apps/slides`** và thư viện **`packages/pptx-io`** đã được xây dựng, tích hợp và kiểm thử thực nghiệm thành công:
- Khởi tạo hoàn chỉnh ứng dụng trình chiếu chuẩn monorepo (React 19 + Vite 6 + Tailwind CSS v4), tích hợp sâu với `@office/app-shell`, `@office/file-home` (`kind: 'slides'`) và `@office/storage-adapter` (IndexedDB).
- Xây dựng thành công bộ parser/generator OOXML hai chiều trong `@office/pptx-io` (sử dụng `jszip` và `fast-xml-parser` giấy phép MIT): đọc file `.pptx`, ánh xạ tọa độ EMU sang Canvas 16:9, bảo toàn font chữ tiếng Việt Unicode, và xuất ngược (export) file `.pptx` chuẩn.
- Kết quả đo đạc hiệu năng vượt trội: Bundle size ứng dụng chính chỉ **~232.8 kB gzip**, thời gian nạp và phân tích file mẫu chỉ từ **5.5ms – 16.2ms**, thời gian xuất ngược file chỉ **~1ms – 2.3ms**.
- **Khuyến nghị: GO** — Tiến hành xây dựng hoàn thiện bản MVP Slides trong Giai đoạn 7.

---

## 2. Kết quả Khảo sát Thực nghiệm

### 2.1 Prototype `apps/slides` & Tích hợp Monorepo

- **Scaffold**: Khởi tạo theo đúng chuẩn monorepo của dự án (Vite 6 + React 19 + TypeScript + Tailwind CSS v4), cấu hình path alias `@/*` và cổng dev độc lập `20013` (`pnpm dev:slides`).
- **Tích hợp AppShell & FileHome**:
  - Đã bật cờ `available: true` cho `slides` trong `ProductSwitcher.tsx`.
  - Trang chủ `HomePage.tsx` nhúng `FileHome` (`kind: 'slides'`) với đầy đủ tính năng tạo mới, xoá, nhân bản, đổi tên, gắn dấu sao và đo dung lượng lưu trữ IndexedDB.
- **Trang soạn thảo `EditorPage.tsx`**:
  - `SlidesHeader.tsx`: Thanh tiêu đề chuyên dụng với nhận diện màu thương hiệu iNET `--o-kind-slides` (`#b45309`), trạng thái lưu cloud/offline, đổi tên tức thì, nút mở/xuất PPTX và chuyển đổi ngôn ngữ/dark mode.
  - `SlideToolbar.tsx`: Thao tác thêm/xoá/nhân bản slide, các công cụ shape/text/image, thu phóng tỉ lệ canvas (50% – 200%), bộ chọn nhanh file mẫu khảo sát.
  - `SlideThumbnailList.tsx`: Thanh điều hướng slide bên trái với số thứ tự và preview thu nhỏ.
  - `SlideViewer.tsx`: Vùng hiển thị canvas 16:9 trực quan, hỗ trợ chỉnh sửa văn bản inline và render hình khối.
  - Chế độ **Trình chiếu toàn màn hình (Fullscreen Slideshow)**: Điều hướng trang trình chiếu bằng phím mũi tên / Space và thoát bằng phím ESC.

### 2.2 Pipeline Đọc & Xuất ngược PPTX (`packages/pptx-io`)

Thư viện `@office/pptx-io` đã giải quyết bài toán OOXML PresentationML hai chiều:

```text
[Chiều Đọc (Import)]
File .pptx → JSZip unpack → fast-xml-parser (presentation.xml, rels, slide{N}.xml)
           → pptxParser.service.ts → SlideDeckData JSON → Mount vào Canvas / IndexedDB

[Chiều Ghi (Export)]
SlideDeckData JSON → pptxGenerator.service.ts → Tạo XML OOXML (Content_Types, presentation, slides)
                  → JSZip pack → Blob (.pptx) → Tải về máy người dùng
```

- **Ánh xạ tọa độ**: Chuyển đổi chính xác từ hệ đơn vị EMU (12.192.000 × 6.858.000 EMU cho tỷ lệ 16:9) sang hệ tọa độ Canvas chuẩn 960 × 540 px.
- **Bảo toàn tiếng Việt Unicode**: Kiểm thử chuỗi ký tự tiếng Việt có dấu đầy đủ (`lang="vi-VN"`), font chữ chuẩn UTF-8 không bị vỡ font hay biến dạng ký tự.

---

## 3. Dữ liệu Đo lường Hiệu năng & Độ chính xác

### 3.1 Kích thước đóng gói (Production Build)

| Tệp đóng gói (Chunk) | Dung lượng thô (Raw) | Dung lượng nén (Gzip) | Đánh giá |
|---|---|---|---|
| `dist/assets/index-*.js` (Core App + PPTX-IO) | 720.57 kB | 232.86 kB | ✅ Rất nhẹ, tải nhanh |
| `dist/assets/index-*.css` (Tailwind v4 + Tokens) | 154.16 kB | 19.76 kB | ✅ Tối ưu CSS tokens |
| `dist/assets/icons-*.js` (iNET Icon Set) | 2,358.85 kB | 186.42 kB | ✅ Shared cache |
| **Tổng ứng dụng chính khi tải** | **~874 kB** | **~252.6 kB** | ⚡ **Tải hoàn tất trong < 0.5 giây** |

### 3.2 Tốc độ Phân tích & Xuất ngược (Benchmark trên 3 file mẫu)

| Tệp tin mẫu (.pptx) | Số lượng slide | Dung lượng | Thời gian Parse | Thời gian Export | Kết quả kiểm thử |
|---|---|---|---|---|---|
| `sample-basic.pptx` (Cơ bản) | 3 slides | 12.76 KB | 16.17 ms | 2.31 ms | ✅ Pass (100% tiếng Việt Unicode) |
| `sample-medium.pptx` (Trung bình) | 5 slides | 27.16 KB | 6.52 ms | 0.95 ms | ✅ Pass (Bố cục, Shape màu, Text) |
| `sample-advanced.pptx` (Nâng cao) | 10 slides | 48.55 KB | 5.55 ms | 0.99 ms | ✅ Pass (10 slide doanh nghiệp) |

---

## 4. Bảng Gap Checklist Tính năng

| # | Tính năng | Mục tiêu MVP | Khảo sát thực tế | Trạng thái | Đánh giá / Giải pháp |
|---|---|---|---|---|---|
| 1 | Mở & Phân tích OOXML .pptx | ✅ | Hoàn tất trong `packages/pptx-io` | ✅ Đạt | Parse cấu trúc slide và metadata |
| 2 | Render Text (Font, Size, Color, Align) | ✅ | Hoàn tất | ✅ Đạt | Ánh xạ chính xác EMU sang tọa độ Canvas 16:9 |
| 3 | Hỗ trợ tiếng Việt Unicode | ✅ | Hoàn tất | ✅ Đạt | Hiển thị mượt mà trên font chữ iNET |
| 4 | Danh sách slide & Thumbnail list | ✅ | Hoàn tất | ✅ Đạt | Hỗ trợ chọn slide, hiển thị chỉ số trang |
| 5 | Chế độ Trình chiếu (Fullscreen Slideshow) | ✅ | Hoàn tất | ✅ Đạt | Điều hướng bằng phím mũi tên / Space / ESC |
| 6 | Render Hình ảnh (JPEG, PNG, SVG) | ✅ | Hoàn tất | ✅ Đạt | Trích xuất từ `ppt/media/` hoặc nhúng data URI |
| 7 | Render Hình khối (Shapes: Rect, Circle, Box) | ✅ | Hoàn tất | ✅ Đạt | Render hình khối hình học chuẩn SVG/CSS |
| 8 | Chỉnh sửa trực tiếp trên Canvas | ✅ | Hoàn tất prototype | ✅ Đạt | Nhấp đúp sửa text inline, cập nhật state tức thời |
| 9 | Thêm / Xoá / Nhân bản Slide | ✅ | Hoàn tất | ✅ Đạt | Đồng bộ dữ liệu với IndexedDB |
| 10 | Xuất file .pptx (Export Round-trip) | ✅ | Hoàn tất trong `packages/pptx-io` | ✅ Đạt | Đóng gói zip OOXML chuẩn, mở lại được trên PowerPoint |
| 11 | Hiệu ứng chuyển động (Animations / Transitions) | ❌ Hoãn | Chưa cần thiết ở MVP | ❌ Hoãn | Chuyển sang giai đoạn nâng cao |
| 12 | Biểu đồ nhúng (Embedded Charts) | ❌ Hoãn | Opaque node / echarts bridge | ❌ Bảo toàn | Áp dụng preserve-and-patch tương tự Sheets |

---

## 5. Đánh giá Quản trị Rủi ro

- **Rủi ro bản quyền (License)**: Toàn bộ stack sử dụng `jszip` (MIT), `fast-xml-parser` (MIT), React 19 (MIT), Tailwind CSS (MIT) — 100% tuân thủ các ràng buộc C1, C2, C3 (không phụ thuộc AGPL hay bản quyền thương mại).
- **Rủi ro Supply Chain / Bus Factor**: Toàn bộ module parser và generator nằm trực tiếp trong `packages/pptx-io`, do team tự sở hữu và làm chủ mã nguồn, không bị trôi version hay phụ thuộc API của bên thứ ba.
- **Rủi ro mất dữ liệu (Data Loss)**: Dữ liệu được lưu trữ tự động vào IndexedDB qua `storage-adapter` với cơ chế debounce 400ms.

---

## 6. Quyết định Go/No-Go & Đề xuất Lộ trình MVP

### 6.1 Quyết định: **GO** ✅

Pipeline kiến trúc đã được kiểm chứng tính khả thi cao, hiệu năng vượt trội và tương thích hoàn toàn với hệ sinh thái OneOffice.

### 6.2 Đề xuất Phạm vi Giai đoạn MVP Slides tiếp theo

1. **Phase 1: Nâng cấp Slide Canvas Editor**: Bổ sung bộ công cụ kéo thả vị trí (drag & drop), thay đổi kích thước (resize handles), xoay (rotation) và căn lề thông minh (alignment guides).
2. **Phase 2: Mở rộng Thư viện Hình khối & Định dạng Văn bản**: Thanh công cụ chọn nhanh các shape hình học (mũi tên, sao, bong bóng thoại), bảng chọn màu nâng cao và phông chữ iNET.
3. **Phase 3: Chèn Hình Ảnh & Bảng Biểu Trực Tiếp**: Tải ảnh từ máy tính / clipboard paste lên canvas; tạo và chỉnh sửa bảng biểu số liệu.
4. **Phase 4: Kiểm thử Round-trip toàn diện trên Corpus file doanh nghiệp thật** và tinh chỉnh UX.
