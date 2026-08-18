import { useEffect } from 'react';
import { DEFAULT_PAGE_SETUP, PAPER_SIZES, type DocRecord } from '@/types';

export const usePrintSetup = (activeDoc: DocRecord | undefined): void => {
  useEffect(() => {
    const beforePrint = () => {
      const setup = activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP();
      const paper = PAPER_SIZES[setup.paperSize];
      const { width, height } =
        setup.orientation === 'landscape' ? { width: paper.height, height: paper.width } : paper;
      const { top, right, bottom, left } = setup.margins;
      const root = document.documentElement;
      root.style.setProperty('--print-size', `${width}mm ${height}mm`);
      root.style.setProperty('--print-margin', `${top}mm ${right}mm ${bottom}mm ${left}mm`);
    };
    window.addEventListener('beforeprint', beforePrint);
    return () => window.removeEventListener('beforeprint', beforePrint);
  }, [activeDoc?.pageSetup]);
};
