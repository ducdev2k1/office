# Phase 3: Floating Images & Threaded Cell Comments Management

Status: Completed
Effort: 12h

## 1. Mục tiêu
- Xây dựng module **Floating Images**: Cho phép tải ảnh lên từ máy tính hoặc URL, hiển thị nổi trên canvas của Univer, hỗ trợ kéo/thả, 8 điểm điều khiển resize, xoay, khóa tỉ lệ và lưu trữ vào metadata tệp.
- Xây dựng module **Threaded Cell Comments**: Cho phép tạo bình luận gắn với từng ô tính (`Sheet1!B4`), hiển thị indicator tam giác nhỏ màu vàng/xanh ở góc ô, mở panel/popover bình luận theo luồng (Threaded conversation), trả lời (Reply), giải quyết (Resolve), xóa và đồng bộ qua phòng collab.

## 2. Công việc chi tiết
1. Tạo module `apps/sheets/src/modules/images`:
   - `types/images.types.ts`: `FloatingImageSpec`, `ImagePosition`.
   - `components/FloatingImageContainer.tsx`: Hộp chứa ảnh hỗ trợ tương tác kéo thả, 8 điểm resize.
   - `components/FloatingImageOverlay.tsx`: Lớp phủ render danh sách ảnh nổi theo sheet đang chọn.
   - `components/InsertImageDialog.tsx`: Hộp thoại tải ảnh từ máy tính hoặc dán link URL.
2. Tạo module `apps/sheets/src/modules/comments`:
   - `types/comments.types.ts`: `SheetCommentThread`, `SheetCommentItem`.
   - `components/CellCommentIndicator.tsx`: Chỉ báo ô có bình luận trên canvas.
   - `components/CellCommentPopover.tsx`: Popover xem và viết bình luận / trả lời trên ô.
   - `components/CommentsSidebar.tsx`: Sidebar liệt kê toàn bộ bình luận trong bảng tính.
3. Tích hợp Toolbar (`InsertTools.tsx`), Context Menu (`SheetContextMenu.tsx`) và lưu trữ vào IndexedDB / XLSX metadata.
