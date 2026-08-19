import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  formatDateTime as baseFormatDateTime,
  formatFileSize as baseFormatFileSize,
  formatNumber as baseFormatNumber,
  formatRelativeTime as baseFormatRelativeTime,
} from './formatters';
import { LOCALE_STORAGE_KEY, getStoredLocale, translate } from './translator';
import type {
  I18nContextValue,
  Locale,
  TranslationNamespace,
  TranslationParams,
} from './types';

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export const I18nProvider = ({ children, defaultLocale }: I18nProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(() => defaultLocale ?? getStoredLocale());

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
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
    (path: string, params?: TranslationParams): string => translate(locale, path, params),
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
    (value: number, options?: Intl.NumberFormatOptions) => baseFormatNumber(value, locale, options),
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
