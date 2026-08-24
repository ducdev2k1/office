# Phase 2: Professional Print Preview & Client-side PDF Export

Status: Completed
Effort: 10h

## 1. Mục tiêu
- Xây dựng giao diện **Print Preview Modal** hoàn chỉnh cho bảng tính Sheets.
- Hỗ trợ các tùy chọn in:
  - Khổ giấy: A4, A3, Letter, Legal.
  - Hướng in: Dọc (Portrait) / Ngang (Landscape).
  - Phạm vi in: Active Sheet, Selected Range, Entire Workbook, Custom Print Area.
  - Căn chỉnh & Tỉ lệ: 100%, Fit to 1 page, Fit to sheet width.
  - Tuỳ chọn hiển thị: Hiện/ẩn đường kẻ ô (Gridlines), Hiện/ẩn tiêu đề hàng & cột (Row/Column Headers).
- Xuất tệp PDF độ nét cao trực tiếp phía client (High-DPI render via `jspdf`).

## 2. Công việc chi tiết
1. Cài đặt thư viện `jspdf` vào `apps/sheets`.
2. Tạo module `apps/sheets/src/modules/print`:
   - `types/print.types.ts`: Định nghĩa `PrintSettings`, `PrintRangeOption`, `PaperSize`.
   - `utils/printGenerator.utils.ts`: Xử lý tính toán phân trang, chia lưới ô tính, căn chỉnh kích thước dòng/cột theo tỉ lệ mm/pt của PDF.
   - `components/PrintPreviewModal.tsx`: Modal xem trước với thanh điều khiển cài đặt bên phải và khung canvas xem trước trang in bên trái.
   - `components/PrintSettingsPanel.tsx`: Cụm điều khiển cài đặt khổ giấy, lề, tỉ lệ.
3. Gắn lệnh In vào Toolbar (`QuickActions.tsx`), Menu chuột phải và phím tắt `Ctrl + P`.
