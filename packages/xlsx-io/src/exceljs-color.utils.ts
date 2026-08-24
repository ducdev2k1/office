import type ExcelJS from 'exceljs';
import type { ExtendedExcelColor } from './exceljs-converter.types';
import { DEFAULT_THEME_COLORS } from './exceljs-style-presets.constants';

const INDEXED_COLORS: Record<number, string> = {
  0: '#000000',
  1: '#FFFFFF',
  2: '#FF0000',
  3: '#00FF00',
  4: '#0000FF',
  5: '#FFFF00',
  6: '#FF00FF',
  7: '#00FFFF',
  8: '#000000',
  9: '#FFFFFF',
  10: '#FF0000',
  11: '#00FF00',
  12: '#0000FF',
  13: '#FFFF00',
  14: '#FF00FF',
  15: '#00FFFF',
  16: '#800000',
  17: '#008000',
  18: '#000080',
  19: '#808000',
  20: '#800080',
  21: '#008080',
  22: '#C0C0C0',
  23: '#808080',
  24: '#9999FF',
  25: '#993366',
  26: '#FFFFCC',
  27: '#CCFFFF',
  28: '#660066',
  29: '#FF8080',
  30: '#0066CC',
  31: '#CCCCFF',
  32: '#000080',
  33: '#FF00FF',
  34: '#FFFF00',
  35: '#00FFFF',
  36: '#800080',
  37: '#800000',
  38: '#000080',
  39: '#0000FF',
  40: '#00CCFF',
  41: '#CCFFFF',
  42: '#CCFFCC',
  43: '#FFFF99',
  44: '#99CCFF',
  45: '#FF99CC',
  46: '#CC99FF',
  47: '#FFCC99',
  48: '#3366FF',
  49: '#33CCCC',
  50: '#99CC00',
  51: '#FFCC00',
  52: '#FF9900',
  53: '#FF6600',
  54: '#666699',
  55: '#969696',
  56: '#003366',
  57: '#339966',
  58: '#003300',
  59: '#333300',
  60: '#993300',
  61: '#993366',
  62: '#333399',
  63: '#333333',
  64: '#000000',
  65: '#FFFFFF',
};

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
  return `#${clean}`;
};

export const resolveExcelColor = (
  colorObj?: Partial<ExcelJS.Color> | ExtendedExcelColor,
): string | undefined => {
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
