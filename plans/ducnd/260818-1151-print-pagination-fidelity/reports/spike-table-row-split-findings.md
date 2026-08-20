# Spike Findings: Table Row Split (Phase 8)

## 1. Mục tiêu Spike

Đánh giá tính khả thi của việc chia tách bảng biểu (`<table>`) tại ranh giới hàng (`<tr>` / `tableRow`) khi bảng dài vượt qua ranh giới trang trong chế độ phân trang (Paged View) và in ấn.

## 2. Thử nghiệm các phương án kỹ thuật

### Phương án A: `Decoration.node` trên `tableRow` với `padding-top` / `margin-top`

- **Kết quả:** Thất bại.
- **Nguyên nhân:** Theo đặc tả CSS 2.1 / CSS Table Module Level 3, phần tử có `display: table-row` (`<tr>`) hoàn toàn bỏ qua thuộc tính `margin` và `padding`. Trình duyệt không dịch chuyển hàng xuống trang sau.

### Phương án B: `border-top: {spacer}px solid transparent` trên các `<td>`

- **Kết quả:** Thất bại một phần và phát sinh lỗi editing nghiêm trọng.
- **Nguyên nhân:**
  1. TipTap / ProseMirror sử dụng `border-collapse: collapse` và `table-layout: fixed`. Border lớn trên `<td>` làm méo mó các đường lưới bảng kế cận.
  2. Phá vỡ tính năng `columnResizing` của `@tiptap/extension-table` (các handle kéo thả cột tính toán sai tọa độ bounding rect của ô).
  3. Phá vỡ hiển thị vùng chọn `CellSelection` khi bôi đen nhiều ô.
  4. Lỗi vỡ layout khi bảng có ô ghép dòng (`rowspan > 1`) bắc qua vị trí ngắt trang.

### Phương án C: `Decoration.widget` chèn giữa các `<tr>`

- **Kết quả:** Thất bại.
- **Nguyên nhân:** Cấu trúc DOM của bảng HTML nghiêm cấm các thẻ `<div>` nằm giữa các `<tr>` bên trong `<tbody>`. Trình duyệt tự động đẩy thẻ widget ra ngoài bảng, làm hỏng DOM của ProseMirror.

## 3. Kết luận & Quyết định

- **Kết luận:** Giữ cơ chế ngắt trang ở cấp độ Block cho phần tử Bảng (`<table>`).
- **An toàn dữ liệu:** Nhờ fix tại Phase 2 (tính toán chính xác `contentOffsets` cho các block cao nhiều trang) và Phase 4 (cơ chế Sliding-Window cho bản in), bảng dài nhiều trang vẫn hiển thị đầy đủ, không bị cắt mất dữ liệu và in ấn ra trọn vẹn từng trang.
