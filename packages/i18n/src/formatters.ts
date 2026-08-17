import type { Locale } from './types';

const LOCALE_TAGS: Record<Locale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

export const formatDateTime = (
  date: Date | string | number,
  locale: Locale = 'vi',
  options?: Intl.DateTimeFormatOptions,
): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], defaultOptions).format(d);
};

export const formatRelativeTime = (
  date: Date | string | number,
  locale: Locale = 'vi',
): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';

  const now = Date.now();
  const diffInSeconds = Math.round((d.getTime() - now) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  const rtf = new Intl.RelativeTimeFormat(LOCALE_TAGS[locale], { numeric: 'auto' });

  if (absDiff < 60) {
    return rtf.format(diffInSeconds, 'second');
  }
  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }
  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }
  const diffInDays = Math.round(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  }
  const diffInMonths = Math.round(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, 'month');
  }
  const diffInYears = Math.round(diffInDays / 365);
  return rtf.format(diffInYears, 'year');
};

export const formatNumber = (
  value: number,
  locale: Locale = 'vi',
  options?: Intl.NumberFormatOptions,
): string => {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], options).format(value);
};

export const formatFileSize = (bytes: number, locale: Locale = 'vi'): string => {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const digitGroups = Math.min(Math.floor(Math.log10(bytes) / Math.log10(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, digitGroups);
  const formatted = formatNumber(Number(size.toFixed(digitGroups === 0 ? 0 : 1)), locale);
  return `${formatted} ${units[digitGroups]}`;
};
