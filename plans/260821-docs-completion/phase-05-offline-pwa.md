# Phase 5: Offline PWA

## Overview

- **Priority**: P2 | **Status**: pending | **Effort**: 15h
- Biến docs app thành PWA cài đặt được: mở không cần mạng, soạn thảo offline hoàn toàn. Hợp tự nhiên với kiến trúc local-first (IndexedDB + Yjs offline sync sẵn có).

## Context

- Storage đã là IndexedDB phân vùng; collab Hocuspocus + Yjs có offline sync (dữ liệu merge khi reconnect).
- Quyết định grilling 21/08: PWA vào scope (owner ủy quyền), các mục pageless/voice/chips/shapes/translate giữ hoãn.
- Vite build → dùng `vite-plugin-pwa` (MIT) thay vì tự viết service worker.

## Key Insights

- Chiến lược cache:
  - App shell (HTML/CSS/JS/fonts): **precache** toàn bộ qua Workbox — cài xong là chạy offline.
  - Không có API data cần runtime caching (mọi dữ liệu doc nằm IndexedDB) → đơn giản hơn PWA thông thường.
  - WebSocket Hocuspocus: KHÔNG cache — để Yjs tự quản offline queue.
- Cập nhật app: `registerType: 'prompt'` + toast "Có phiên bản mới — tải lại?" tránh giật ngang tay người dùng đang soạn.
- Manifest: standalone display, icon maskable, theme color khớp dark/light.
- Cẩn thận: dev mode KHÔNG bật SW (tránh cache phá HMR).

## Requirements

### Functional

- Lighthouse PWA audit: installable + offline pass.
- Cài lên desktop Chrome/Edge + Android: mở window riêng, chạy không mạng, soạn/lưu bình thường qua IndexedDB.
- Online lại → Yjs reconnect tự merge (đã có, chỉ xác nhận không vỡ).
- Có bản cập nhật → hiện prompt, reload chủ động bởi người dùng.

### Non-functional

- Precache chỉ chứa asset build (không bloat); manifest + icons đúng chuẩn Lighthouse.
- Dev experience không đổi (SW tắt ở dev).

## Related Code Files

- **Modify**: `apps/docs/vite.config.ts` (thêm `vite-plugin-pwa`)
- **Modify**: `apps/docs/package.json` (dependency `vite-plugin-pwa`)
- **Create**: `apps/docs/src/dev/pwa-register.ts` hoặc thêm trong `main.tsx` (register SW + update prompt)
- **Create**: `apps/docs/public/icons/*` (maskable icons 192/512)
- **Modify**: `apps/docs/index.html` (theme-color, apple touch meta)
- **Modify**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json` (text prompt cập nhật)

## Implementation Steps

1. Thêm `vite-plugin-pwa`, cấu hình manifest (name, icons, display standalone, theme color).
2. Precache toàn bộ asset build; tắt SW ở dev (`devOptions.enabled: false`).
3. Update flow: `registerType: 'prompt'` + toast xác nhận reload (ui-kit Toast + i18n).
4. Icons maskable 192/512 từ logo hiện có.
5. Kiểm chứng: Lighthouse PWA ≥ pass; test offline thật (DevTools Offline + máy thật máy bay mode): tạo/sửa doc, đóng mở lại app, dữ liệu còn.
6. Test collab 2 tab online→offline→online: merge đúng, không mất chữ.

## Acceptance Criteria

- [ ] Lighthouse: Installable + Offline ready.
- [ ] Máy thật: cài được, soạn thảo offline, mở lại dữ liệu nguyên vẹn.
- [ ] Reconnect sau offline: Yjs merge đúng (2 tab test).
- [ ] Build + typecheck pass; dev mode không bị SW can thiệp.
