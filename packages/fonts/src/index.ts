export type FontStyleProperties = {
  fontFamily: string;
  fontWeight?: number | string;
  fontStyle?: string;
};

export type FontCategoryId = 'sansSerif' | 'serif' | 'monospace' | 'handwriting' | 'display';

export type FontVariant =
  | 'Normal'
  | 'Medium'
  | 'Semi Bold'
  | 'Bold'
  | 'Light'
  | 'Italic'
  | 'Bold Italic';

export interface FontItem {
  name: string;
  variants?: FontVariant[];
}

export interface FontCategory {
  id: FontCategoryId;
  labelKey: string;
  fonts: string[];
}

export const FONT_CATEGORIES: FontCategory[] = [
  {
    id: 'sansSerif',
    labelKey: 'fontGroupSansSerif',
    fonts: [
      'Arial',
      'Arial Black',
      'Calibri',
      'Century Gothic',
      'Comfortaa',
      'Helvetica',
      'Inter',
      'Lato',
      'Lexend',
      'Montserrat',
      'Noto Sans',
      'Nunito',
      'Open Sans',
      'Oswald',
      'Poppins',
      'Raleway',
      'Roboto',
      'Segoe UI',
      'Source Sans 3',
      'Tahoma',
      'Trebuchet MS',
      'Ubuntu',
      'Verdana',
    ],
  },
  {
    id: 'serif',
    labelKey: 'fontGroupSerif',
    fonts: [
      'Times New Roman',
      'Arvo',
      'Book Antiqua',
      'Cambria',
      'Century Schoolbook',
      'EB Garamond',
      'Garamond',
      'Georgia',
      'Lora',
      'Merriweather',
      'Noto Serif',
      'Playfair Display',
      'Roboto Serif',
      'Spectral',
      'Vollkorn',
    ],
  },
  {
    id: 'monospace',
    labelKey: 'fontGroupMonospace',
    fonts: [
      'Courier New',
      'Consolas',
      'Courier Prime',
      'Inconsolata',
      'JetBrains Mono',
      'Roboto Mono',
      'Share Tech Mono',
      'Ubuntu Mono',
    ],
  },
  {
    id: 'handwriting',
    labelKey: 'fontGroupHandwriting',
    fonts: [
      'Amatic SC',
      'Caveat',
      'Comic Sans MS',
      'Dancing Script',
      'Great Vibes',
      'Pacifico',
      'Satisfy',
      'Shadows Into Light',
    ],
  },
  {
    id: 'display',
    labelKey: 'fontGroupDisplay',
    fonts: [
      'Bangers',
      'Cinzel',
      'Impact',
      'Lobster',
      'Permanent Marker',
      'Rye',
      'Special Elite',
    ],
  },
];

/**
 * Trả về CSS Properties chuẩn xác cho từng loại font để hiển thị đúng typeface (kèm fallback & font-weight chuẩn).
 */
export const getFontFamilyCSS = (fontName: string): FontStyleProperties => {
  switch (fontName) {
    case 'Arial Black':
      return {
        fontFamily: '"Arial Black", "Arial", "Impact", sans-serif',
        fontWeight: 900,
      };
    case 'Impact':
      return {
        fontFamily: '"Impact", "Arial Black", sans-serif',
        fontWeight: 900,
      };
    case 'Amatic SC':
      return {
        fontFamily: '"Amatic SC", cursive, sans-serif',
        fontWeight: 700,
      };
    case 'Comic Sans MS':
      return {
        fontFamily: '"Comic Sans MS", "Comic Neue", cursive, sans-serif',
      };
    case 'Courier New':
      return {
        fontFamily: '"Courier New", "Courier Prime", Courier, monospace',
      };
    case 'Times New Roman':
      return {
        fontFamily: '"Times New Roman", "Noto Serif", Times, serif',
      };
    case 'Trebuchet MS':
      return {
        fontFamily: '"Trebuchet MS", "Ubuntu", sans-serif',
      };
    case 'Verdana':
      return {
        fontFamily: '"Verdana", "DejaVu Sans", sans-serif',
      };
    case 'Tahoma':
      return {
        fontFamily: '"Tahoma", "Segoe UI", sans-serif',
      };
    case 'Helvetica':
      return {
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      };
    case 'Calibri':
      return {
        fontFamily: '"Calibri", "Carlito", "Open Sans", sans-serif',
      };
    case 'Century Gothic':
      return {
        fontFamily: '"Century Gothic", "TeX Gyre Adventor", "Montserrat", sans-serif',
      };
    case 'Segoe UI':
      return {
        fontFamily: '"Segoe UI", "Ubuntu", "Roboto", sans-serif',
      };
    case 'Georgia':
      return {
        fontFamily: '"Georgia", "Merriweather", serif',
      };
    case 'Garamond':
    case 'EB Garamond':
      return {
        fontFamily: '"EB Garamond", "Garamond", serif',
      };
    case 'Book Antiqua':
    case 'Century Schoolbook':
      return {
        fontFamily: `"${fontName}", "Noto Serif", serif`,
      };
    case 'Consolas':
      return {
        fontFamily: '"Consolas", "Roboto Mono", monospace',
      };
    case 'Caveat':
    case 'Dancing Script':
    case 'Great Vibes':
    case 'Pacifico':
    case 'Satisfy':
    case 'Shadows Into Light':
      return {
        fontFamily: `"${fontName}", cursive, sans-serif`,
      };
    case 'Bangers':
    case 'Lobster':
    case 'Cinzel':
    case 'Permanent Marker':
    case 'Special Elite':
    case 'Rye':
      return {
        fontFamily: `"${fontName}", cursive, sans-serif`,
      };
    case 'Arvo':
    case 'Lora':
    case 'Merriweather':
    case 'Noto Serif':
    case 'Playfair Display':
    case 'Roboto Serif':
    case 'Spectral':
    case 'Vollkorn':
      return {
        fontFamily: `"${fontName}", "Noto Serif", serif`,
      };
    case 'Courier Prime':
    case 'Inconsolata':
    case 'JetBrains Mono':
    case 'Roboto Mono':
    case 'Share Tech Mono':
    case 'Ubuntu Mono':
      return {
        fontFamily: `"${fontName}", monospace`,
      };
    default:
      return {
        fontFamily: `"${fontName}", sans-serif`,
      };
  }
};
