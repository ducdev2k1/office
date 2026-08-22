# Phase 3: Perf tài liệu lớn (50+ trang)

## Overview

- **Priority**: P1 | **Status**: done | **Effort**: 30h
- Đảm bảo tài liệu 50+ trang gõ mượt, scroll không jank, mở file không treo. Pagination engine (page view kiểu Google Docs) là nghi phạm chính: mỗi lần gõ reflow toàn document sẽ lag khi doc lớn.

## Context

- App dùng pagination tự build (page view, page break, header/footer + số trang, ruler tương tác) — unit test có "Pagination engine, Page tokens".
- Cảnh báo brainstorm: Columns từng bị hoãn vì "xung đột pagination reflow" → chứng tỏ reflow là điểm nóng kiến trúc.
- Ràng buộc: KHÔNG phá pagination hiện có, KHÔNG đổi schema document (ảnh hưởng collab Yjs + round-trip).

## Key Insights

- Chiến lược tối ưu ProseMirror/pagination chuẩn:
  1. **Đo trước, sửa sau**: React Profiler + Performance panel trên doc 50/100/200 trang — tìm đúng điểm nóng (đừng đoán).
  2. Reflow cục bộ: chỉ repaginate các page chứa thay đổi (+ page kế nếu tràn), không rebuild toàn bộ page stack.
  3. Debounce/throttle measure pass (đo chiều cao content để tách page) — tách khỏi transaction render.
  4. `requestIdleCallback`/`scheduler.postTask` cho việc tính số trang, header/footer render.
  5. Virtualize page stack ngoài viewport nếu DOM node quá lớn (chỉ render placeholder cho page xa).
- Collab: mọi tối ưu phải giữ nguyên thứ tự apply transaction của Yjs — không được batch làm mất sync.
- Đo jank khách quan: `performance.measure` + long task count (`PerformanceObserver` longtask) trước/sau.

## Requirements

### Functional

- Doc 100 trang text thuần: gõ tại giữa tài liệu không thấy delay cảm nhận được (<50ms perceived), scroll mượt.
- Doc 50 trang nhiều bảng + ảnh: mở <3s, tương tác bình thường.
- Pagination vẫn chính xác 100% sau tối ưu (không lệch trang, không mất header/footer).
- Find & Replace trên doc lớn vẫn hoạt động đúng.

### Non-functional

- Không tăng memory usage quá 1.5x so với hiện tại ở cùng doc.
- Giữ unit test pagination engine pass; thêm test regression cho case repaginate cục bộ.

## Related Code Files

- **Read/Modify**: pagination engine trong `apps/docs/src/modules/editor/*` (PageStack.tsx, EditorCanvas.tsx, hooks liên quan)
- **Modify**: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts` (transaction handling nếu cần debounce measure)
- **Create**: `apps/docs/src/dev/perf-utils.ts` hoặc script dev tạo doc mẫu 50/100/200 trang (đã có thư mục `src/dev`)
- **Modify**: test pagination engine (thêm case regression)

## Implementation Steps

1. Script dev sinh doc mẫu 3 mức (50/100/200 trang, mix text/bảng/ảnh) vào `src/dev`.
2. Baseline: đo long task count, thời gian gõ 1 ký tự giữa doc, thời gian mở file — ghi bảng số liệu.
3. Tối ưu theo thứ tự rủi ro tăng dần: debounce measure → repaginate cục bộ → virtualize page stack (chỉ làm bước sau nếu bước trước chưa đạt mục tiêu).
4. Sau mỗi bước: chạy lại đo + unit test pagination + test thủ công collab 2 tab.
5. Ghi kết quả before/after vào reports/.

## Acceptance Criteria

- [ ] Bảng số liệu before/after (long task, input latency, open time) cho 3 mức doc mẫu.
- [ ] Gõ tại giữa doc 100 trang mượt (cảm nhận chủ quan owner xác nhận).
- [ ] Unit test pagination + collab pass; test thủ công 2 tab đồng bộ đúng.
- [ ] Build + typecheck pass.
