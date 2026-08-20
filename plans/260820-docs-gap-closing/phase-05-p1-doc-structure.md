# Phase 5: P1 cấu trúc tài liệu — section break, bookmark, watermark, template gallery, header/footer lẻ/chẵn, folders

## Overview

- **Priority**: P1 | **Status**: done | **Effort**: 40h
- Bổ sung tính năng cấu trúc tài liệu (mảng B): section break, bookmark + link tới bookmark, watermark, template gallery, header/footer khác nhau trang lẻ/chẵn + trang đầu, folder/organize trong sidebar.

## Context

- Tham chiếu: `docs/brainstorm-docs-missing-features.md` mục 3 (bảng B), mục 6 đợt 2.
- Đã có: `pageBreak.extension.ts` (mẫu cho section break), `PageSetup` (paperSize/orientation/margins/header/footer/pageNumber với skipFirstPage), header/footer tokens (`page-tokens.utils.ts`), sidebar (DocsSidebar) + DocRow.

## Key Insights

- Section break khác page break: node tương tự nhưng mang thuộc tính loại (next-page/continuous) + có thể đổi page setup cho section sau (nâng cấp nhỏ).
- Header/footer lẻ/chẵn: mở rộng `PageSetup` thêm `differentOddEven` + `differentFirst`; pagination render header/footer theo page index parity.
- Watermark: render trên `.page` background (absolute text/image, xoay 45°) + CSS print (`@media print` giữ nguyên).
- Bookmark: node atom `bookmark` (id) + link mark hỗ trợ `#bookmarkId`; click scroll tới bookmark.
- Template gallery: `templates: []` đang rỗng — thêm mảng template (docs mẫu) + UI ở HomePage (FileHome đã có `startLabel: templatesTitle`).
- Folders: thêm `parentId` vào `DocRecord` + cây thư mục trong sidebar + UI tạo/di chuyển thư mục (mở nút disabled moveToFolder trong Header).

## Requirements

### Functional

- Section break: chèn (next-page/continuous), hiển thị vạch ngắt, đổi page setup áp dụng từ section.
- Header/footer: toggle different first page + odd/even, render đúng theo từng trang.
- Watermark: thêm/xóa/sửa chữ hoặc ảnh, in ra đúng.
- Bookmark: đặt bookmark tại vị trí chọn, link `#id` nhảy tới.
- Template gallery: trang chọn mẫu (báo cáo, CV, thư, meeting notes) → tạo doc mới từ template.
- Folders: tạo thư mục, di chuyển doc vào, lọc theo thư mục.

### Non-functional

- Tương thích Yjs (section/bookmark là node atomic).
- Không phá pagination hiện tại.
- Watermark chỉ hiển thị ở view paged + print.

## Related Code Files

- **Create**: `packages/tiptap-extensions/src/section/section-break.ts`
- **Create**: `packages/tiptap-extensions/src/bookmark/bookmark.ts` + `bookmark-link.ts`
- **Modify**: `apps/docs/src/types/docs.types.ts` (PageSetup + differentFirst/differentOddEven; DocRecord + parentId)
- **Modify**: `apps/docs/src/modules/editor/extensions/pagination.extension.ts` (render header/footer theo parity + section setup)
- **Modify**: `apps/docs/src/modules/editor/components/PageStack.tsx` (watermark + header/footer parity)
- **Modify**: `apps/docs/src/modules/editor/print/print-document.utils.ts` (print watermark + section)
- **Create**: `apps/docs/src/modules/editor/components/WatermarkPanel.tsx`
- **Create**: `apps/docs/src/modules/editor/components/page-settings/HeaderFooterSettingsTab.tsx` (different first/odd-even toggles)
- **Modify**: `apps/docs/src/pages/HomePage.tsx` (template gallery UI)
- **Create**: `apps/docs/src/constants/templates.constants.ts` (template docs)
- **Modify**: `apps/docs/src/modules/sidebar/components/DocsSidebar.tsx` (folder tree)
- **Modify**: `apps/docs/src/hooks/useDocs.ts` (parentId ops, folder CRUD)
- **Modify**: `packages/i18n/src/locales/vi/docs.json` + `en/docs.json`

## Implementation Steps

1. Section break: node `sectionBreak` (atom, attribute `type`). Insert từ toolbar/menu. Pagination nhận diện để chia đoạn + áp pageSetup section.
2. Header/footer parity: mở rộng `PageSetup` schema + migration default (`withDefaults` trong docs.service.ts). Pagination render header/footer theo (first? odd? even?).
3. Watermark: panel thêm chữ/ảnh + opacity + rotation; lưu vào `PageSetup.watermark`; render background page + print CSS.
4. Bookmark: node bookmark (atom, id auto-gen), mark link hỗ trợ href `#id`, click scroll.
5. Template gallery: `templates.constants.ts` (5-6 template HTML), UI card ở HomePage, tạo doc từ template.
6. Folders: `parentId` nullable, folder store riêng hoặc dùng `kind: 'folder'` trong docs list; sidebar cây + drag hoặc menu di chuyển; mở nút moveToFolder Header.
7. i18n, typecheck, test, verify print.

## Todo List

- [x] Section break node + pagination section
- [x] Header/footer different first/odd-even
- [x] Watermark panel + print
- [x] Bookmark + link
- [x] Template gallery + constants
- [x] Folders + sidebar tree
- [x] i18n + verify print

## Success Criteria

- Section break ngắt trang đúng, đổi lề/khổ từ section sau.
- Header lẻ/chẵn/trang đầu hiển thị + in đúng.
- Watermark hiện trên màn hình + in ra.
- Bookmark link nhảy đúng vị trí.
- Tạo doc từ template có nội dung mẫu.
- Di chuyển doc vào folder, lọc đúng.
- Typecheck + test pass.

## Risk Assessment

| Rủi ro                                          | Mitigation                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| Section break phức tạp hóa pagination           | Giới hạn MVP: chỉ next-page + đổi setup đơn giản; continuous-section hoãn |
| Header/footer parity thêm chiều phức tạp render | Tách render function, test kỹ print                                       |
| Folder làm phức tạp storage                     | Giữ flat list + parentId (không cây thực sự), đủ cho MVP                  |

## Security Considerations

- Watermark text: escape khi render.
- Template HTML: chỉ dùng template nội bộ đã kiểm soát, không nhập ngoài.

## Next Steps

- Phase 6 (comments) — dùng section/bookmark để neo comment.
- Phase 4 (export .docx) — bổ sung map section/bookmark khi đã có.
