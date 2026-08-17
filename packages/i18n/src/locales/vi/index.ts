import viAppShell from './app-shell.json';
import viCommon from './common.json';
import viDocs from './docs.json';

export const vi = {
  common: viCommon,
  docs: viDocs,
  appShell: viAppShell,
} as const;

export type ViDictionary = typeof vi;
export { viCommon, viDocs, viAppShell };
