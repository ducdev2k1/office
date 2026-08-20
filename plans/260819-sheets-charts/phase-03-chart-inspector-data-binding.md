---
phase: 3
title: 'Chart Inspector Sidebar: Giao diện Cấu hình, Live Preview & Data Range Binding'
status: completed
priority: P1
effort: '7h'
dependencies: ['1', '2']
---

# Phase 3: Chart Inspector Sidebar: Giao diện Cấu hình, Live Preview & Data Range Binding

## Overview

Xây dựng Sidebar cấu hình biểu đồ (Chart Inspector) nằm ở cạnh phải màn hình, mang trải nghiệm trực quan tương tự Google Sheets. Người dùng có thể chọn vùng dữ liệu (Data Range) từ bảng tính, tự động nhận diện tiêu đề/chuỗi dữ liệu, thay đổi kiểu biểu đồ, tuỳ biến màu sắc, tiêu đề, trục toạ độ và xem trước kết quả trực tiếp theo thời gian thực (Live Preview).

## Requirements

- **Trình đơn mở (Trigger & Entry Points)**:
  - Nút **Chèn Biểu đồ (Insert Chart)** trên thanh công cụ (`InsertTools.tsx`) và Menu Insert.
  - Nhấp đúp (Double-click) vào biểu đồ hoặc chọn "Chỉnh sửa biểu đồ" từ menu ngữ cảnh.
- **Tab 1: Thiết lập (Setup)**:
  - Dropdown chọn loại biểu đồ (với icon và hình minh hoạ trực quan cho 8 loại).
  - Ô nhập / chọn dải dữ liệu (Data Range Picker, ví dụ `Sheet1!A1:D10`).
  - Checkbox: "Dòng đầu tiên làm tiêu đề (Header row)", "Cột đầu tiên làm nhãn (Header column)".
  - Cấu hình trục hoành X (Category / X-Axis) và danh sách chuỗi dữ liệu (Series Y) kèm khả năng thêm/bớt chuỗi.
- **Tab 2: Tùy chỉnh (Customize)**:
  - Tiêu đề biểu đồ (Chart Title), Phụ đề (Subtitle), Phông chữ & Kích thước.
  - Vị trí chú giải (Legend Position: Trên, Dưới, Trái, Phải, Không hiển thị).
  - Bảng màu sắc (Color Palette) & Tuỳ chỉnh màu cho từng Series.
  - Đường lưới (Gridlines), Nhãn giá trị trên cột (Data Labels).
- **Data Binding Engine**:
  - Trích xuất dữ liệu ma trận từ `univerAPI` theo Data Range.
  - Lắng nghe sự kiện `onCommandExecuted` của Univer để tự động cập nhật lại biểu đồ khi người dùng sửa giá trị trong ô tính.

## Related Code Files

- Create:
  - `apps/sheets/src/modules/charts/components/ChartInspector.tsx`
  - `apps/sheets/src/modules/charts/components/inspector/ChartSetupTab.tsx`
  - `apps/sheets/src/modules/charts/components/inspector/ChartCustomizeTab.tsx`
  - `apps/sheets/src/modules/charts/components/inspector/ChartTypeSelector.tsx`
  - `apps/sheets/src/modules/charts/components/inspector/DataRangePicker.tsx`
  - `apps/sheets/src/modules/charts/hooks/useChartDataBinding.ts`
  - `apps/sheets/src/modules/charts/utils/dataRangeParser.utils.ts`
- Modify:
  - `apps/sheets/src/modules/toolbar/components/InsertTools.tsx` (thêm nút Chèn Biểu đồ)
  - `apps/sheets/src/modules/toolbar/components/SheetsToolbar.tsx`
  - `apps/sheets/src/pages/EditorPage.tsx` (quản lý trạng thái mở/đóng Sidebar)

## Implementation Steps

1. Xây dựng tiện ích `dataRangeParser.utils.ts`:
   - Phân tích cú pháp chuỗi range (ví dụ `'Sheet1'!A1:C15` hoặc `B2:D20`).
   - Đọc ma trận giá trị từ `univerAPI.getActiveWorkbook().getActiveSheet()`.
   - Tự động tách Series và X-Axis dựa trên flag header row/column.
2. Viết hook `useChartDataBinding.ts` liên kết dữ liệu trực tiếp với Univer: khi các ô trong range thay đổi, tính toán lại data ma trận và truyền vào ECharts.
3. Xây dựng component `ChartTypeSelector.tsx` hiển thị lưới các loại biểu đồ kèm icon iNET/lucide.
4. Xây dựng `ChartSetupTab.tsx` và `ChartCustomizeTab.tsx`.
5. Tạo `ChartInspector.tsx` dạng Right Sidebar trượt ra khi có biểu đồ được chọn hoặc khi bấm nút Insert.
6. Thêm nút "Biểu đồ" vào `InsertTools.tsx` với icon chart chuẩn và tooltip.

## Success Criteria

- [ ] Bấm nút "Chèn Biểu đồ" khi đang chọn vùng ô dữ liệu sẽ tự động tạo biểu đồ và mở Sidebar cấu hình.
- [ ] Đổi loại biểu đồ trong Sidebar cập nhật biểu đồ tức thì.
- [ ] Chỉnh sửa giá trị trong các ô tính tương ứng làm biểu đồ cập nhật ngay lập tức.
- [ ] Đổi màu sắc, tiêu đề, chú giải hiển thị đúng như thiết lập.
