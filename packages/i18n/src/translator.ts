import { en } from './locales/en';
import { vi } from './locales/vi';
import type { Locale, TranslationParams, TranslationSchema } from './types';

export const LOCALE_STORAGE_KEY = 'office_locale';
export const DEFAULT_LOCALE: Locale = 'vi';

export const DICTIONARIES: Record<Locale, TranslationSchema> = { vi, en };

/** Đọc chuỗi theo đường dẫn dạng "namespace.group.key" */
export const resolveValue = (dict: Record<string, unknown>, path: string): string | undefined => {
  let current: unknown = dict;

  for (const segment of path.split('.')) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
};

/** Thay các placeholder dạng {name} bằng giá trị tương ứng */
export const interpolate = (template: string, params?: TranslationParams): string => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match,
  );
};

/**
 * Dịch một chuỗi ngoài vòng đời React (service, seed data, util thuần).
 * Trả về chính `path` khi không tìm thấy để lỗi thiếu key dễ phát hiện.
 */
export const translate = (locale: Locale, path: string, params?: TranslationParams): string => {
  const active = (DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE]) as unknown as Record<
    string,
    unknown
  >;
  const fallback = DICTIONARIES[DEFAULT_LOCALE] as unknown as Record<string, unknown>;
  const resolved = resolveValue(active, path) ?? resolveValue(fallback, path);

  return resolved === undefined ? path : interpolate(resolved, params);
};

/** Ngôn ngữ đang lưu trong localStorage; dùng cho code không truy cập được context */
export const getStoredLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'vi' || saved === 'en') return saved;
  } catch {
    // Bỏ qua lỗi truy cập localStorage (chế độ riêng tư, quota...)
  }
  return DEFAULT_LOCALE;
};
