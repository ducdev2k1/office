import type { IWorkbookData } from '@univerjs/core';

export interface XlsxChartSpec {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  sheetId?: string;
  dataRange: string;
  hasHeaderRow?: boolean;
  hasHeaderColumn?: boolean;
  legend?: {
    show: boolean;
    position: string;
  };
  position?: {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };
  palette?: string[];
  isDonut?: boolean;
  isSmooth?: boolean;
  isStacked?: boolean;
}

export interface XlsxWorkbookData extends IWorkbookData {
  charts?: XlsxChartSpec[];
}
