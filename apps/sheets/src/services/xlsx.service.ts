import type { ChartSpec } from '@/modules/charts/types/charts.types';
import { parseXlsxFile as parseXlsx, univerToExceljs, type XlsxWorkbookData } from '@office/xlsx-io';

export const parseXlsxFile = (file: File): Promise<XlsxWorkbookData> => parseXlsx(file);

export const exportXlsxFile = async (
  data: XlsxWorkbookData,
  charts?: ChartSpec[]
): Promise<Blob> => {
  const buffer = await univerToExceljs(data, charts);
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};