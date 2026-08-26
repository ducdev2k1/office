import type { ChartSpec } from '@/modules/charts/types/charts.types';
import { getXlsxSourceBuffer } from '@/services/sheets.service';
import {
  exportWorkbookHybrid,
  parseXlsxFile as parseXlsx,
  type XlsxWorkbookData,
} from '@office/xlsx-io';

export const parseXlsxFile = (file: File): Promise<XlsxWorkbookData> => parseXlsx(file);

export const exportXlsxFile = async (
  docId: string | undefined,
  data: XlsxWorkbookData,
  charts?: ChartSpec[],
): Promise<Blob> => {
  const sourceBuffer = docId ? await getXlsxSourceBuffer(docId) : null;
  const buffer = await exportWorkbookHybrid(data, charts, { sourceBuffer });
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};
