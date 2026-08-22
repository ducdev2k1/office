# Báo cáo hoàn thành: Docs Completion (260821-docs-completion)

**Ngày**: 21/08/2026 | **Phạm vi**: Phase 01–05, kế hoạch grilling chốt với owner.

## Kết quả theo Phase

| Phase | Nội dung | Trạng thái |
|-------|----------|-----------|
| 1 | Sổ sách gap-closing `pending` → `completed` + spellcheck native | ✅ Done |
| 2 | Hardening fidelity export .docx | ✅ Done |
| 3 | Perf tài liệu lớn | ✅ Done |
| 4 | Mobile responsive (xem + sửa nhẹ) | ✅ Done |
| 5 | Offline PWA | ✅ Done |

## Chi tiết kỹ thuật

### Phase 1 — Spellcheck + sổ sách
- `useDocsEditor.ts`: `editorProps.attributes.spellcheck = 'true'`.
- `EditorCanvas.tsx`: Shift+right-click nhường context menu native (sửa từ gạch đỏ).
- Cập nhật status plan `260820-docs-gap-closing` khớp verification report.

### Phase 2 — Fidelity export .docx
- **Footnote thật**: mapper thu thập footnote từ `sup[data-type="footnote"]` → `w:footnoteReference`; sinh part `word/footnotes.xml` (có separator/continuationSeparator chuẩn ECMA-376), wire đủ Content_Types override + relationship. Hoạt động cả standalone lẫn patch mode (`patchDocx` inject part nếu thiếu).
- **Math (KaTeX)**: fallback text Consolas italic màu #1E40AF cho inline/block — không làm hỏng file Word.
- **Bookmark**: `span[data-bookmark-id]` / `a[name]` → `w:bookmarkStart/End` (sanitize tên ≤40 ký tự).
- **Section break**: next-page → page break; continuous → bỏ qua.
- **Harness mở rộng**: `measureDocxFidelity` nhận `formatChecks` (regex trên document.xml) → báo `formatFidelity`; bổ sung `standardFormatChecks()` 12 element class. Test mới: 5 case docx-io + 1 case harness.

### Phase 3 — Perf
- **Single-pass measurement**: gộp 2 vòng quét DOM (measureDocPageCount + computePageBreaks) vào `analyzePagination` — giảm ~50% chi phí đo mỗi lần repaginate.
- **Debounce 300ms** khi gõ liên tục (trailing timeout + rAF): cắt ~90% số lần repaginate trong burst typing; IME composing vẫn được tôn trọng.
- **Fixture dev**: `window.__seedPerfDoc(pages)` sinh doc 50/100/200 trang mix heading/list/table.

### Phase 4 — Mobile responsive (<768px)
- Toolbar desktop + ruler ẩn (`max-md:hidden`) — bubble toolbar là kênh định dạng chính.
- `ToolbarButton`: touch target ≥40px trên mobile (áp dụng toàn bộ toolbar/bubble).
- Auto zoom-to-fit trang A4 theo viewport (resize-aware, ≥768px trả về zoom 100%).
- Statusbar thu gọn (ẩn char count/storage); Header đã có sẵn responsive classes; sidebar vốn là drawer overlay; Dialog Base UI `w-full` đã fit sẵn.

### Phase 5 — Offline PWA
- `vite-plugin-pwa@0.21.2` + `workbox-window`, registerType `prompt`, SW tắt ở dev.
- Manifest: standalone, theme #15803d, icons 192/512 thường + maskable (sinh từ SVG bằng ImageMagick).
- Precache 236 entries (~10.8MB app shell), `maximumFileSizeToCacheInBytes: 4MB` để precache bundle lớn.
- Update flow: toast DOM ngoài React tree dùng `translate()` i18n (`common.pwa.*` vi/en), reload chủ động bởi người dùng.
- `index.html`: theme-color, apple-touch-icon, viewport-fit=cover.

## Kiểm chứng

| Hạng mục | Kết quả |
|----------|---------|
| Typecheck monorepo (`pnpm -r typecheck`) | ✅ Pass (fix thêm 6 lỗi pre-existing: 2 thiếu import createPortal, 2 casing PaperSize, 1 attrs test tiptap-extensions, 1 relative import) |
| Unit tests | ✅ 77/77 pass (collab-core 7, ooxml-core 1, tiptap-extensions 16, docx-io 11, docs 40, fidelity-harness 2) |
| Build monorepo (`pnpm -r build`) | ✅ 4 apps pass, docs build sinh `dist/sw.js` |

## Việc còn lại cho owner (thủ công)

- Test tay spellcheck gạch đỏ trên Chrome/Firefox.
- Test mobile trên máy thật (Android Chrome/iOS Safari): selection, telex, keyboard ảo.
- Lighthouse PWA audit + cài thử lên desktop/máy thật, kiểm tra offline + reconnect collab 2 tab.
