import { Extension, type Editor } from '@tiptap/core';

export interface ShortcutStorage {
  onFocusFontPicker: (() => void) | null;
  onFocusColorPicker: (() => void) | null;
  onSetLink: (() => void) | null;
}

declare module '@tiptap/core' {
  interface Storage {
    keyboardShortcuts: ShortcutStorage;
  }
}

const readFontSizePx = (editor: Editor): number => {
  const current = editor.getAttributes('textStyle').fontSize as string | undefined;
  return current ? parseInt(current, 10) || 16 : 16;
};

export const keyboardShortcuts = Extension.create({
  name: 'keyboardShortcuts',

  addStorage(): ShortcutStorage {
    return { onFocusFontPicker: null, onFocusColorPicker: null, onSetLink: null };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
      'Mod-Shift-z': () => this.editor.commands.redo(),
      'Mod-Shift->': () => this.editor.commands.setFontSize(`${readFontSizePx(this.editor) + 2}px`),
      'Mod-Shift-<': () =>
        this.editor.commands.setFontSize(`${Math.max(8, readFontSizePx(this.editor) - 2)}px`),
      'Mod-Shift-5': () => this.editor.commands.toggleSubscript(),
      'Mod-Shift-6': () => this.editor.commands.toggleSuperscript(),
      'Mod-Alt-7': () => {
        this.editor.storage.keyboardShortcuts?.onFocusColorPicker?.();
        return true;
      },
      'Mod-Shift-f': () => {
        this.editor.storage.keyboardShortcuts?.onFocusFontPicker?.();
        return true;
      },
      'Mod-k': () => {
        this.editor.storage.keyboardShortcuts?.onSetLink?.();
        return true;
      },
    };
  },
});
