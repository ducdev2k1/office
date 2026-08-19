import {
  BorderStyleTypes,
  CellValueType,
  HorizontalAlign,
  LocaleType,
  VerticalAlign,
  WrapStrategy,
  type CellValue,
  type ICellData,
  type IRange,
  type IStyleData,
  type IWorkbookData,
  type IWorksheetData,
} from '@univerjs/core';
import type ExcelJS from 'exceljs';

const BORDER_STYLE_MAP: Record<string, BorderStyleTypes> = {
  thin: BorderStyleTypes.THIN,
  hair: BorderStyleTypes.HAIR,
  dotted: BorderStyleTypes.DOTTED,
  dashed: BorderStyleTypes.DASHED,
  dashDot: BorderStyleTypes.DASH_DOT,
  dashDotDot: BorderStyleTypes.DASH_DOT_DOT,
  double: BorderStyleTypes.DOUBLE,
  medium: BorderStyleTypes.MEDIUM,
  mediumDashed: BorderStyleTypes.MEDIUM_DASHED,
  mediumDashDot: BorderStyleTypes.MEDIUM_DASH_DOT,
  thick: BorderStyleTypes.THICK,
};

const H_ALIGN_MAP: Record<string, HorizontalAlign> = {
  left: HorizontalAlign.LEFT,
  center: HorizontalAlign.CENTER,
  right: HorizontalAlign.RIGHT,
  justify: HorizontalAlign.JUSTIFIED,
};

const V_ALIGN_MAP: Record<string, VerticalAlign> = {
  top: VerticalAlign.TOP,
  middle: VerticalAlign.MIDDLE,
  bottom: VerticalAlign.BOTTOM,
};

const DEFAULT_THEME_COLORS = [
  '#FFFFFF', // 0: Background 1 (Light 1)
  '#000000', // 1: Text 1 (Dark 1)
  '#E7E6E6', // 2: Background 2 (Light 2)
  '#44546A', // 3: Text 2 (Dark 2)
  '#4472C4', // 4: Accent 1 (Blue)
  '#ED7D31', // 5: Accent 2 (Orange)
  '#A5A5A5', // 6: Accent 3 (Gray)
  '#FFC000', // 7: Accent 4 (Gold/Yellow)
  '#5B9BD5', // 8: Accent 5 (Light Blue)
  '#70AD47', // 9: Accent 6 (Green)
  '#0563C1', // 10: Hyperlink
  '#954F72', // 11: Followed Hyperlink
];

const INDEXED_COLORS: Record<number, string> = {
  0: '#000000', 1: '#FFFFFF', 2: '#FF0000', 3: '#00FF00', 4: '#0000FF',
  5: '#FFFF00', 6: '#FF00FF', 7: '#00FFFF', 8: '#000000', 9: '#FFFFFF',
  10: '#FF0000', 11: '#00FF00', 12: '#0000FF', 13: '#FFFF00', 14: '#FF00FF',
  15: '#00FFFF', 16: '#800000', 17: '#008000', 18: '#000080', 19: '#808000',
  20: '#800080', 21: '#008080', 22: '#C0C0C0', 23: '#808080', 24: '#9999FF',
  25: '#993366', 26: '#FFFFCC', 27: '#CCFFFF', 28: '#660066', 29: '#FF8080',
  30: '#0066CC', 31: '#CCCCFF', 32: '#000080', 33: '#FF00FF', 34: '#FFFF00',
  35: '#00FFFF', 36: '#800080', 37: '#800000', 38: '#008080', 39: '#0000FF',
  40: '#00CCFF', 41: '#CCFFFF', 42: '#CCFFCC', 43: '#FFFF99', 44: '#99CCFF',
  45: '#FF99CC', 46: '#CC99FF', 47: '#FFCC99', 48: '#3366FF', 49: '#33CCCC',
  50: '#99CC00', 51: '#FFCC00', 52: '#FF9900', 53: '#FF6600', 54: '#666699',
  55: '#969696', 56: '#003366', 57: '#339966', 58: '#003300', 59: '#333300',
  60: '#993300', 61: '#993366', 62: '#333399', 63: '#333333', 64: '#000000',
  65: '#FFFFFF',
};

