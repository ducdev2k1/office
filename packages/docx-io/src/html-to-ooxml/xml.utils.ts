export const escapeXml = (unsafe: string): string =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const colorToHex = (color: string): string | null => {
  const trimmed = color.trim().toLowerCase();
  if (trimmed.startsWith('#')) {
    const raw = trimmed.slice(1);
    if (raw.length === 3) {
      return `${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toUpperCase();
    }
    if (raw.length === 6) {
      return raw.toUpperCase();
    }
  }

  const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1] ?? '0', 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2] ?? '0', 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3] ?? '0', 10).toString(16).padStart(2, '0');
    return `${r}${g}${b}`.toUpperCase();
  }

  const namedColors: Record<string, string> = {
    red: 'FF0000',
    blue: '0000FF',
    green: '008000',
    yellow: 'FFFF00',
    black: '000000',
    white: 'FFFFFF',
    gray: '808080',
    orange: 'FFA500',
    purple: '800080',
  };

  return namedColors[trimmed] ?? null;
};

export const ptToHalfPt = (pt: number): number => Math.round(pt * 2);

export const pxToHalfPt = (px: number): number => Math.round((px * 72) / 96 * 2);

export const pxToEmu = (px: number): number => Math.round(px * 9525);

export const parseInlineStyles = (styleStr: string): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!styleStr) return result;

  const declarations = styleStr.split(';');
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx !== -1) {
      const prop = decl.slice(0, colonIdx).trim().toLowerCase();
      const val = decl.slice(colonIdx + 1).trim();
      if (prop && val) {
        result[prop] = val;
      }
    }
  }
  return result;
};
