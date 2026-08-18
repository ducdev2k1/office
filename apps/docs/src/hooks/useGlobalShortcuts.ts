import { useEffect } from 'react';

export const useGlobalShortcuts = (onToggleFind: () => void, onClosePanels: () => void): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        onToggleFind();
      } else if (event.key === 'Escape') {
        onClosePanels();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onToggleFind, onClosePanels]);
};
