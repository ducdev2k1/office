const SCHEME_COLOR_MAP: Record<string, string> = {
  tx1: '#000000',
  tx2: '#595959',
  bg1: '#ffffff',
  bg2: '#f2f2f2',
  accent1: '#4472c4',
  accent2: '#ed7d31',
  accent3: '#a5a5a5',
  accent4: '#ffc000',
  accent5: '#5b9bd5',
  accent6: '#70ad47',
  hlink: '#0563c1',
  folHlink: '#954f72',
};

export const parseOoxmlColor = (colorObj?: Record<string, any>): string | undefined => {
  if (!colorObj) return undefined;

  if (colorObj['a:srgbClr']?.['@_val']) {
    const val = String(colorObj['a:srgbClr']['@_val']);
    return val.startsWith('#') ? val : `#${val}`;
  }

  if (colorObj['a:schemeClr']?.['@_val']) {
    const scheme = String(colorObj['a:schemeClr']['@_val']);
    return SCHEME_COLOR_MAP[scheme] || '#0f172a';
  }

  return undefined;
};

export const formatToOoxmlHex = (cssColor?: string, defaultHex = '000000'): string => {
  if (!cssColor) return defaultHex;
  const cleaned = cssColor.replace('#', '').trim();
  if (cleaned.length === 6) return cleaned.toUpperCase();
  if (cleaned.length === 3) {
    return `${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`.toUpperCase();
  }
  return defaultHex;
};
