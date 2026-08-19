import { getStoredLocale, translate } from '@office/i18n';
import type { ChartSpec, ChartType } from '../types/charts.types';

export interface ChartTypeMetadata {
  type: ChartType;
  /** Khoá i18n trong namespace sheets, ví dụ chart.types.column.label */
  labelKey: string;
  descriptionKey: string;
  iconName: string;
  category: 'comparison' | 'trend' | 'part-to-whole' | 'distribution';
}

export const CHART_TYPES_METADATA: ChartTypeMetadata[] = [
  {
    type: 'column',
    labelKey: 'chart.types.column.label',
    descriptionKey: 'chart.types.column.description',
    iconName: 'bar-chart-2',
    category: 'comparison',
  },
  {
    type: 'bar',
    labelKey: 'chart.types.bar.label',
    descriptionKey: 'chart.types.bar.description',
    iconName: 'align-left',
    category: 'comparison',
  },
  {
    type: 'line',
    labelKey: 'chart.types.line.label',
    descriptionKey: 'chart.types.line.description',
    iconName: 'trending-up',
    category: 'trend',
  },
  {
    type: 'pie',
    labelKey: 'chart.types.pie.label',
    descriptionKey: 'chart.types.pie.description',
    iconName: 'pie-chart',
    category: 'part-to-whole',
  },
  {
    type: 'area',
    labelKey: 'chart.types.area.label',
    descriptionKey: 'chart.types.area.description',
    iconName: 'layers',
    category: 'trend',
  },
  {
    type: 'scatter',
    labelKey: 'chart.types.scatter.label',
    descriptionKey: 'chart.types.scatter.description',
    iconName: 'target',
    category: 'distribution',
  },
  {
    type: 'radar',
    labelKey: 'chart.types.radar.label',
    descriptionKey: 'chart.types.radar.description',
    iconName: 'compass',
    category: 'distribution',
  },
  {
    type: 'funnel',
    labelKey: 'chart.types.funnel.label',
    descriptionKey: 'chart.types.funnel.description',
    iconName: 'filter',
    category: 'part-to-whole',
  },
  {
    type: 'combo',
    labelKey: 'chart.types.combo.label',
    descriptionKey: 'chart.types.combo.description',
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
  type: ChartType = 'column',
  title = translate(getStoredLocale(), 'sheets.chart.untitled'),
): ChartSpec => ({
  id: `chart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  title,
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
