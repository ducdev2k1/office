---
phase: 1
title: 'Setup Hocuspocus Server apps/collab-server'
status: completed
priority: P1
effort: '5h'
dependencies: []
---

# Phase 1: Setup Hocuspocus Server `apps/collab-server`

## Overview

Khởi tạo ứng dụng Node.js standalone `apps/collab-server` trong Monorepo chạy **Hocuspocus Server** để phục vụ làm WebSocket gateway đồng bộ Yjs CRDT updates và lưu trữ dữ liệu bền vững bằng SQLite với đầy đủ các chốt an toàn bảo mật, xác thực và quản lý tải.

## Requirements

### Functional

- Chạy WebSocket server Hocuspocus trên port cấu hình (mặc định `1234` hoặc từ biến môi trường `PORT` / `COLLAB_PORT`).
- **Room Validation**: Kiểm tra tên phòng hợp lệ qua regex pattern `^doc-[a-zA-Z0-9_-]{1,64}$`, từ chối kết nối chứa ký tự đặc biệt, path traversal hoặc chuỗi độc hại.
- **SQLite Persistence**: Lưu trữ trạng thái Y.Doc nhị phân vào SQLite (`.data/collab.sqlite`) qua `better-sqlite3` và `@hocuspocus/extension-sqlite` (hoặc custom database hook), đảm bảo dữ liệu không bị mất khi restart server.
- **Server-Side Initial Bootstrap**: Trong hook `onLoadDocument`, nếu tài liệu trong SQLite chưa có dữ liệu, server khởi tạo Y.Doc với cấu trúc mẫu ban đầu để ngăn chặn race condition từ client.
- **Authentication Hook (`onAuthenticate`)**:
  - Xác thực token/chữ ký từ connection payload.
  - Từ chối kết nối không hợp lệ với mã lỗi `4403 Forbidden`.
  - Gán thông tin user đã xác thực vào `connection.context`.
- **Payload & Rate Limiting**:
  - Giới hạn kích thước payload WebSocket tối đa: `maxPayloadSize: 5 * 1024 * 1024` (5MB).
  - Debounce ghi đĩa SQLite (`debounce: 2000`, `maxDebounce: 10000`) để giảm tải I/O.
- **Logging sự kiện**: Client kết nối, ngắt kết nối, lưu tài liệu, cảnh báo lỗi.

### Non-functional

- Cấu hình chạy song song mượt mà qua script Turborepo `pnpm dev:collab` hoặc `pnpm dev`.
- Tuân thủ quy chuẩn TypeScript, ES7+, arrow functions, const, giới hạn ≤ 400 dòng/file.

## Architecture

```text
apps/collab-server/
├── package.json
├── tsconfig.json
└── src/
    ├── config/
    │   └── server.config.ts        # Port, storage path, payload limits, auth secret
    ├── hooks/
    │   ├── auth.hook.ts            # onAuthenticate, token verification & room validator
    │   └── persistence.hook.ts     # onLoadDocument (server bootstrap) & onStoreDocument
    └── index.ts                    # Server initialization & entrypoint
```

## Related Code Files

- Created: `apps/collab-server/package.json`
- Created: `apps/collab-server/tsconfig.json`
- Created: `apps/collab-server/src/config/server.config.ts`
- Created: `apps/collab-server/src/hooks/auth.hook.ts`
- Created: `apps/collab-server/src/hooks/persistence.hook.ts`
- Created: `apps/collab-server/src/index.ts`
- Modified: `package.json` (thêm script `dev:collab`)

## Implementation Steps

1. **Khởi tạo thư mục và `package.json` cho `apps/collab-server`**:
   - Dependencies: `@hocuspocus/server`, `@hocuspocus/extension-sqlite`, `better-sqlite3`, `dotenv`, `ws`, `yjs`.
   - DevDependencies: `@types/better-sqlite3`, `@types/ws`, `@types/node`, `tsx`, `typescript`.
2. **Viết cấu hình `server.config.ts`**:
   - Port: `process.env.COLLAB_PORT ?? 1234`.
   - Database Path: `.data/collab.sqlite` (tự động tạo thư mục `.data/` nếu chưa có).
   - `maxPayloadSize: 5242880` (5MB).
   - Secret key cho token verification.
3. **Cài đặt Authentication & Room Validation (`auth.hook.ts`)**:
   - Kiểm tra `documentName` bằng regex `^doc-[a-zA-Z0-9_-]{1,64}$`.
   - Validate auth payload/token, gán user identity đã sanitize vào context.
4. **Cài đặt Persistence & Bootstrap Hook (`persistence.hook.ts`)**:
   - `onLoadDocument`: Truy vấn SQLite; nếu bản ghi rỗng, khởi tạo document structure cơ bản (server SSOT).
   - `onStoreDocument`: Ghi nhị phân Y.Doc update vào SQLite với cơ chế debounce.
5. **Cài đặt Server Entrypoint (`index.ts`)**:
   - Khởi tạo `Server.configure({ port, debounce, maxDebounce, beforeHandleMessage, hooks })` và lắng nghe sự kiện.
6. **Cấu hình Root Scripts**:
   - Thêm `"dev:collab": "pnpm --filter @office/collab-server dev"` vào root `package.json`.

## Success Criteria

- [x] `pnpm --filter @office/collab-server dev` khởi động server thành công không lỗi `better-sqlite3`.
- [x] Server từ chối kết nối có room name sai định dạng hoặc token không hợp lệ.
- [x] Gửi payload lớn > 5MB bị server từ chối an toàn mà không làm sập tiến trình Node.js.
- [x] Tắt và bật lại server, dữ liệu đã lưu trong SQLite không bị mất.
- [x] `pnpm --filter @office/collab-server typecheck` vượt qua không lỗi.

## Risk Assessment

- **Xung đột Port**: Port `1234` bị chiếm dụng.
  - _Giải pháp_: Cho phép fallback qua biến môi trường `PORT` / `COLLAB_PORT` và log rõ ràng.
- **SQLite Concurrency**: Nhiều connection cùng ghi đồng thời.
  - _Giải pháp_: `better-sqlite3` kết hợp WAL mode (`PRAGMA journal_mode = WAL;`) và debounce của Hocuspocus.
