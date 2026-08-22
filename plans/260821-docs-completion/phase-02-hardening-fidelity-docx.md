# Phase 2: Hardening fidelity export .docx

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 40h
- Nâng chất lượng export .docx đo được qua `packages/fidelity-harness`: các element class còn mất/sai khi mở lại bằng Word. Đây là mảng D trong brainstorm — "lỗ hổng chiến lược", mốc M4 đã có nền (ooxml-core unpack/repack + docx mapper/patcher), nay hardening.

## Context

- Kiến trúc hiện tại: preserve-and-patch — file .docx gốc import giữ byte trong `docx-sources`; export doc từ file gốc → patch `document.xml`; doc mới → sinh từ template (`docx` npm MIT).
- Đã có: `packages/ooxml-core` (ZIP byte-exact, Content_Types), `packages/docx-io` (HTML AST ↔ OOXML ML, roundtrip test pass), `packages/fidelity-harness` (đo % text fidelity).
- Ràng buộc: chỉ OSS MIT/Apache-2.0; giữ nguyên tắc brainstorm mục 5 — mọi node/mark mới phải parseHTML/renderHTML chuẩn, không phá round-trip.

## Key Insights

- Fidelity đo theo từng element class (heading, list, table, image, link, highlight/color, alignment, header/footer, page break, footnote, math...) — phải có ma trận đo riêng từng class thay vì 1 con số % text chung chung.
- Text fidelity 100% không đủ: cần đo cả format fidelity (bold/italic/size/color giữ đúng khi mở bằng Word).
- Patch `document.xml` theo anchor byte an toàn hơn regenerate toàn phần — ưu tiên patch cho doc có nguồn gốc .docx.
- Word mở lỗi thường do: namespace thiếu, relationship orphan, Content_Types thiếu override — ooxml-core đã có nền kiểm tra các lỗi này.

## Requirements

### Functional

- Ma trận fidelity: mỗi element class có case test .docx mẫu → export → mở lại bằng Word/LibreOffice không lỗi, format giữ đúng.
- Export doc mới (không có nguồn gốc .docx): sinh file hợp lệ, mở bằng Word không warning repair.
- Bảng: giữ số cột/dòng, merge cell, border cơ bản, header row.
- Ảnh: giữ kích thước tương đối, vị trí inline.
- Header/footer + số trang: giữ nội dung và vị trí.
- Footnote/math (KaTeX): ít nhất không làm hỏng file (fallback text nếu chưa map được OOXML).

### Non-functional

- Mỗi nâng cấp fidelity phải qua unit test docx-io + harness trước khi merge.
- Không tăng dung lượng file xuất quá 2x file gốc cùng nội dung.

## Related Code Files

- **Modify**: `packages/docx-io/src/*` (mapper HTML→OOXML từng element class)
- **Modify**: `packages/fidelity-harness/src/docx-fidelity.ts` (thêm đo format fidelity + ma trận class)
- **Create**: `packages/fidelity-harness/src/fixtures/*.docx` (case mẫu từng element class)
- **Modify**: `packages/ooxml-core/src/*` (validate relationship/Content_Types sau repack)
- **Read**: `apps/docs/src/modules/editor/hooks/useDocsEditor.ts` (danh sách extension thực tế để đối chiếu ma trận)

## Implementation Steps

1. Audit hiện trạng: chạy harness trên bộ fixture → bảng % fidelity từng element class (baseline).
2. Xếp hạng class yếu nhất theo tần suất dùng thực tế (văn bản hành chính VN: heading/list/table/align/color là P0).
3. Sửa mapper từng class: viết failing test trước → fix → harness xanh.
4. Bổ sung validate post-repack (relationship, Content_Types, namespace) trong ooxml-core.
5. Fixture cho footnote/math/columns — chốt mức chấp nhận được (fallback text) với owner nếu map OOXML phức tạp.
6. Chạy lại full harness → so baseline, ghi kết quả vào reports/.

## Acceptance Criteria

- [ ] Ma trận fidelity từng element class có số liệu before/after.
- [ ] File export mở bằng Word KHÔNG hiện dialog repair trong toàn bộ fixture set.
- [ ] Unit test docx-io + harness pass 100%.
- [ ] Build + typecheck pass.
