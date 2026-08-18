import { useState, useCallback, useMemo } from 'react';
import { FONT_CATEGORIES } from '@office/fonts';

const RECENT_FONTS_KEY = 'docs_recent_fonts';
const MAX_RECENT = 5;

const loadRecentFonts = (): string[] => {
  try {
    const saved = localStorage.getItem(RECENT_FONTS_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
};

const saveRecentFonts = (fonts: string[]) => {
  try {
    localStorage.setItem(RECENT_FONTS_KEY, JSON.stringify(fonts));
  } catch {
    // ignore
  }
};

/** Tất cả font names được flatten từ FONT_CATEGORIES */
const ALL_FONTS: string[] = FONT_CATEGORIES.flatMap((cat) => cat.fonts);

export const useFontPicker = (currentFont: string) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recentFonts, setRecentFonts] = useState<string[]>(loadRecentFonts);
  const [hoveredFont, setHoveredFont] = useState<string | null>(null);

  const filteredFonts = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return ALL_FONTS.filter((f) => f.toLowerCase().includes(q));
  }, [search]);

  const addToRecent = useCallback((font: string) => {
    setRecentFonts((prev) => {
      const filtered = prev.filter((f) => f !== font);
      const next = [font, ...filtered].slice(0, MAX_RECENT);
      saveRecentFonts(next);
      return next;
    });
  }, []);

  const handleSelectFont = useCallback(
    (font: string, onSelect: (font: string) => void) => {
      onSelect(font);
      addToRecent(font);
      setOpen(false);
      setSearch('');
      setHoveredFont(null);
    },
    [addToRecent],
  );

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch('');
      setHoveredFont(null);
    }
  }, []);

  return {
    open,
    search,
    recentFonts,
    hoveredFont,
    filteredFonts,
    currentFont,
    setSearch,
    setHoveredFont,
    handleSelectFont,
    handleOpenChange,
  };
};
