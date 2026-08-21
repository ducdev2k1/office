import type { Theme } from '@/types/common.types';
import { useEffect, useState } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('sheets-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    // Apply .dark for app shell (Header, Toolbar, Inspector sidebar, Modals)
    document.documentElement.classList.toggle('dark', theme === 'dark');
    // Ensure .univer-dark is never applied to keep spreadsheet canvas always in clean light mode
    document.documentElement.classList.remove('univer-dark');
    localStorage.setItem('sheets-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme, setTheme };
};