const DEFAULT_STATUS_STYLES: Record<string, { bg: string; cl: string; bl?: number }> = {
  'chờ fix': { bg: '#ffd5d5', cl: '#c00000', bl: 1 },
  'done': { bg: '#ffeb9c', cl: '#9c6500', bl: 1 },
  'doing': { bg: '#e1d5e7', cl: '#674ea7', bl: 1 },
  'new': { bg: '#d5e8d4', cl: '#27500a', bl: 1 },
  'retest': { bg: '#fce5cd', cl: '#a64d79', bl: 1 },
  'done testcase': { bg: '#deeaf1', cl: '#1f4e79', bl: 1 },
  'confirmed': { bg: '#fce4d6', cl: '#791f1f', bl: 1 },
  'fixing': { bg: '#fff2cc', cl: '#633806', bl: 1 },
  'resolved': { bg: '#e1f5ee', cl: '#085041', bl: 1 },
  'critical': { bg: '#ffd5d5', cl: '#c00000', bl: 1 },
  'high': { bg: '#fff2cc', cl: '#c55a11', bl: 1 },
  'medium': { bg: '#deeaf1', cl: '#1f4e79', bl: 1 },
  'low': { bg: '#e2efda', cl: '#27500a', bl: 1 },
};

const genId = () => `s_${Math.random().toString(36).slice(2, 10)}`;

