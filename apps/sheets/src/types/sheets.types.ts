import type { ChartSpec } from '@/modules/charts/types/charts.types';
import type { FileRecord } from '@office/file-home';
import type { IWorkbookData } from '@univerjs/presets';

export interface SheetDocRecord extends FileRecord {
  data?: IWorkbookData;
  charts?: ChartSpec[];
  originalFileName?: string;
}

export type SheetRecord = SheetDocRecord;
