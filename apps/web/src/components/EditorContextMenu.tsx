import type { Editor } from '@tiptap/core';
import { useEffect, useRef } from 'react';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

interface EditorContextMenuProps {
  editor: Editor | null;
  position: ContextMenuPosition | null;
  onClose: () => void;
  onInsertImage: (file: File) => void;
  onInsertTable: () => void;
  onInsertPageBreak: () => void;
  onToggleFind: () => void;
}

type CtxItem =
  | { label: string; shortcut?: string; danger?: boolean; onClick: () => void }
  | 'separator';

const MENU_WIDTH = 250;
const MENU_HEIGHT = 440;

export const EditorContextMenu = ({
  editor,
  position,
  onClose,
  onInsertImage,
  onInsertTable,
  onInsertPageBreak,
  onToggleFind,
}: EditorContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!position) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onScroll = (): void => onClose();
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [position, onClose]);

  if (!position || !editor) return null;

  const x = Math.min(position.x, window.innerWidth - MENU_WIDTH);
  const y = Math.min(position.y, window.innerHeight - MENU_HEIGHT);

  const items: CtxItem[] = [
    { label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => editor.chain().focus().undo().run() },
    { label: 'Redo', shortcut: 'Ctrl+Y', onClick: () => editor.chain().focus().redo().run() },
    'separator',
    { label: 'Cat', shortcut: 'Ctrl+X', onClick: () => document.execCommand('cut') },
    { label: 'Sao chep', shortcut: 'Ctrl+C', onClick: () => document.execCommand('copy') },
    { label: 'Dan', shortcut: 'Ctrl+V', onClick: () => document.execCommand('paste') },
    'separator',
    { label: 'Doan van', onClick: () => editor.chain().focus().setParagraph().run() },
    {
      label: 'Heading 1',
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: 'Heading 2',
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    'separator',
    { label: 'Bold', shortcut: 'Ctrl+B', onClick: () => editor.chain().focus().toggleBold().run() },
    {
      label: 'Italic',
      shortcut: 'Ctrl+I',
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'Underline',
      shortcut: 'Ctrl+U',
      onClick: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: 'Gach ngang',
      shortcut: 'Ctrl+Shift+X',
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    'separator',
    {
      label: 'Danh sach gach dau dau',
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Danh sach danh so',
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    'separator',
    { label: 'Can trai', onClick: () => editor.chain().focus().setTextAlign('left').run() },
    { label: 'Can giua', onClick: () => editor.chain().focus().setTextAlign('center').run() },
    { label: 'Can phai', onClick: () => editor.chain().focus().setTextAlign('right').run() },
    'separator',
    { label: 'Chen anh', onClick: () => imageInputRef.current?.click() },
    { label: 'Chen bang', onClick: onInsertTable },
    { label: 'Chen page break', onClick: onInsertPageBreak },
    'separator',
    { label: 'Tim kiem va thay the', shortcut: 'Ctrl+H', onClick: onToggleFind },
  ];

  return (
    <div
      ref={menuRef}
      className="context-menu"
      role="menu"
      aria-label="Menu chuot phai"
      style={{ left: x, top: y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.map((item, index) =>
        item === 'separator' ? (
          <div className="dropdown-separator" key={`sep-${index}`} />
        ) : (
          <button
            type="button"
            role="menuitem"
            className={`dropdown-item${item.danger ? ' danger' : ''}`}
            key={item.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            <span className="dropdown-item-label">{item.label}</span>
            {item.shortcut && <kbd className="menu-shortcut">{item.shortcut}</kbd>}
          </button>
        ),
      )}
      <input
        ref={imageInputRef}
        className="hidden-file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onInsertImage(file);
          event.target.value = '';
        }}
      />
    </div>
  );
};