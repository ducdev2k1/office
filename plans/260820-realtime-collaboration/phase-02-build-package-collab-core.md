---
phase: 2
title: 'Build package collab-core'
status: completed
priority: P1
effort: '6h'
dependencies: [1]
---

# Phase 2: Build package `@office/collab-core`

## Overview

Phát triển package `@office/collab-core` đóng gói toàn bộ tầng client kết nối Yjs, bao gồm: quản lý instance `Y.Doc`, kết nối WebSocket qua `HocuspocusProvider`, lưu trữ offline qua `y-indexeddb`, Session Registry kháng lỗi React 19 StrictMode double-mount và bộ React Custom Hooks an toàn.

## Requirements

### Functional

- **Session Registry & Reference Counting**:
  - Quản lý session Y.Doc theo `docId` dạng Singleton/Registry trong bộ nhớ client.
  - Hỗ trợ cơ chế Reference Counting: khi component unmount trong chu kỳ React 19 StrictMode, session không bị `destroy()` ngay lập tức mà duy trì bộ đếm thời gian trễ (~500ms). Nếu component remount lại trước timeout, tái sử dụng kết nối đang có thay vì tạo lại WebSocket mới.
- **Custom Hooks**:
  - `useCollabRoom({ docId, user, serverUrl })`: Khởi tạo room từ Session Registry, tự động đồng bộ Y.Doc với server và local IndexedDB, trả về `{ doc, provider, status, isSynced, isLocalLoaded, error }`.
  - `useCollabAwareness(provider)`: Lắng nghe danh sách `CollaboratorUser[]` đang trực tuyến trong cùng phòng (bao gồm vị trí con trỏ, text selection, user profile đã sanitize).
  - `useCollabStatus(provider)`: Trạng thái kết nối realtime (`connecting` | `connected` | `disconnected`).
- **Data Validation & Sanitization**:
  - `CollabUser`: `{ id: string; name: string; color: string; avatarUrl?: string; initials?: string }`.
  - Validate mã màu `color` bằng regex HEX (`^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`) hoặc gán màu từ palette an toàn.
  - Text-escape trường `name` để ngăn chặn triệt để Stored XSS qua Awareness protocol.
  - Whitelist protocol `https:` cho trường `avatarUrl`.

### Non-functional

- Đảm bảo tính độc lập: chỉ dùng **relative import** bên trong package.
- Viết bằng arrow functions, biến `const`, không vượt quá 400 dòng/file.

## Architecture

```text
packages/collab-core/
├── package.json
├── tsconfig.json
└── src/
    ├── types/
    │   └── collab.types.ts             # Interfaces & state types
    ├── utils/
    │   ├── color.utils.ts              # Palette colors generator & initials helper
    │   └── sanitize.utils.ts           # User profile sanitization & validation
    ├── services/
    │   ├── collabRegistry.service.ts   # Session Registry & Ref-counting (React 19 Safe)
    │   └── collabSession.service.ts    # Y.Doc + HocuspocusProvider lifecycle manager
    ├── hooks/
    │   ├── useCollabRoom.ts            # Primary room hook with offline-first support
    │   ├── useCollabAwareness.ts       # Awareness & presence hook
    │   └── useCollabStatus.ts          # Connection status hook
    ├── __tests__/
    │   ├── color.utils.test.ts         # Unit tests
    │   └── sanitize.utils.test.ts      # Unit tests
    └── index.ts                        # Package public exports
```

## Related Code Files

- Created: `packages/collab-core/src/types/collab.types.ts`
- Created: `packages/collab-core/src/utils/color.utils.ts`
- Created: `packages/collab-core/src/utils/sanitize.utils.ts`
- Created: `packages/collab-core/src/services/collabRegistry.service.ts`
- Created: `packages/collab-core/src/services/collabSession.service.ts`
- Created: `packages/collab-core/src/hooks/useCollabRoom.ts`
- Created: `packages/collab-core/src/hooks/useCollabAwareness.ts`
- Created: `packages/collab-core/src/hooks/useCollabStatus.ts`
- Created: `packages/collab-core/src/__tests__/color.utils.test.ts`
- Created: `packages/collab-core/src/__tests__/sanitize.utils.test.ts`
- Modified: `packages/collab-core/src/index.ts`
- Modified: `packages/collab-core/package.json`

## Implementation Steps

1. **Cập nhật `packages/collab-core/package.json`**:
   - Dependencies: `yjs@^13.6.23`, `@hocuspocus/provider@^2.15.0`, `y-indexeddb@^9.0.12`.
   - PeerDependencies: `react@^19.0.0`, `react-dom@^19.0.0`.
2. **Định nghĩa Types (`collab.types.ts`)**:
   - `CollabUser`, `CollabStatus`, `CollabRoomConfig`, `CollaboratorPresence`, `CollabSessionInstance`.
3. **Viết Helper Sanitization & Color (`sanitize.utils.ts`, `color.utils.ts`)**:
   - `sanitizeCollabUser(user: Partial<CollabUser>): CollabUser`.
   - `getRandomUserColor()`, `getInitials(name)`.
4. **Xây dựng `collabRegistry.service.ts` & `collabSession.service.ts`**:
   - Cài đặt Singleton Registry quản lý Map các session kèm `refCount` và `teardownTimer`.
   - `acquireCollabSession(config)`: Tăng `refCount`, xóa `teardownTimer` nếu có, trả về session.
   - `releaseCollabSession(docId)`: Giảm `refCount`; khi `refCount === 0`, đặt timer 500ms trước khi gọi `session.destroy()`.
5. **Cài đặt React Custom Hooks**:
   - `useCollabRoom`: Tương tác với Registry, theo dõi cờ `isLocalLoaded` từ IndexedDB và `isSynced` từ WebSocket mà không chặn render giao diện khi offline.
   - `useCollabAwareness`: Lắng nghe event `awareness.on('change', ...)` và sanitize toàn bộ remote user payload trước khi đưa vào React state.
   - `useCollabStatus`: Trả về trạng thái kết nối realtime (`connecting` | `connected` | `disconnected`).
6. **Export công khai từ `src/index.ts`**:
   - Export toàn bộ hooks, types, utils và service.

## Success Criteria

- [x] `packages/collab-core` biên dịch sạch sẽ không lỗi TypeScript (`pnpm --filter @office/collab-core typecheck`).
- [x] Không sinh lỗi `DatabaseClosedError` hoặc tạo kết nối socket nhân đôi khi chạy dưới React 19 StrictMode.
- [x] Các payload User Profile độc hại bị sanitize triệt để (100% tests pass).

## Risk Assessment

- **Bộ nhớ đọng khi không release session**:
  - _Giải pháp_: Session Registry tự động dọn dẹp sau timeout 500ms khi `refCount` về 0.
