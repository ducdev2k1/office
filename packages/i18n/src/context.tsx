import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { en } from './locales/en';
import { vi } from './locales/vi';
import {
  formatDateTime as baseFormatDateTime,
  formatFileSize as baseFormatFileSize,
  formatNumber as baseFormatNumber,
  formatRelativeTime as baseFormatRelativeTime,
} from './formatters';
import type {
  I18nContextValue,
  Locale,
  TranslationNamespace,
  TranslationParams,
  TranslationPath,
  TranslationSchema,
} from './types';

const STORAGE_KEY = 'office_locale';
const DEFAULT_LOCALE: Locale = 'vi';

const DICTIONARIES: Record<Locale, TranslationSchema> = {
  vi,
  en,
};

const resolveValue = (
  dict: Record<string, unknown>,
  path: string,
): string | undefined => {
  const segments = path.split('.');
  let current: unknown = dict;

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
};

const interpolate = (template: string, params?: TranslationParams): string => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
};

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'vi' || saved === 'en') return saved;
  } catch {
    // Ignore localStorage access errors
  }
  return DEFAULT_LOCALE;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export const I18nProvider = ({
  children,
  defaultLocale,
}: I18nProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(() => defaultLocale ?? getInitialLocale());

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      localStorage.setItem(STORAGE_KEY, nextLocale);
      document.documentElement.lang = nextLocale;
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useCallback(
    (path: string, params?: TranslationParams): string => {
      const activeSchema = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
      const fallbackSchema = DICTIONARIES[DEFAULT_LOCALE];

      const currentDict = activeSchema as unknown as Record<string, unknown>;
      const fallbackDict = fallbackSchema as unknown as Record<string, unknown>;

      const resolved = resolveValue(currentDict, path) ?? resolveValue(fallbackDict, path);

      if (resolved !== undefined) {
        return interpolate(resolved, params);
      }

      return path;
    },
    [locale],
  );

  const formatDateTime = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      baseFormatDateTime(date, locale, options),
    [locale],
  );

  const formatRelativeTime = useCallback(
    (date: Date | string | number) => baseFormatRelativeTime(date, locale),
    [locale],
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      baseFormatNumber(value, locale, options),
    [locale],
  );

  const formatFileSize = useCallback(
    (bytes: number) => baseFormatFileSize(bytes, locale),
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      formatDateTime,
      formatRelativeTime,
      formatNumber,
      formatFileSize,
    }),
    [locale, setLocale, t, formatDateTime, formatRelativeTime, formatNumber, formatFileSize],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const useTranslation = (namespace?: TranslationNamespace) => {
  const context = useI18n();

  const scopedT = useCallback(
    (key: string, params?: TranslationParams): string => {
      const fullPath = namespace ? `${namespace}.${key}` : key;
      return context.t(fullPath, params);
    },
    [context, namespace],
  );

  return {
    ...context,
    t: scopedT,
  };
};
