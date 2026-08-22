# Phase 4: Mobile responsive — xem + sửa nhẹ

## Overview

- **Priority**: P2 | **Status**: done | **Effort**: 25h
- Viewport < 768px: đọc tài liệu thoải mái, sửa nội dung + định dạng nhanh qua bubble toolbar khi bôi đen. KHÔNG full toolbar/menu desktop. Quyết định grilling 21/08: "Sửa nhẹ".

## Context

- Brainstorm Mảng E từng ghi "Mobile/touch: Responsive + tap targets, effort vừa".
- App hiện là desktop-first: toolbar đầy đủ, ruler tương tác, page view pagination cố định chiều rộng A4.
- Đã có sẵn bubble toolbar (Phase 2 gap-closing) — tái dùng cho mobile.

## Key Insights

- Page view A4 cố định ~794px — trên mobile 375px phải scale xuống (zoom-to-fit) hoặc chuyển layout đọc liền mạch. Chọn **scale page xuống vừa màn hình** để giữ đúng pagination + header/footer (không đụng kiến trúc).
- Ruler ẩn trên mobile (không có hover), page setup panel/dialog vẫn mở được nhưng tối ưu touch.
- Bubble toolbar là kênh định dạng chính: bold/italic/underline/color/highlight/link/comment — kiểm tra tap target ≥ 40px.
- Touch selection văn bản trong contenteditable vốn khó — cần test thật trên thiết bị, không tin emulator.
- Keyboard ảo làm viewport nhảy (`visualViewport`) — editor phải giữ caret nhìn thấy khi bàn phím mở.

## Requirements

### Functional

- < 768px: TopBar thu gọn (logo + title + menu chính vào dropdown), sidebar drawer overlay, toolbar desktop ẩn.
- Bôi đen → bubble toolbar hiện, chạm được, đủ các định dạng nhanh.
- Gõ/sửa nội dung bình thường; scroll dọc mượt; page scale vừa khung ngang.
- Dialogs (find & replace, insert link/image, comments...) full-width bottom sheet hoặc fit màn hình.
- Collab: avatar stack thu gọn thành số +1.

### Non-functional

- Không phá layout desktop (breakpoint chặt, chỉ áp dụng < 768px).
- Tap target tối thiểu 40x40px cho mọi control tương tác.
- Không thêm thư viện UI mới — dùng Tailwind responsive + ui-kit hiện có.

## Related Code Files

- **Modify**: `apps/docs/src/modules/toolbar/components/*` (ẩn/thu gọn theo breakpoint)
- **Modify**: `apps/docs/src/modules/sidebar/components/DocsSidebar.tsx` (drawer mode)
- **Modify**: `apps/docs/src/modules/header/components/*` (thu gọn)
- **Modify**: `apps/docs/src/modules/editor/components/BubbleToolbar.tsx` (touch optimize)
- **Modify**: `apps/docs/src/modules/editor/components/PageStack.tsx` / `EditorCanvas.tsx` (scale-to-fit)
- **Modify**: `apps/docs/src/assets/styles/styles.css` (media query nếu cần ngoài utility classes)

## Implementation Steps

1. Audit hiện trạng trên Chrome DevTools mobile emulation (375px, 414px, 768px): liệt kê điểm vỡ layout.
2. Shell trước: TopBar thu gọn + sidebar drawer + ẩn toolbar desktop.
3. Editor: scale-to-fit page + bubble toolbar touch + visualViewport handling.
4. Dialogs về bottom-sheet/fit-width.
5. Test thủ công trên thiết bị Android thật (Chrome) + iOS (Safari) nếu có: selection, gõ tiếng Việt telex, keyboard ảo.
6. Regression desktop: kiểm tra ≥ 1024px không đổi gì.

## Acceptance Criteria

- [ ] 375px: đọc doc thoải mái, sửa + định dạng nhanh được qua bubble toolbar.
- [ ] Desktop ≥ 1024px không thay đổi (so screenshot trước/sau).
- [ ] Test thủ công trên máy thật: gõ tiếng Việt, selection, keyboard ảo OK.
- [ ] Build + typecheck pass.
