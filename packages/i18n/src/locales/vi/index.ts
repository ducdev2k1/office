import viAppShell from './app-shell.json';
import viCommon from './common.json';
import viDocs from './docs.json';
import viSheets from './sheets.json';

export const vi = {
  common: viCommon,
  docs: viDocs,
  sheets: viSheets,
  appShell: viAppShell,
} as const;

export type ViDictionary = typeof vi;
export { viCommon, viDocs, viSheets, viAppShell };