const applyTint = (rgbHex: string, tint?: number): string => {
  if (tint === undefined || tint === 0) return rgbHex;
  const hex = rgbHex.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  if (tint > 0) {
    r = Math.round(r + (255 - r) * tint);
    g = Math.round(g + (255 - g) * tint);
    b = Math.round(b + (255 - b) * tint);
  } else {
    r = Math.round(r * (1 + tint));
    g = Math.round(g * (1 + tint));
    b = Math.round(b * (1 + tint));
  }

  const toHex = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const toRgb = (argb: string): string => {
  if (!argb) return '#000000';
  const clean = argb.replace('#', '');
  if (clean.length === 8) {
    return `#${clean.slice(2)}`;
  }
  if (clean.length === 6) {
    return `#${clean}`;
  }
  return `#${clean}`;
};

interface ExtendedExcelColor {
  argb?: string;
  theme?: number;
  tint?: number;
  indexed?: number;
}

const resolveExcelColor = (colorObj?: Partial<ExcelJS.Color> | ExtendedExcelColor): string | undefined => {
  if (!colorObj) return undefined;
  const c = colorObj as ExtendedExcelColor;
  if (c.argb) {
    return toRgb(c.argb);
  }
  if (c.theme !== undefined) {
    const baseColor = DEFAULT_THEME_COLORS[c.theme] || '#000000';
    return applyTint(baseColor, c.tint);
  }
  if (c.indexed !== undefined) {
    const baseColor = INDEXED_COLORS[c.indexed] || '#000000';
    return applyTint(baseColor, c.tint);
  }
  return undefined;
};

const convertCellValue = (
  value: ExcelJS.CellValue,
): { v?: CellValue; f?: string; t?: CellValueType } => {
  if (value === null || value === undefined) return {};
  if (typeof value === 'object') {
    if ('formula' in value || 'sharedFormula' in value) {
      const formulaStr =
        'formula' in value && typeof value.formula === 'string'
          ? value.formula.startsWith('=')
            ? value.formula
            : `=${value.formula}`
          : undefined;
      const res = 'result' in value && value.result !== undefined ? value.result : undefined;
      const v = typeof res === 'object' ? undefined : (res as CellValue | undefined);
      return {
        f: formulaStr,
        v: v !== undefined ? v : (formulaStr ? undefined : undefined),
        t:
          typeof res === 'number'
            ? CellValueType.NUMBER
            : typeof res === 'boolean'
              ? CellValueType.BOOLEAN
              : CellValueType.STRING,
      };
    }
    if ('text' in value && value.text !== undefined) {
      return { v: value.text, t: CellValueType.STRING };
    }
    if ('richText' in value && Array.isArray(value.richText)) {
      return { v: value.richText.map((r) => r.text).join(''), t: CellValueType.STRING };
    }
    if ('error' in value && value.error !== undefined) {
      return { v: `#${value.error}`, t: CellValueType.STRING };
    }
    if (value instanceof Date) {
      return { v: value.toISOString().split('T')[0], t: CellValueType.STRING };
    }
    return {};
  }
  if (typeof value === 'number') return { v: value, t: CellValueType.NUMBER };
  if (typeof value === 'boolean') return { v: value, t: CellValueType.BOOLEAN };
  return { v: String(value), t: CellValueType.STRING };
};

const buildStyle = (cell: ExcelJS.Cell): IStyleData | undefined => {
  const style: IStyleData = {};
  let hasStyle = false;

  const font = cell.font;
  if (font) {
    if (font.bold) {
      style.bl = 1;
      hasStyle = true;
    }
    if (font.italic) {
      style.it = 1;
      hasStyle = true;
    }
    if (font.size) {
      style.fs = font.size;
      hasStyle = true;
    }
    if (font.name) {
      style.ff = font.name;
      hasStyle = true;
    }
    if (font.underline) {
      style.ul = { s: 1 };
      hasStyle = true;
    }
    if (font.strike) {
      style.st = { s: 1 };
      hasStyle = true;
    }
    const fontColor = resolveExcelColor(font.color);
    if (fontColor) {
      style.cl = { rgb: fontColor };
      hasStyle = true;
    }
  }

  const fill = cell.fill;
  if (fill && fill.type === 'pattern') {
    const fg = (fill as ExcelJS.FillPattern).fgColor;
    const bg = (fill as ExcelJS.FillPattern).bgColor;
    const resolvedColor = resolveExcelColor(fg) || resolveExcelColor(bg);
    if (resolvedColor) {
      style.bg = { rgb: resolvedColor };
      hasStyle = true;
    }
  }

  const border = cell.border;
  if (border) {
    const bd: NonNullable<IStyleData['bd']> = {};
    const edges = [
      ['top', 't'],
      ['bottom', 'b'],
      ['left', 'l'],
      ['right', 'r'],
    ] as const;
    for (const [srcKey, dstKey] of edges) {
      const b = border[srcKey];
      if (b?.style) {
        const s = BORDER_STYLE_MAP[b.style] ?? BorderStyleTypes.THIN;
        const color = resolveExcelColor(b.color) || '#000000';
        bd[dstKey] = { s, cl: { rgb: color } };
        hasStyle = true;
      }
    }
    if (Object.keys(bd).length > 0) {
      style.bd = bd;
      hasStyle = true;
    }
  }

  if (cell.alignment) {
    if (cell.alignment.horizontal) {
      const h = H_ALIGN_MAP[cell.alignment.horizontal];
      if (h) {
        style.ht = h;
        hasStyle = true;
      }
    }
    if (cell.alignment.vertical) {
      const v = V_ALIGN_MAP[cell.alignment.vertical];
      if (v) {
        style.vt = v;
        hasStyle = true;
      }
    }
    if (cell.alignment.wrapText) {
      style.tb = WrapStrategy.WRAP;
      hasStyle = true;
    }
  }

  if (cell.numFmt && cell.numFmt !== 'General') {
    style.n = { pattern: cell.numFmt };
    hasStyle = true;
  }

  return hasStyle ? style : undefined;
};

const colLetterToNumber = (col: string): number =>
  col.split('').reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);

