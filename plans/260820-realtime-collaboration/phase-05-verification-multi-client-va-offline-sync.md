---
phase: 5
title: 'Verification Multi-client va Offline Sync'
status: completed
priority: P1
effort: '4h'
dependencies: [4]
---

# Phase 5: Verification Multi-client & Offline Sync

## Overview

Thực hiện kiểm thử toàn diện tính năng cộng tác thời gian thực trên môi trường đa client, đa tab, kiểm tra độ chính xác của cơ chế hội tụ CRDT (conflict-free resolution), kiểm tra độ bền vững dữ liệu khi mất kết nối mạng và phục hồi, kiểm tra chống rò rỉ socket và kiểm tra typecheck và build toàn bộ monorepo.

## Requirements

### Test Scenarios

1. **Scenario 1: Đồng bộ cơ bản giữa 2 tab (Concurrent Editing mà không lặp `setContent`)**:
   - Mở cùng 1 tài liệu trên Tab A và Tab B.
   - Gõ nội dung trên Tab A -> Xác nhận hiển thị ngay lập tức trên Tab B với độ trễ < 100ms.
   - Gõ đồng thời 2 đoạn văn bản khác nhau ở 2 tab -> Xác nhận nội dung hội tụ đầy đủ trên cả 2 tab không bị mất chữ hay bị ghi đè văn bản.
2. **Scenario 2: Remote Cursors, Selections & XSS Resistance**:
   - Di chuyển con trỏ và bôi đen (select) một đoạn text trên Tab A.
   - Đổi tên chứa thẻ HTML `<script>` hoặc mã màu bất thường trên Tab A -> Xác nhận Tab B render an toàn dưới dạng text thuần, không bị XSS.
3. **Scenario 3: Offline Editing & Reconnection (Độ bền vững)**:
   - Tắt WebSocket server (hoặc chuyển chế độ offline).
   - Tiếp tục gõ sửa tài liệu trên Tab A (lưu tức thì vào IndexedDB).
   - Bật lại WebSocket server -> Xác nhận dữ liệu offline từ Tab A được đồng bộ tự động lên Server và phản ánh sang Tab B.
4. **Scenario 4: Server Persistence & URL Share Link**:
   - Mở 1 link tài liệu mới chưa có trong máy cục bộ `http://localhost:5173/edit/doc-shared-xyz`.
   - Xác nhận client không bị chuyển hướng về `doc-roadmap` mà kết nối trực tiếp vào phòng chia sẻ.
   - Tắt hoàn toàn server và client -> Bật lại server và mở lại tài liệu -> Xác nhận toàn bộ nội dung còn nguyên vẹn trong SQLite.
5. **Scenario 5: React 19 StrictMode & Memory Leak Check**:
   - Kiểm tra console trong môi trường Dev (StrictMode bật): không có cảnh báo `DatabaseClosedError` hoặc socket connection nhân đôi nhờ Reference Counting.
6. **Scenario 6: Monorepo Quality Gate**:
   - Chạy `pnpm typecheck` trên toàn bộ monorepo (0 error).
   - Chạy `pnpm lint` trên toàn bộ monorepo (0 error).
   - Chạy `pnpm test` thành công cho tất cả packages và apps (100% pass).
   - Chạy `pnpm build` thành công cho tất cả packages và apps.

## Related Code Files

- Created: `docs/collab-guide.md` (Hướng dẫn chạy server & kiểm thử)
- Created: `packages/collab-core/src/__tests__/color.utils.test.ts`
- Created: `packages/collab-core/src/__tests__/sanitize.utils.test.ts`

## Implementation Steps

1. **Viết tài liệu hướng dẫn `docs/collab-guide.md`**:
   - Hướng dẫn cấu hình cổng, biến môi trường, các câu lệnh khởi động `pnpm dev` và `pnpm dev:collab`.
   - Hướng dẫn các bước test đa tab cho QA/Developer.
2. **Chạy kiểm thử thủ công đa trình duyệt**:
   - Mở Google Chrome và Firefox/ẩn danh để kiểm tra độc lập profile và session.
3. **Kiểm tra Undo/Redo Isolation**:
   - User 1 gõ `A`, User 2 gõ `B`.
   - User 1 ấn `Ctrl+Z` -> Chỉ chữ `A` bị xoá, chữ `B` của User 2 vẫn giữ nguyên.
4. **Chạy Kiểm tra Toàn Diện Hệ Thống**:
   - `pnpm typecheck` (17/17 packages pass)
   - `pnpm test` (35 tests docs + 7 tests collab-core + pptx + xlsx + sheets pass 100%)
   - `pnpm build` (toàn bộ dist artifacts build thành công)

## Success Criteria

- [x] Tất cả 6 Test Scenarios đều đạt kết quả PASS.
- [x] Không có hiện tượng ghost cursor hoặc layout thrashing phân trang khi gõ đồng thời.
- [x] `pnpm typecheck` và `pnpm build` hoàn tất 100% không cảnh báo hoặc lỗi.

## Risk Assessment

- **Ghost Cursors**: Khi user tắt tab đột ngột, con trỏ có thể tồn tại thêm vài giây.
  - _Giải pháp_: Hocuspocus Awareness tự động dọn dẹp client sau timeout mặc định (30 giây) hoặc khi nhận disconnect event của WebSocket.
