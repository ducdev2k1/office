export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'docs-theme';

/** Theme mac dinh = light (user van phong quen giao dien trang). */
export const DEFAULT_THEME: Theme = 'light';

export const getSystemTheme = (): Theme =>
  window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

export const getStoredTheme = (): Theme | null => {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : null;
};

/** Ap dung theme len <html> (class .dark) va luu vao localStorage. */
export const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  localStorage.setItem(STORAGE_KEY, theme);
};

/** Khoi tao theme luc app boot: uu tien stored, con lai mac dinh light. */
export const initTheme = (): Theme => {
  const theme = getStoredTheme() ?? DEFAULT_THEME;
  applyTheme(theme);
  return theme;
};
