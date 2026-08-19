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

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'none';

export interface ChartSeriesConfig {
  id: string;
  name: string;
  type?: 'bar' | 'line' | 'scatter' | 'area';
  color?: string;
  yAxisIndex?: number;
}

export interface ChartPosition {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export interface ChartLegendConfig {
  show: boolean;
  position: LegendPosition;
}

export interface ChartAxisConfig {
  title?: string;
  showGrid?: boolean;
  showLabels?: boolean;
}

export interface ChartSpec {
  id: string;
  title: string;
  subtitle?: string;
  type: ChartType;
  sheetId: string;
  dataRange: string; // e.g. "A1:C6" or "Sheet1!A1:C6"
  hasHeaderRow: boolean;
  hasHeaderColumn: boolean;
  series: ChartSeriesConfig[];
  legend: ChartLegendConfig;
  position: ChartPosition;
  xAxis?: ChartAxisConfig;
  yAxis?: ChartAxisConfig;
  palette?: string[];
  isDonut?: boolean;
  isSmooth?: boolean;
  isStacked?: boolean;
}

export interface ParsedDataMatrix {
  headers: string[];
  categories: string[];
  seriesData: {
    name: string;
    values: number[];
  }[];
}
