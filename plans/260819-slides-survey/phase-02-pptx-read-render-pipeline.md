# Phase 2: Khảo sát chiều đọc & render file PPTX qua `packages/pptx-io`

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 10h

- **Mục tiêu**: Xây dựng pipeline phân tích (parse) và kết xuất (render) file `.pptx` trong `packages/pptx-io` và tích hợp vào `apps/slides`. Kiểm thử khả năng render với bộ 3 file mẫu đại diện.

## Requirements

1. Đánh giá và cài đặt package lõi kết xuất PPTX (như `pptx-viewer-core` / `pptx-viewer` Apache-2.0) vào `packages/pptx-io`.
2. Tạo module bọc `pptx-io` (`parsePptxFile`, `renderSlide`, `extractSlideData`):
   - Đọc dữ liệu từ `ArrayBuffer` / `Blob` của file `.pptx`.
   - Bóc tách cấu trúc: danh sách slide, kích thước khung trình chiếu (16:9 hoặc 4:3), text boxes, bảng (tables), hình ảnh, shapes hình khối.
3. Chuẩn bị bộ 3 file mẫu `.pptx` trong `apps/slides/public/samples/` hoặc script tự sinh:
   - `sample-basic.pptx`: 3 slide, text heading/body font tiếng Việt Unicode, bullet list, màu sắc.
   - `sample-medium.pptx`: 5 slide, bảng số liệu, ảnh nhúng, các hình khối shape cơ bản (hình chữ nhật, elip, mũi tên).
   - `sample-advanced.pptx`: 10+ slide, layout doanh nghiệp phức tạp, nhiều lớp layer.
4. Tích hợp nút "Mở PPTX" (Open PPTX) và bộ chọn nhanh file mẫu trong `apps/slides` để kiểm thử render trực quan.
5. Render danh sách thumbnail slide ở thanh điều hướng bên trái và canvas slide chính ở giữa màn hình.

## Architecture

```text
packages/pptx-io/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                    # Public API export
    ├── parser/
    │   ├── pptxParser.service.ts   # Phân tích file zip OOXML / thư viện lõi
    │   └── slideModel.types.ts     # Kiểu dữ liệu trung gian của Slide Model
    ├── renderer/
    │   └── slideRenderer.service.ts # Bridge kết xuất DOM/Canvas/SVG cho từng slide
    └── utils/
        └── color.utils.ts          # Chuyển đổi màu sắc OOXML sang CSS / Token

apps/slides/src/
├── components/
│   ├── SlideCanvas.tsx             # Vùng hiển thị slide chính đang chọn
│   ├── SlideThumbnailList.tsx      # Danh sách thu nhỏ slide bên trái
│   └── SlideToolbar.tsx            # Thanh công cụ: Chọn slide, Zoom, File mẫu
└── hooks/
    └── usePptxLoader.ts            # Hook quản lý nạp file và trạng thái phân tích
```

## Implementation Steps

1. **Cấu hình `packages/pptx-io`**:
   - Thêm dependency xử lý PPTX phù hợp (`pptx-viewer-core` hoặc JSZip + parser tùy theo package đã khảo sát).
   - Định nghĩa `SlideDeckModel`, `SlideItemModel`, `SlideElement` types.
2. **Hiện thực bộ parser/renderer trong `pptx-io`**:
   - `parsePptxFile(buffer: ArrayBuffer): Promise<SlideDeckModel>`.
   - `renderSlideToContainer(slide: SlideItemModel, container: HTMLElement): void` (hoặc React renderer component).
3. **Tạo bộ 3 file mẫu `.pptx`**:
   - Khởi tạo 3 file `.pptx` mẫu lưu tại `apps/slides/public/samples/`.
4. **Tích hợp vào `apps/slides`**:
   - Xây dựng component `SlideCanvas.tsx` và `SlideThumbnailList.tsx`.
   - Thêm tính năng kéo-thả file hoặc chọn file `.pptx` từ máy cục bộ.
5. **Kiểm thử trực quan**:
   - Mở lần lượt 3 file mẫu: kiểm tra hiển thị tiếng Việt, bảng biểu, ảnh và hình khối.
   - Ghi nhận lại các phần tử hiển thị đúng và các phần tử bị lệch/lỗi render.

## Success Criteria

- File `.pptx` mẫu cơ bản và trung bình nạp được và hiển thị trực quan trên giao diện `apps/slides`.
- Font chữ tiếng Việt không bị lỗi font (tofu/lỗi encoding).
- Danh sách slide thumbnail bên trái hiển thị đúng thứ tự và cho phép bấm chọn để chuyển đổi slide chính.
