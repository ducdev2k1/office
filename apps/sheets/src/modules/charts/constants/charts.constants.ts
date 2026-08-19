import type { ChartSpec, ChartType } from '../types/charts.types';

export interface ChartTypeMetadata {
  type: ChartType;
  label: string;
  description: string;
  iconName: string;
  category: 'comparison' | 'trend' | 'part-to-whole' | 'distribution';
}

export const CHART_TYPES_METADATA: ChartTypeMetadata[] = [
  {
    type: 'column',
    label: 'Biểu đồ Cột (Column)',
    description: 'So sánh giá trị giữa các danh mục bằng cột đứng',
    iconName: 'bar-chart-2',
    category: 'comparison',
  },
  {
    type: 'bar',
    label: 'Biểu đồ Thanh ngang (Bar)',
    description: 'So sánh danh mục có tên dài bằng thanh ngang',
    iconName: 'align-left',
    category: 'comparison',
  },
  {
    type: 'line',
    label: 'Biểu đồ Đường (Line)',
    description: 'Theo dõi xu hướng biến đổi dữ liệu theo thời gian',
    iconName: 'trending-up',
    category: 'trend',
  },
  {
    type: 'pie',
    label: 'Biểu đồ Tròn (Pie / Donut)',
    description: 'Hiển thị tỉ lệ phần trăm đóng góp vào tổng thể',
    iconName: 'pie-chart',
    category: 'part-to-whole',
  },
  {
    type: 'area',
    label: 'Biểu đồ Miền (Area)',
    description: 'Thể hiện khối lượng và xu hướng tích luỹ theo thời gian',
    iconName: 'layers',
    category: 'trend',
  },
  {
    type: 'scatter',
    label: 'Biểu đồ Phân tán (Scatter)',
    description: 'Khám phá mối tương quan giữa hai biến số',
    iconName: 'target',
    category: 'distribution',
  },
  {
    type: 'radar',
    label: 'Biểu đồ Radar (Mạng nhện)',
    description: 'Đánh giá đa tiêu chí hoặc năng lực tổng hợp',
    iconName: 'compass',
    category: 'distribution',
  },
  {
    type: 'funnel',
    label: 'Biểu đồ Phễu (Funnel)',
    description: 'Theo dõi tỷ lệ chuyển đổi qua các giai đoạn quy trình',
    iconName: 'filter',
    category: 'part-to-whole',
  },
  {
    type: 'combo',
    label: 'Biểu đồ Kết hợp (Combo)',
    description: 'Kết hợp cột và đường để so sánh đa chiều',
    iconName: 'sliders',
    category: 'comparison',
  },
];

export const DEFAULT_PALETTES = {
  inet: ['#0070f3', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'],
  warm: ['#f43f5e', '#fb923c', '#fbbf24', '#a3e635', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc'],
  cool: ['#0284c7', '#0d9488', '#16a34a', '#6366f1', '#9333ea', '#c026d3', '#2563eb', '#059669'],
  pastel: ['#93c5fd', '#86efac', '#fde047', '#fca5a5', '#d8b4fe', '#67e8f9', '#f9a8d4', '#fdba74'],
};

export const DEFAULT_CHART_SIZE = {
  width: 500,
  height: 320,
  minWidth: 260,
  minHeight: 180,
};

export const createDefaultChartSpec = (
  sheetId: string,
  dataRange = 'A1:C6',
  type: ChartType = 'column'
): ChartSpec => ({
  id: `chart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  title: 'Biểu đồ không có tiêu đề',
  type,
  sheetId,
  dataRange,
  hasHeaderRow: true,
  hasHeaderColumn: true,
  series: [],
  legend: {
    show: true,
    position: 'top',
  },
  position: {
    fromRow: 2,
    fromCol: 4,
    toRow: 18,
    toCol: 12,
    offsetX: 10,
    offsetY: 10,
    width: DEFAULT_CHART_SIZE.width,
    height: DEFAULT_CHART_SIZE.height,
  },
  palette: DEFAULT_PALETTES.inet,
  isDonut: false,
  isSmooth: true,
  isStacked: false,
});
