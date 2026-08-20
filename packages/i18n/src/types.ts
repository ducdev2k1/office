import type { viAppShell, viCommon, viDocs, viSheets, viSlides } from './locales/vi';

export type Locale = 'vi' | 'en';

export type DeepStringMap<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepStringMap<T[K]> : string;
};

export type CommonDictionary = DeepStringMap<typeof viCommon>;
export type DocsDictionary = DeepStringMap<typeof viDocs>;
export type SheetsDictionary = DeepStringMap<typeof viSheets>;
export type SlidesDictionary = DeepStringMap<typeof viSlides>;
export type AppShellDictionary = DeepStringMap<typeof viAppShell>;

export interface TranslationSchema {
  common: CommonDictionary;
  docs: DocsDictionary;
  sheets: SheetsDictionary;
  slides: SlidesDictionary;
  appShell: AppShellDictionary;
}

export type TranslationNamespace = keyof TranslationSchema;

export type TranslationParams = Record<string, string | number>;

export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationPath = NestedKeyOf<TranslationSchema>;

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: TranslationParams) => string;
  formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string | number) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatFileSize: (bytes: number) => string;
}
