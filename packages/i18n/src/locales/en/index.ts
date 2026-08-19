import type { TranslationSchema } from '../../types';
import enAppShell from './app-shell.json';
import enCommon from './common.json';
import enDocs from './docs.json';
import enSheets from './sheets.json';
import enSlides from './slides.json';

export const en: TranslationSchema = {
  common: enCommon,
  docs: enDocs,
  sheets: enSheets,
  slides: enSlides,
  appShell: enAppShell,
};

export type EnDictionary = typeof en;
export { enCommon, enDocs, enSheets, enSlides, enAppShell };

