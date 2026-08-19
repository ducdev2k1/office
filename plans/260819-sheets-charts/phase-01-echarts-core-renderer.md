---
phase: 1
title: "Core Chart Engine: Schema, Types & ECharts Multi-Type Renderer"
status: completed
priority: P1
effort: "6h"
dependencies: []
---

# Phase 1: Core Chart Engine: Schema, Types & ECharts Multi-Type Renderer

## Overview
Xây dựng nền tảng cho hệ thống biểu đồ: cài đặt thư viện Apache ECharts, định nghĩa toàn bộ schema và types mô tả biểu đồ (`ChartSpec`, `ChartType`, `ChartSeries`, `ChartPosition`), cùng component renderer chuẩn hóa hỗ trợ 8 loại biểu đồ mục tiêu.

## Requirements
- Hỗ trợ 8 loại biểu đồ:
  1. **Column (Cột đứng)**
  2. **Bar (Thanh ngang)**
  3. **Line (Đường gấp khúc / mượt)**
  4. **Pie / Donut (Hình tròn / Bánh donut)**
  5. **Area (Vùng diện tích)**
  6. **Scatter (Phân tán)**
  7. **Radar (Mạng nhện)**
  8. **Funnel / Combo (Hình phễu / Kết hợp Cột & Đường)**
- Hỗ trợ chuyển đổi Theme sáng / tối (Dark / Light mode) tự động theo theme hệ thống iNET.
- Tự động co dãn theo kích thước của container (ResizeObserver).
- Tối ưu hóa bundle: import ECharts theo dạng modular (chỉ nạp các charts, components cần thiết để tránh phình to bundle).

## Architecture & Data Model

```ts
export type ChartType = 
  | 'column'
  | 'bar'
  | 'line'
  | 'pie'
  | 'area'
  | 'scatter'
  | 'radar'
  | 'funnel'
  | 'combo';

export interface ChartSeriesConfig {
  id: string;
  name: string;
  type?: 'bar' | 'line' | 'scatter' | 'area';
  dataRange: string; // ví dụ: 'Sheet1!B2:B10'
  color?: string;
  yAxisIndex?: number;
}

export interface ChartSpec {
  id: string;
  title: string;
  subtitle?: string;
  type: ChartType;
  sheetId: string;
  dataRange: string; // ví dụ: 'Sheet1!A1:C10'
  hasHeaderRow: boolean;
  hasHeaderColumn: boolean;
  categoryRange?: string; // Trục X (hoặc Categories)
  series: ChartSeriesConfig[];
  legend: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  position: {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };
  options?: Record<string, unknown>;
}
```

## Related Code Files
- Create:
  - `apps/sheets/src/modules/charts/types/charts.types.ts`
  - `apps/sheets/src/modules/charts/constants/charts.constants.ts`
  - `apps/sheets/src/modules/charts/utils/echartsOptions.utils.ts`
  - `apps/sheets/src/modules/charts/components/ChartRenderer.tsx`
  - `apps/sheets/src/modules/charts/index.ts`
- Modify:
  - `apps/sheets/package.json` (thêm dependency `echarts`)

## Implementation Steps
1. Cài đặt `echarts` vào `apps/sheets`.
2. Tạo các định nghĩa kiểu trong `charts.types.ts` và hằng số cấu hình mặc định trong `charts.constants.ts`.
3. Xây dựng transformer `buildEChartsOption(spec: ChartSpec, dataMatrix: (string | number)[][], isDark: boolean)` trong `echartsOptions.utils.ts` biến đổi `ChartSpec` thành `EChartsOption`.
4. Tạo React component `ChartRenderer.tsx` đóng gói ECharts instance, lắng nghe `ResizeObserver` và dọn dẹp (dispose) khi unmount.
5. Viết unit test cho hàm sinh cấu hình ECharts option với các mẫu dữ liệu khác nhau.

## Success Criteria
- [ ] Cài đặt thành công `echarts` và build/typecheck pass không có lỗi.
- [ ] `ChartRenderer` render chính xác 8 loại biểu đồ với dữ liệu mẫu (mock data).
- [ ] Tự động chuyển đổi màu sắc/theme khi toggle Light/Dark mode.
- [ ] Component tự động resize mượt mà khi kích thước khung thay đổi.
