export type FontCategoryId = 'sansSerif' | 'serif' | 'monospace' | 'handwriting' | 'display';

export type FontVariant =
  'Normal' | 'Medium' | 'Semi Bold' | 'Bold' | 'Light' | 'Italic' | 'Bold Italic';

export interface FontItem {
  name: string;
  variants?: FontVariant[];
}

/** Fonts có thể load từ Google Fonts */
export const GOOGLE_FONT_NAMES: Set<string> = new Set([
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Ubuntu',
  'Oswald',
  'Source Sans 3',
  'Noto Sans',
  'Nunito',
  'Merriweather',
  'Playfair Display',
  'EB Garamond',
  'Lora',
  'Arvo',
  'Noto Serif',
  'Vollkorn',
  'Courier Prime',
  'Roboto Mono',
  'Inconsolata',
  'Ubuntu Mono',
  'JetBrains Mono',
  'Share Tech Mono',
  'Dancing Script',
  'Caveat',
  'Pacifico',
  'Satisfy',
  'Great Vibes',
  'Shadows Into Light',
  'Bangers',
  'Lobster',
  'Cinzel',
  'Special Elite',
  'Permanent Marker',
]);

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
      'Helvetica',
      'Verdana',
      'Tahoma',
      'Trebuchet MS',
      'Calibri',
      'Century Gothic',
      'Segoe UI',
      'Roboto',
      'Open Sans',
      'Lato',
      'Montserrat',
      'Poppins',
      'Raleway',
      'Ubuntu',
      'Oswald',
      'Source Sans 3',
      'Noto Sans',
      'Nunito',
    ],
  },
  {
    id: 'serif',
    labelKey: 'fontGroupSerif',
    fonts: [
      'Times New Roman',
      'Georgia',
      'Cambria',
      'Garamond',
      'Book Antiqua',
      'Century Schoolbook',
      'Merriweather',
      'Playfair Display',
      'EB Garamond',
      'Lora',
      'Arvo',
      'Noto Serif',
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
      'Roboto Mono',
      'Inconsolata',
      'Ubuntu Mono',
      'JetBrains Mono',
      'Share Tech Mono',
    ],
  },
  {
    id: 'handwriting',
    labelKey: 'fontGroupHandwriting',
    fonts: [
      'Comic Sans MS',
      'Dancing Script',
      'Caveat',
      'Pacifico',
      'Satisfy',
      'Great Vibes',
      'Shadows Into Light',
    ],
  },
  {
    id: 'display',
    labelKey: 'fontGroupDisplay',
    fonts: ['Bangers', 'Lobster', 'Cinzel', 'Rye', 'Special Elite', 'Permanent Marker'],
  },
];
