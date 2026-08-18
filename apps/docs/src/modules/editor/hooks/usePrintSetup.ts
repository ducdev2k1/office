import { useEffect } from 'react';
import { DEFAULT_PAGE_SETUP, PAPER_SIZES, type DocRecord } from '@/types/docs.types';

const PRINT_STYLE_ID = 'office-print-page';

export const usePrintSetup = (activeDoc: DocRecord | undefined): void => {
  useEffect(() => {
    const applyPageRule = () => {
      const setup = activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP();
      const paper = PAPER_SIZES[setup.paperSize];
      const { width, height } =
        setup.orientation === 'landscape' ? { width: paper.height, height: paper.width } : paper;

      let style = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement('style');
        style.id = PRINT_STYLE_ID;
        document.head.appendChild(style);
      }
      style.textContent = `@page { size: ${width}mm ${height}mm; margin: 0; }`;
    };

    const removePageRule = () => {
      document.getElementById(PRINT_STYLE_ID)?.remove();
    };

    window.addEventListener('beforeprint', applyPageRule);
    window.addEventListener('afterprint', removePageRule);

    return () => {
      window.removeEventListener('beforeprint', applyPageRule);
      window.removeEventListener('afterprint', removePageRule);
      removePageRule();
    };
  }, [activeDoc?.pageSetup]);
};
