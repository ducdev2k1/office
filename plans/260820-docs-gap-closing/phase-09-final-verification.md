# Phase 9: Final verification — fidelity-harness, typecheck, build, tests

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 10h
- Kiểm chứng toàn diện toàn bộ tính năng mới từ Phase 1–8: typecheck, unit tests, build, round-trip fidelity, collab multi-client, print, và không regression tính năng cũ.

## Context

- Tham chiếu: `docs/brainstorm-docs-missing-features.md` mục 8 (success metrics), mục 7 (rủi ro).
- Đã có: `packages/fidelity-harness` (đo round-trip OOXML, chạy CI), `apps/docs` vitest (`pnpm test`), typecheck script.

## Key Insights

- Đây là gate cuối: mọi phase hoàn thành nhưng phải chứng minh không vỡ gì.
- Phạm vi kiểm:
  1. Typecheck + build cả monorepo (turbo).
  2. Unit tests (vitest) hiện có + test mới cho extension mới (pagination, comments, track-changes, math, footnote, toc, section).
  3. Round-trip fidelity: chạy fidelity-harness trên bộ mẫu Lớp A (export .docx Phase 4) — ≥ mức cam kết.
  4. Collab: kịch bản 2 tab cho từng tính năng mới (comments, mention, track changes, TOC, checklist).
  5. Print: in doc có watermark/columns/footnote/section break ra PDF đúng.
  6. Regression: tính năng cũ (pagination, page setup, find-replace, import .docx) vẫn chạy.
- Kiểm thủ công theo checklist (Playwright nếu có thời gian — stretch).

## Requirements

### Functional

- Chạy toàn bộ test + typecheck + build pass.
- Báo cáo kết quả theo mảng A–E trong `docs/` (hoặc plans/260820-docs-gap-closing/reports/).
- Ghi lại các lỗi chưa xử lý + backlog.

### Non-functional

- Không regression tính năng cũ.
- Tài liệu hướng dẫn vận hành mới (nếu cần) cập nhật.

## Related Code Files

- **Run**: `pnpm build` (turbo), `pnpm --filter @office/docs typecheck`, `pnpm --filter @office/docs test`
- **Run**: fidelity-harness (`pnpm --filter fidelity-harness ...`)
- **Create**: `plans/260820-docs-gap-closing/reports/verification-report.md` (kết quả)
- **Modify**: `docs/collab-guide.md` (thêm hướng dẫn kiểm thử tính năng mới)
- **Modify**: `docs/roadmap-web-office.md` (cập nhật trạng thái mốc nếu đạt)

## Implementation Steps

1. Chạy build + typecheck toàn monorepo; sửa lỗi phát sinh.
2. Chạy vitest; viết thêm unit test cho: toc, section, bookmark, math (KaTeX render), footnote numbering, comments store, track-changes store, export docx mapper, import txt/html, markdown.
3. Chạy fidelity-harness trên bộ mẫu Lớp A; đối chiếu số liệu.
4. Thực hiện kịch bản collab 2 tab cho từng tính năng mới (ghi lại kết quả).
5. Kiểm tra print: watermark, columns, footnote, section break, header/footer lẻ/chẵn ra PDF đúng.
6. Regression test các tính năng cũ.
7. Viết verification-report.md.
8. Cập nhật tài liệu (collab-guide, roadmap).

## Todo List

- [ ] Build + typecheck monorepo
- [ ] Unit tests (mới + cũ) pass
- [ ] Fidelity-harness Lớp A
- [ ] Collab 2-tab kịch bản mới
- [ ] Print kiểm tra
- [ ] Regression cũ
- [ ] Verification report

## Success Criteria

- Build/typecheck/test 100% pass.
- Fidelity export .docx đạt mức cam kết (≥95% byte-identical cho doc không sửa; mở lại không lỗi cho doc sửa Lớp A).
- Tất cả kịch bản collab 2 tab pass.
- Không regression tính năng cũ.
- Verification-report có số liệu cụ thể.

## Risk Assessment

| Rủi ro                    | Mitigation                                                                |
| ------------------------- | ------------------------------------------------------------------------- |
| Phát hiện bug ở gate cuối | Sửa theo priority; nếu quá tải → ghi backlog rõ, không giấu               |
| Fidelity không đạt        | Phân tích phần lệch, quay lại Phase 4 mapper; điều chỉnh cam kết có lý do |
| Regression collab         | Chạy kịch bản 2 tab sớm ở từng phase (đã làm), gate này là xác nhận cuối  |

## Security Considerations

- Rà soát input mới (comment, mention, LaTeX, import html) không XSS.
- Không lộ dữ liệu nhạy cảm trong log/report.

## Next Steps

- Chạy `/ck:plan archive` khi hoàn thành.
- Cập nhật roadmap chính thức.
