import viAppShell from './app-shell.json';
import viCommon from './common.json';
import viDocs from './docs.json';
import viSheets from './sheets.json';
import viSlides from './slides.json';

export const vi = {
  common: viCommon,
  docs: viDocs,
  sheets: viSheets,
  slides: viSlides,
  appShell: viAppShell,
} as const;

export type ViDictionary = typeof vi;
export { viCommon, viDocs, viSheets, viSlides, viAppShell };
