---
phase: 4
title: "Persistence & OOXML Integration: Lưu IndexedDB & Đọc/Ghi ChartML (.xlsx)"
status: completed
priority: P1
effort: "8h"
dependencies: ["1", "2", "3"]
---

# Phase 4: Persistence & OOXML Integration: Lưu IndexedDB & Đọc/Ghi ChartML (.xlsx)

## Overview
Đảm bảo tính bền vững của dữ liệu và khả năng tương thích định dạng tệp chuẩn công nghiệp: lưu trữ danh sách biểu đồ kèm tài liệu vào IndexedDB của trình duyệt, đồng thời tích hợp trực tiếp vào package `@office/xlsx-io` để phân tích (parse) và khởi tạo (generate) các thành phần DrawingML / ChartML (`xl/drawings/drawing*.xml` và `xl/charts/chart*.xml`) khi mở hoặc xuất tệp Microsoft Excel `.xlsx`.

## Requirements
- **Lưu trữ Cục bộ (IndexedDB Persistence)**:
  - Mở rộng cấu trúc `StoredDocument` (trong `@office/storage-adapter`) hỗ trợ trường `charts?: ChartSpec[]`.
  - Tự động lưu biểu đồ khi người dùng thực hiện thao tác sửa đổi hoặc bấm Lưu / Xuất tệp.
  - Khi mở lại tài liệu từ IndexedDB, khôi phục toàn bộ biểu đồ lên đúng sheet và vị trí toạ độ.
- **Tương thích OOXML / XLSX (Import & Export)**:
  - **Import (.xlsx -> Web App)**:
    - Khi người dùng tải lên file `.xlsx` có chứa biểu đồ, đọc các part quan hệ `_rels`, `xl/drawings/drawing1.xml` và `xl/charts/chart1.xml`.
    - Chuyển đổi định dạng OOXML (`c:chartSpace`, `c:barChart`, `c:lineChart`, `c:pieChart`, `c:areaChart`...) thành mảng `ChartSpec`.
  - **Export (Web App -> .xlsx)**:
    - Khi người dùng bấm "Xuất XLSX", sinh ra các part XML tương ứng (`[Content_Types].xml`, `xl/drawings/drawing1.xml`, `xl/charts/chart1.xml`, quan hệ `.rels`).
    - Nhúng các part này vào file zip `.xlsx` sinh bởi ExcelJS để khi mở bằng Microsoft Excel hoặc Google Sheets, biểu đồ hiển thị là biểu đồ gốc (native Excel chart), không phải ảnh tĩnh.

## Architecture & Data Flow

```mermaid
flowchart LR
    subgraph Import Flow
        XLSXFile[.xlsx File] -->|JSZip / OOXML Parser| ChartMLParser[ChartML Parser in xlsx-io]
        ChartMLParser -->|Extract c:chartSpace| ChartSpecList[ChartSpec[]]
        ChartSpecList --> SheetsApp[apps/sheets State & Overlay]
    end

    subgraph Export Flow
        CurrentCharts[Active ChartSpec[]] --> ChartMLGenerator[ChartML Generator in xlsx-io]
        ChartMLGenerator -->|Build DrawingML & ChartML XML| ExcelJSPackager[Pack into .xlsx Buffer]
        ExcelJSPackager --> DownloadedXLSX[Native Excel .xlsx File]
    end
```

## Related Code Files
- Create:
  - `packages/xlsx-io/src/chartml/chartml.types.ts`
  - `packages/xlsx-io/src/chartml/parseChartML.utils.ts`
  - `packages/xlsx-io/src/chartml/generateChartML.utils.ts`
  - `packages/xlsx-io/src/chartml/drawingCoordinates.utils.ts`
  - `packages/xlsx-io/src/chartml/index.ts`
  - `packages/xlsx-io/src/__tests__/chartml.test.ts`
- Modify:
  - `packages/xlsx-io/src/parse-xlsx.utils.ts`
  - `packages/xlsx-io/src/univerToExceljs.utils.ts`
  - `packages/xlsx-io/src/index.ts`
  - `packages/storage-adapter/src/types/storage.types.ts`
  - `apps/sheets/src/services/sheets.service.ts`
  - `apps/sheets/src/services/xlsx.service.ts`
  - `apps/sheets/src/pages/EditorPage.tsx`

## Implementation Steps
1. Cập nhật `StoredDocument` trong `@office/storage-adapter` để thêm trường `charts?: ChartSpec[]`.
2. Xây dựng module `packages/xlsx-io/src/chartml/`:
   - `drawingCoordinates.utils.ts`: Chuyển đổi giữa `fromRow/fromCol/toRow/toCol` của web app sang định dạng `xdr:twoCellAnchor` của DrawingML (EMUs / row-col indices).
   - `parseChartML.utils.ts`: Phân tích thẻ `<c:chartSpace>` từ XML, trích xuất dải ô `<c:f>`, tiêu đề `<c:tx>`, kiểu biểu đồ và toạ độ neo.
   - `generateChartML.utils.ts`: Tạo chuỗi XML chuẩn DrawingML & ChartML cho 8 loại biểu đồ cơ bản/nâng cao.
3. Tích hợp parser vào `parseXlsxBuffer` và generator vào `univerToExceljs` trong `@office/xlsx-io`.
4. Cập nhật `EditorPage.tsx` trong `apps/sheets`:
   - Nhận danh sách biểu đồ sau khi import file `.xlsx`.
   - Đưa danh sách biểu đồ vào khi gọi `exportXlsxFile`.
   - Lưu trữ `charts` vào IndexedDB khi người dùng thao tác.

## Success Criteria
- [ ] Mở file `.xlsx` có biểu đồ từ Excel hiển thị được đúng biểu đồ trên giao diện web.
- [ ] Tạo biểu đồ trên web rồi Xuất file `.xlsx`, mở lại bằng Microsoft Excel / WPS / Google Sheets hiển thị đúng biểu đồ native chuẩn.
- [ ] F5 tải lại trang hoặc mở tài liệu từ danh sách Home, biểu đồ vẫn giữ nguyên vẹn vị trí và cấu hình.
