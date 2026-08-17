import type { TranslationSchema } from '../../types';
import enAppShell from './app-shell.json';
import enCommon from './common.json';
import enDocs from './docs.json';

export const en: TranslationSchema = {
  common: enCommon,
  docs: enDocs,
  appShell: enAppShell,
};

export type EnDictionary = typeof en;
export { enCommon, enDocs, enAppShell };
