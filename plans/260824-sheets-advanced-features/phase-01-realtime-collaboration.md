# Phase 1: Realtime Collaboration (Yjs CRDT & Selection Awareness)

Status: Completed
Effort: 14h

## 1. Mục tiêu
- Kết nối `apps/sheets` với hạ tầng WebSocket `apps/collab-server` thông qua `@office/collab-core`.
- Thiết lập đồng bộ Granular CRDT: lưu và sync dữ liệu Workbook (`IWorkbookData`), worksheet cell data (`cellData`), metadata theo `sheetId` trong `Y.Doc`.
- Đồng bộ Awareness thời gian thực: vị trí ô đang chọn (Active Cell / Selection Range), hiển thị viền ô màu và tooltip tên người dùng (Collaborator Selection Boxes).
- Bổ sung UI cộng tác: Avatar Stack, Connection Status Badge, User Profile Popover, Share Dialog trên `SheetsHeader`.

## 2. Công việc chi tiết
1. **Server Configuration**: Cập nhật `apps/collab-server/src/config/server.config.ts` cho phép room `doc-` và `sheet-`.
2. **Sheet Collab Sync Engine**: Tạo `apps/sheets/src/modules/collab/utils/sheetYjsSync.utils.ts` và `types/collab.types.ts`.
3. **Custom Hooks**:
   - `useCurrentUserProfile.ts`: Quản lý danh tính người dùng (tên, màu sắc lưu localStorage).
   - `useCollabSheet.ts`: Quản lý kết nối `useCollabRoom`, lắng nghe thay đổi Univer và cập nhật CRDT 2 chiều.
4. **UI Components**:
   - `CollaboratorAvatarStack.tsx`: Hiển thị danh sách avatar người dùng đang online trên header.
   - `CollabConnectionBadge.tsx`: Trạng thái kết nối (Connected, Connecting, Disconnected).
   - `CollabUserProfilePopover.tsx`: Đổi tên và màu đại diện.
   - `ShareDialog.tsx`: Hộp thoại chia sẻ liên kết phòng làm việc chung.
   - `CollaboratorSelectionOverlay.tsx`: Lớp phủ vẽ khung viền các ô đang được người khác chọn trên Canvas.
5. **Tích hợp Editor**: Gắn vào `SheetsHeader.tsx`, `SheetEditor.tsx`, `EditorPage.tsx`.
