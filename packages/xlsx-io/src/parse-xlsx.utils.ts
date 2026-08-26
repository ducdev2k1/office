import { exceljsToUniver } from './exceljsToUniver.utils';
import type { XlsxChartSpec, XlsxWorkbookData } from './types';

export const parseXlsxBuffer = async (buffer: ArrayBuffer): Promise<XlsxWorkbookData> => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const data: XlsxWorkbookData = exceljsToUniver(workbook);

  if (workbook.description) {
    try {
      const parsed = JSON.parse(workbook.description);
      if (parsed?.officeCharts && Array.isArray(parsed.officeCharts)) {
        data.charts = parsed.officeCharts as XlsxChartSpec[];
      }
    } catch {
      // Ignore if not JSON
    }
  }

  return data;
};

export const parseXlsxFile = async (file: Blob): Promise<XlsxWorkbookData> => {
  const buffer = await file.arrayBuffer();
  return parseXlsxBuffer(buffer);
};
