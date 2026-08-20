# Hướng Dẫn Vận Hành & Kiểm Thử Cộng Tác Thời Gian Thực (Realtime Collaboration)

Tài liệu hướng dẫn khởi chạy máy chủ Hocuspocus Server, package `@office/collab-core` và tích hợp TipTap Collaboration trên OneMail Docs.

---

## 1. Kiến Trúc Tổng Quan

Hệ thống Realtime Collaboration vận hành trên mô hình **CRDT (Conflict-Free Replicated Data Type)** qua thư viện Yjs và WebSocket Gateway Hocuspocus Server:

```text
  [Trình duyệt 1 (Tab A)] <──WebSocket──> [apps/collab-server] <──WebSocket──> [Trình duyệt 2 (Tab B)]
          │                                      │                                      │
   (Y.Doc / IndexedDB)                  (SQLite Persistence)                   (Y.Doc / IndexedDB)
```

- **Server**: Node.js WebSocket Hocuspocus Server lưu trữ dữ liệu bền vững nhị phân vào SQLite (`.data/collab.sqlite`).
- **Client**: Quản lý phiên qua Session Registry với Reference Counting và delayed teardown (chống lỗi rò rỉ socket trên React 19 StrictMode).
- **TipTap**: Tích hợp `@tiptap/extension-collaboration` và `@tiptap/extension-collaboration-cursor`.

---

## 2. Các Lệnh Khởi Chạy

### 2.1. Khởi chạy toàn bộ hệ thống (Web Docs + Collab Server)

```bash
pnpm dev
```

### 2.2. Khởi chạy riêng lẻ từng dịch vụ

- **Chỉ chạy Collab Server**:

  ```bash
  pnpm dev:collab
  # hoặc: pnpm --filter @office/collab-server dev
  ```

  Mặc định lắng nghe tại: `ws://localhost:1234`.

- **Chỉ chạy Web Docs**:
  ```bash
  pnpm dev:docs
  # hoặc: pnpm --filter @office/docs dev
  ```
  Truy cập giao diện tại: `http://localhost:5173`.

---

## 3. Các Biến Môi Trường (Environment Variables)

Có thể cấu hình qua file `.env` hoặc truyền trực tiếp khi khởi động:

| Biến môi trường        | Mặc định                      | Mô tả                               |
| ---------------------- | ----------------------------- | ----------------------------------- |
| `COLLAB_PORT` / `PORT` | `1234`                        | Cổng WebSocket Server lắng nghe     |
| `COLLAB_DB_PATH`       | `.data/collab.sqlite`         | Đường dẫn file cơ sở dữ liệu SQLite |
| `COLLAB_AUTH_SECRET`   | `onemail-collab-local-secret` | Mã bí mật xác thực token            |

---

## 4. Kịch Bản Kiểm Thử (Verification Scenarios)

### Kịch bản 1: Đồng bộ 2 tab / 2 trình duyệt

1. Mở tài liệu bất kỳ trên Tab 1 (`http://localhost:5173/edit/doc-roadmap`).
2. Mở cùng URL trên Tab 2 (hoặc cửa sổ ẩn danh).
3. Gõ văn bản trên Tab 1 -> Tab 2 cập nhật tức thì với con trỏ kèm tên người dùng.
4. Gõ đồng thời trên cả 2 tab -> Dữ liệu tự động hội tụ chính xác mà không bị ghi đè.

### Kịch bản 2: Đổi tên hiển thị & màu con trỏ (An toàn XSS)

1. Bấm vào Avatar của bạn ở góc phải Header -> Popover hiển thị thông tin cá nhân.
2. Nhập tên mới hoặc chọn màu sắc khác từ palette -> Bấm **Lưu thay đổi**.
3. Tab 2 lập tức hiển thị màu viền và tên mới của bạn. Các ký tự HTML nhập vào đều được lọc an toàn.

### Kịch bản 3: Chế độ Ngoại Tuyến (Offline Sync)

1. Tắt tiến trình `collab-server` (`Ctrl + C`).
2. Header chuyển sang chấm xám với tooltip _Chế độ ngoại tuyến_.
3. Tiếp tục gõ văn bản trên Tab 1 (dữ liệu được lưu an toàn vào IndexedDB).
4. Bật lại `collab-server` (`pnpm dev:collab`).
5. Header chuyển lại sang chấm xanh lá cây (_Đã kết nối trực tiếp_) và toàn bộ cập nhật offline được đẩy lên server.

### Kịch bản 4: Mở Link Chia Sẻ (Shared URL Room)

1. Bấm nút **Chia sẻ** trên Header -> Copy liên kết vào bộ nhớ tạm.
2. Mở tab mới với URL bất kỳ dạng `http://localhost:5173/edit/doc-new-room-123`.
3. Hệ thống tạo placeholder an toàn và kết nối trực tiếp vào phòng `doc-new-room-123` mà không bị điều hướng ngược về `doc-roadmap`.
