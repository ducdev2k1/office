---
phase: 4
title: 'Collaborator UI Components'
status: completed
priority: P1
effort: '4h'
dependencies: [3]
---

# Phase 4: Collaborator UI Components (Header Avatars & Connection Status)

## Overview

Xây dựng các thành phần giao diện người dùng hiển thị trạng thái cộng tác: Stack avatar những người đang trực tuyến trên thanh Header, Badge hiển thị trạng thái kết nối mạng (Connected / Syncing / Offline) và Popover chọn nhanh thông tin cá nhân (đổi tên hiển thị, đổi màu con trỏ) với đầy đủ cơ chế lọc mã độc XSS.

## Requirements

### Functional

- **CollaboratorAvatarStack**:
  - Hiển thị danh sách các user đang online trong phòng lấy từ `useCollabAwareness`.
  - Tối đa hiển thị 4 avatar chồng nhau (overlapping avatars với viền border nền).
  - Nếu số lượng > 4, hiển thị thêm badge `+N` (bấm vào mở danh sách đầy đủ qua Dropdown).
  - Mỗi avatar hiển thị chữ cái viết tắt (initials) hoặc ảnh, viền màu con trỏ của user đó.
  - Dùng `Tooltip` từ `@office/ui-kit` (tuyệt đối không dùng thuộc tính HTML `title`) hiển thị tên người dùng và vai trò khi rê chuột.
- **CollabConnectionBadge**:
  - Trạng thái `Connected` (Đã kết nối): Chấm xanh lá cây kèm tooltip "Đã kết nối trực tiếp".
  - Trạng thái `Connecting` (Đang kết nối): Chấm vàng nhấp nháy (`animate-pulse`) kèm tooltip "Đang đồng bộ...".
  - Trạng thái `Disconnected` (Ngoại tuyến): Chấm màu xám kèm tooltip "Chế độ ngoại tuyến (sẽ đồng bộ khi có mạng)".
- **CollabUserProfilePopover**:
  - Cho phép người dùng bấm vào Avatar của mình trên Header để đổi tên hiển thị và chọn màu con trỏ trong danh sách màu an toàn.
  - Sanitize tên nhập vào (chặn thẻ HTML và script), validate mã màu HEX trước khi lưu vào `localStorage` (`onemail_collab_profile`).
- **Đa ngôn ngữ (i18n)**:
  - Bổ sung đầy đủ các chuỗi thông báo và nhãn giao diện vào `docs.json` cho cả 2 ngôn ngữ `vi` và `en`.

### Non-functional

- Dùng utility classes Tailwind CSS + Base UI components từ `@office/ui-kit`.
- Đảm bảo animation mượt mà, không giật layout (layout shift) khi có người dùng mới vào/ra phòng.
- Tuân thủ file suffix convention (`.tsx`, `.hook.ts`, `.types.ts`).

## Architecture

```text
apps/docs/src/
└── modules/
    ├── collab/
    │   ├── components/
    │   │   ├── CollaboratorAvatarStack.tsx   # Stack avatar online users with Tooltips
    │   │   ├── CollabConnectionBadge.tsx     # Semantic connection state badge
    │   │   └── CollabUserProfilePopover.tsx  # Secure profile edit popover
    │   ├── hooks/
    │   │   └── useCurrentUserProfile.ts      # Local profile manager with sanitization
    │   └── index.ts                          # Collab module exports
    └── header/
        └── components/
            └── Header.tsx                    # Integrated Header with Collab UI
```

## Related Code Files

- Created: `apps/docs/src/modules/collab/components/CollaboratorAvatarStack.tsx`
- Created: `apps/docs/src/modules/collab/components/CollabConnectionBadge.tsx`
- Created: `apps/docs/src/modules/collab/components/CollabUserProfilePopover.tsx`
- Created: `apps/docs/src/modules/collab/hooks/useCurrentUserProfile.ts`
- Created: `apps/docs/src/modules/collab/index.ts`
- Modified: `apps/docs/src/modules/header/components/Header.tsx`
- Modified: `packages/i18n/src/locales/vi/docs.json`
- Modified: `packages/i18n/src/locales/en/docs.json`

## Implementation Steps

1. **Thêm translation keys vào `@office/i18n`**:
   - Keys: `collab.connected`, `collab.connecting`, `collab.offline`, `collab.editProfile`, `collab.yourName`, `collab.cursorColor`, `collab.moreUsers`, `collab.save`, `collab.onlineCollaborators`, `collab.you`.
2. **Viết hook `useCurrentUserProfile.ts`**:
   - Quản lý profile người dùng hiện tại (tạo ngẫu nhiên lần đầu, hỗ trợ cập nhật và lưu trữ an toàn vào `localStorage`).
3. **Phát triển `CollabConnectionBadge.tsx`**:
   - Nhận prop `status: CollabStatus`. Render badge trạng thái chuẩn màu sắc semantic.
4. **Phát triển `CollaboratorAvatarStack.tsx`**:
   - Nhận prop `collaborators: CollabUser[]`. Render danh sách avatar với animation Tailwind nhẹ nhàng và `Tooltip`.
5. **Phát triển `CollabUserProfilePopover.tsx`**:
   - Form nhỏ cho phép nhập tên, bảng chọn màu tròn (color swatches), nút lưu.
6. **Tích hợp vào `Header.tsx`**:
   - Thay thế nút avatar cứng bằng `CollaboratorAvatarStack` + `CollabConnectionBadge` + `CollabUserProfilePopover` + Nút Share copy link.

## Success Criteria

- [x] Header hiển thị đầy đủ avatar của các thành viên đang cùng mở tài liệu.
- [x] Rê chuột vào từng avatar hiển thị tooltip với tên tương ứng.
- [x] Bấm đổi tên hoặc đổi màu con trỏ: con trỏ của người đó trên màn hình của client khác đổi màu và tên tức thì mà không gây lỗi XSS.
- [x] Badge hiển thị chính xác trạng thái kết nối khi bật/tắt server.
- [x] Cả 2 ngôn ngữ VI và EN đều hiển thị chuẩn xác không thiếu key.

## Risk Assessment

- **Avatar Stack tràn màn hình trên thiết bị nhỏ**:
  - _Giải pháp_: Giới hạn tối đa 3-4 avatar trên màn hình lớn, thu gọn về `+N` badge trên màn hình mobile/tablet.
