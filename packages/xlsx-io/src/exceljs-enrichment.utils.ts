import type { ICellData, IStyleData } from '@univerjs/core';
import type ExcelJS from 'exceljs';
import { resolveExcelColor } from './exceljs-color.utils';
import { DEFAULT_STATUS_STYLES } from './exceljs-style-presets.constants';
import { parseRangeRef } from './exceljs-range.utils';

interface CondFormattingRef {
  ref?: string;
  rules?: Array<{
    type?: string;
    operator?: string;
    formulae?: string[];
    text?: string;
    style?: unknown;
  }>;
}

/**
 * Post-import enrichment: evaluate explicit conditional-formatting rules baked
 * into the Excel model, then apply the status-badge color fallback for well-known
 * workflow keywords (Google Sheets dropdown badges carry no embedded CF).
 */
export const enrichSheetCells = (
  ws: ExcelJS.Worksheet,
  cellData: Record<number, Record<number, ICellData>>,
  styleMap: Record<string, IStyleData>,
  getStyleId: (style: IStyleData | undefined) => string | undefined,
): void => {
  try {
    const condFormattings =
      (
        ws.model as {
          conditionalFormattings?: CondFormattingRef[];
        }
      )?.conditionalFormattings ?? [];
    for (const cf of condFormattings) {
      if (!cf.ref || !cf.rules) continue;
      const range = parseRangeRef(cf.ref);
      if (!range) continue;

      for (const rule of cf.rules) {
        if (!rule.style) continue;
        const targetValue = (rule.formulae?.[0] ?? rule.text ?? '').replace(/^"|"$/g, '');
        const ruleStyle = rule.style as { font?: Partial<ExcelJS.Font>; fill?: ExcelJS.Fill };
        const fontColor = resolveExcelColor(ruleStyle.font?.color);
        const fgFill =
          ruleStyle.fill && ruleStyle.fill.type === 'pattern'
            ? (ruleStyle.fill as ExcelJS.FillPattern).fgColor
            : undefined;
        const fillColor = resolveExcelColor(fgFill);

        for (let r = range.startRow; r <= range.endRow; r++) {
          for (let c = range.startCol; c <= range.endCol; c++) {
            const cell = cellData[r]?.[c];
            if (!cell) continue;
            const cellStr = cell.v !== undefined ? String(cell.v).trim() : '';
            const matches =
              rule.operator === 'equal' || rule.type === 'containsText'
                ? cellStr.toLowerCase() === targetValue.toLowerCase() ||
                  (rule.type === 'containsText' &&
                    cellStr.toLowerCase().includes(targetValue.toLowerCase()))
                : false;

            if (matches) {
              const existingStyle: IStyleData =
                (cell.s && typeof cell.s === 'string' ? styleMap[cell.s] : undefined) || {};
              const mergedStyle: IStyleData = {
                ...existingStyle,
                ...(fontColor ? { cl: { rgb: fontColor } } : {}),
                ...(fillColor ? { bg: { rgb: fillColor } } : {}),
                ...(ruleStyle.font?.bold ? { bl: 1 } : {}),
                ...(ruleStyle.font?.italic ? { it: 1 } : {}),
              };
              const newStyleId = getStyleId(mergedStyle);
              if (newStyleId) cell.s = newStyleId;
            }
          }
        }
      }
    }
  } catch {
    // ignore malformed CF models
  }

  for (const rowObj of Object.values(cellData)) {
    for (const cell of Object.values(rowObj)) {
      if (cell.v === undefined || cell.v === null) continue;
      const textKey = String(cell.v).trim().toLowerCase();
      const badge = DEFAULT_STATUS_STYLES[textKey];
      if (badge) {
        const curStyle: IStyleData =
          (cell.s && typeof cell.s === 'string' ? styleMap[cell.s] : undefined) || {};
        // Only apply status colors if no custom background color was explicitly defined
        if (!curStyle.bg?.rgb) {
          const mergedStyle: IStyleData = {
            ...curStyle,
            bg: { rgb: badge.bg },
            cl: { rgb: badge.cl },
            bl: badge.bl ?? 1,
          };
          const newId = getStyleId(mergedStyle);
          if (newId) cell.s = newId;
        }
      }
    }
  }
};
