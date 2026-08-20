import { useEffect } from 'react';

interface SlideShortcutsOptions {
  enabled?: boolean;
  hasSelectedElement?: boolean;
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
  onDeleteElement?: () => void;
  onDuplicateElement?: () => void;
  onEscape?: () => void;
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
  hasSelectedElement = false,
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
  onDeleteElement,
  onDuplicateElement,
  onEscape,
}: SlideShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const isEditing = isEditableTarget(e.target);

      // 1. Present Shortcuts (F5, Ctrl+F5, Cmd/Ctrl+Enter)
      if (e.key === 'F5' || (isCmdOrCtrl && e.key === 'Enter')) {
        e.preventDefault();
        onPresent();
        return;
      }

      // 2. Escape: Deselect element or exit mode
      if (e.key === 'Escape') {
        if (hasSelectedElement && onEscape) {
          e.preventDefault();
          onEscape();
          return;
        }
      }

      // 3. Undo / Redo Shortcuts
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

      // 4. Prevent browser default Ctrl+S
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return;
      }

      // 5. Clipboard shortcuts when not editing text
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

      // If user is typing inside text input / textarea, don't hijack editing keys
      if (isEditing) return;

      // 6. Delete handling: If an element is selected, delete that element; otherwise delete slide
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (hasSelectedElement && onDeleteElement) {
          onDeleteElement();
        } else {
          onDeleteSlide();
        }
        return;
      }

      // 7. Duplicate handling: If an element is selected, duplicate that element; otherwise duplicate slide
      if (isCmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (hasSelectedElement && onDuplicateElement) {
          onDuplicateElement();
        } else {
          onDuplicateSlide();
        }
        return;
      }

      // 8. Add slide
      if (isCmdOrCtrl && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onAddSlide();
        return;
      }

      // 9. Slide Navigation: ONLY when NO element is selected (when element is selected, arrow keys nudge the element)
      if (!hasSelectedElement) {
        if (
          e.key === 'ArrowDown' ||
          e.key === 'ArrowRight' ||
          e.key === 'PageDown' ||
          e.key === 'j' ||
          e.key === 'n'
        ) {
          e.preventDefault();
          onNextSlide();
          return;
        }

        if (
          e.key === 'ArrowUp' ||
          e.key === 'ArrowLeft' ||
          e.key === 'PageUp' ||
          e.key === 'k' ||
          e.key === 'p'
        ) {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    hasSelectedElement,
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
    onDeleteElement,
    onDuplicateElement,
    onEscape,
  ]);
};
