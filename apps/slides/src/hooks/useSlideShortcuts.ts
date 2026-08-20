import { useEffect } from 'react';

interface SlideShortcutsOptions {
  enabled?: boolean;
  onPresent: () => void;
  onAddSlide: () => void;
  onDuplicateSlide: () => void;
  onDeleteSlide: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  onFirstSlide: () => void;
  onLastSlide: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
}

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable ||
    target.getAttribute('contenteditable') === 'true'
  );
};

export const useSlideShortcuts = ({
  enabled = true,
  onPresent,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onNextSlide,
  onPrevSlide,
  onFirstSlide,
  onLastSlide,
  onUndo,
  onRedo,
  onCopy,
  onCut,
  onPaste,
}: SlideShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const isEditing = isEditableTarget(e.target);

      // 1. Present Shortcuts (F5, Ctrl+F5, Cmd/Ctrl+Enter, Ctrl+Shift+F5)
      if (e.key === 'F5' || (isCmdOrCtrl && e.key === 'Enter')) {
        e.preventDefault();
        onPresent();
        return;
      }

      // 2. Undo / Redo Shortcuts (Works in both editor and slide list)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        if (!isEditing) {
          e.preventDefault();
          if (e.shiftKey) {
            onRedo();
          } else {
            onUndo();
          }
          return;
        }
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'y' && !isEditing) {
        e.preventDefault();
        onRedo();
        return;
      }

      // 3. Prevent browser default Ctrl+S
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return;
      }

      // 4. Clipboard shortcuts when not editing text
      if (!isEditing) {
        if (isCmdOrCtrl && e.key.toLowerCase() === 'c' && onCopy) {
          e.preventDefault();
          onCopy();
          return;
        }
        if (isCmdOrCtrl && e.key.toLowerCase() === 'x' && onCut) {
          e.preventDefault();
          onCut();
          return;
        }
        if (isCmdOrCtrl && e.key.toLowerCase() === 'v' && onPaste) {
          e.preventDefault();
          onPaste();
          return;
        }
      }

      // If user is typing inside text input, don't hijack editing keys
      if (isEditing) return;

      // 5. Slide / Element Manipulation
      if (isCmdOrCtrl && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onAddSlide();
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicateSlide();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteSlide();
        return;
      }

      // 6. Slide Navigation (Google Slides style)
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'j' || e.key === 'n') {
        e.preventDefault();
        onNextSlide();
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'k' || e.key === 'p') {
        e.preventDefault();
        onPrevSlide();
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        onFirstSlide();
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        onLastSlide();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    onPresent,
    onAddSlide,
    onDuplicateSlide,
    onDeleteSlide,
    onNextSlide,
    onPrevSlide,
    onFirstSlide,
    onLastSlide,
    onUndo,
    onRedo,
    onCopy,
    onCut,
    onPaste,
  ]);
};