const parseRangeRef = (ref: string): { startRow: number; startCol: number; endRow: number; endCol: number } | null => {
  const match = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/i.exec(ref.trim());
  if (!match) return null;
  const startCol = colLetterToNumber(match[1]!.toUpperCase()) - 1;
  const startRow = Number(match[2]) - 1;
  const endCol = match[3] ? colLetterToNumber(match[3].toUpperCase()) - 1 : startCol;
  const endRow = match[4] ? Number(match[4]) - 1 : startRow;
  return { startRow, startCol, endRow, endCol };
};

export const exceljsToUniver = (workbook: ExcelJS.Workbook): IWorkbookData => {
  const styleMap: Record<string, IStyleData> = {};
  const getStyleId = (style: IStyleData | undefined): string | undefined => {
    if (!style) return undefined;
    const key = JSON.stringify(style);
    for (const [id, s] of Object.entries(styleMap)) {
      if (JSON.stringify(s) === key) return id;
    }
    const id = genId();
    styleMap[id] = style;
    return id;
  };

  const sheets: Record<string, Partial<IWorksheetData>> = {};
  const sheetOrder: string[] = [];

  workbook.eachSheet((ws) => {
    const sheetId = genId();
    sheetOrder.push(sheetId);

    const cellData: Record<number, Record<number, ICellData>> = {};
    const colMaxLens: Record<number, number> = {};
    const rowLineCounts: Record<number, number> = {};

    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const r = rowNumber - 1; // 0-indexed for Univer
      let maxLinesInRow = 1;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const c = colNumber - 1; // 0-indexed for Univer
        const { v, f, t } = convertCellValue(cell.value);
        if (v === undefined && f === undefined) return;
        const cellOut: ICellData = {};
        if (f !== undefined) cellOut.f = f;
        if (v !== undefined) cellOut.v = v;
        if (t !== undefined) cellOut.t = t;
        const style = buildStyle(cell);
        const styleId = getStyleId(style);
        if (styleId) cellOut.s = styleId;
        if (!cellData[r]) cellData[r] = {};
        cellData[r][c] = cellOut;

        // Content length and lines tracking
        const strVal = v !== undefined ? String(v) : (f ? String(f) : '');
        const lines = strVal.split('\n').length;
        if (lines > maxLinesInRow) maxLinesInRow = lines;
        const len = Math.max(...strVal.split('\n').map((line) => line.length));
        colMaxLens[c] = Math.max(colMaxLens[c] || 0, len);
      });

      if (maxLinesInRow > 1) {
        rowLineCounts[r] = maxLinesInRow;
      }
    });

    // 1. Evaluate explicit conditional formatting rules from Excel model if any
    try {
      const condFormattings = (ws.model as { conditionalFormattings?: Array<{ ref?: string; rules?: Array<{ type?: string; operator?: string; formulae?: string[]; text?: string; style?: unknown }> }> })?.conditionalFormattings ?? [];
      for (const cf of condFormattings) {
        if (!cf.ref || !cf.rules) continue;
        const range = parseRangeRef(cf.ref);
        if (!range) continue;

        for (const rule of cf.rules) {
          if (!rule.style) continue;
          const targetValue = (rule.formulae?.[0] ?? rule.text ?? '').replace(/^"|"$/g, '');
          const ruleStyle = rule.style as { font?: Partial<ExcelJS.Font>; fill?: ExcelJS.Fill };
          const fontColor = resolveExcelColor(ruleStyle.font?.color);
          const fgFill = ruleStyle.fill && ruleStyle.fill.type === 'pattern' ? (ruleStyle.fill as ExcelJS.FillPattern).fgColor : undefined;
          const fillColor = resolveExcelColor(fgFill);

          for (let r = range.startRow; r <= range.endRow; r++) {
            for (let c = range.startCol; c <= range.endCol; c++) {
              const cell = cellData[r]?.[c];
              if (!cell) continue;
              const cellStr = cell.v !== undefined ? String(cell.v).trim() : '';
              const matches =
                rule.operator === 'equal' || rule.type === 'containsText'
                  ? cellStr.toLowerCase() === targetValue.toLowerCase() || (rule.type === 'containsText' && cellStr.toLowerCase().includes(targetValue.toLowerCase()))
                  : false;

              if (matches) {
                const existingStyle: IStyleData = (cell.s && typeof cell.s === 'string' ? styleMap[cell.s] : undefined) || {};
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
      // ignore
    }

    // 2. Intelligent status color badge fallback for Google Sheets / Excel dropdown badges without embedded CF
    for (const [rStr, rowObj] of Object.entries(cellData)) {
      const r = Number(rStr);
      for (const [cStr, cell] of Object.entries(rowObj)) {
        const c = Number(cStr);
        if (cell.v === undefined || cell.v === null) continue;
        const textKey = String(cell.v).trim().toLowerCase();
        const badge = DEFAULT_STATUS_STYLES[textKey];
        if (badge) {
          const curStyle: IStyleData = (cell.s && typeof cell.s === 'string' ? styleMap[cell.s] : undefined) || {};
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

    const mergeData: IRange[] = (ws.model.merges ?? [])
      .map((m) => {
        const match = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(m);
        if (!match) return null;
        const startCol = colLetterToNumber(match[1] as string) - 1;
        const startRow = Number(match[2]) - 1;
        const endCol = colLetterToNumber(match[3] as string) - 1;
        const endRow = Number(match[4]) - 1;
        return {
          startRow,
          startColumn: startCol,
          endRow,
          endColumn: endCol,
        };
      })
      .filter((m): m is IRange => m !== null);

    const rowData: Record<number, { h?: number }> = {};
    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const r = rowNumber - 1;
      const explicitH = row.height;
      const multilineH = rowLineCounts[r] ? rowLineCounts[r] * 20 + 8 : undefined;
      const finalH = explicitH ? Math.max(explicitH, multilineH || explicitH) : multilineH;
      if (finalH) {
        rowData[r] = { h: finalH };
      }
    });

    const columnData: Record<number, { w?: number }> = {};
    const maxCol = Math.max(ws.columnCount || 0, 26);
    for (let c = 1; c <= maxCol; c++) {
      const cIndex = c - 1;
      try {
        const col = ws.getColumn(c);
        if (col?.width && col.width > 0) {
          // Exact Excel width to pixel mapping: (width * 8) + 5
          columnData[cIndex] = { w: Math.max(45, Math.round(col.width * 8) + 5) };
        } else {
          // Auto-calculate width based on max content length
          const maxLen = colMaxLens[cIndex] || 0;
          if (maxLen === 0) {
            columnData[cIndex] = { w: 88 };
          } else if (maxLen <= 3) {
            columnData[cIndex] = { w: 45 };
          } else {
            columnData[cIndex] = { w: Math.min(450, Math.max(80, Math.round(maxLen * 8.5) + 24)) };
          }
        }
      } catch {
        columnData[cIndex] = { w: 88 };
      }
    }

    sheets[sheetId] = {
      id: sheetId,
      name: ws.name,
      rowCount: Math.max((ws.rowCount || 0) + 30, 100),
      columnCount: Math.max((ws.columnCount || 0) + 10, 26),
      cellData,
      mergeData,
      rowData: rowData as IWorksheetData['rowData'],
      columnData: columnData as IWorksheetData['columnData'],
      hidden: 0,
      freeze: { xSplit: 0, ySplit: 0, startRow: -1, startColumn: -1 },
    };
  });

  return {
    id: genId(),
    name: workbook.title || 'Sheet',
    appVersion: '0.1.0',
    locale: LocaleType.EN_US,
    styles: styleMap,
    sheetOrder,
    sheets,
  };
};