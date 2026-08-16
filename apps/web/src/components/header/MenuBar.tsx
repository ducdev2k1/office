import type { Editor } from '@tiptap/core';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ViewMode } from '../../editor/use-pagination';

export interface MenuAction {
  label: string;
  shortcut?: string;
  danger?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export type MenuItem = MenuAction | 'separator';

export interface MenuSpec {
  label: string;
  items: MenuItem[];
}

export interface HeaderMenuActions {
  editor: Editor | null;
  viewMode: ViewMode;
  canDelete: boolean;
  wordCount: number;
  charCount: number;
  onNewDoc: () => void;
  onToggleSidebar: () => void;
  onToggleFind: () => void;
  onPageSetup: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onPrint: () => void;
  onExportHtml: () => void;
  onExportText: () => void;
  onDelete: () => void;
  onInsertImage: (file: File) => void;
  onInsertTable: () => void;
  onInsertPageBreak: () => void;
  onHelp: () => void;
}

export const MenuBar = ({
  editor,
  viewMode,
  canDelete,
  wordCount,
  charCount,
  onNewDoc,
  onToggleSidebar,
  onToggleFind,
  onPageSetup,
  onViewModeChange,
  onPrint,
  onExportHtml,
  onExportText,
  onDelete,
  onInsertImage,
  onInsertTable,
  onInsertPageBreak,
  onHelp,
}: HeaderMenuActions) => {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!openLabel) return;
    const onPointerDown = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) setOpenLabel(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenLabel(null);
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openLabel]);

  const close = (): void => setOpenLabel(null);
  const run = (action: () => void): void => {
    action();
    close();
  };

  const menus = useMemo<MenuSpec[]>(() => {
    const toggleMark = (name: string, shortcut: string): MenuAction => ({
      label: name,
      shortcut,
      checked: editor?.isActive(name) ?? false,
      onClick: () => run(() => editor?.chain().focus().toggleMark(name).run()),
    });

    return [
      {
        label: 'File',
        items: [
          { label: 'Tai lieu moi', onClick: () => run(onNewDoc) },
          { label: 'Mo danh sach tai lieu', onClick: () => run(onToggleSidebar) },
          'separator',
          { label: 'Cau hinh trang', onClick: () => run(onPageSetup) },
          { label: 'In tai lieu', shortcut: 'Ctrl+P', onClick: () => run(onPrint) },
          'separator',
          { label: 'Export HTML', onClick: () => run(onExportHtml) },
          { label: 'Export TXT', onClick: () => run(onExportText) },
          'separator',
          {
            label: 'Xoa tai lieu',
            danger: true,
            disabled: !canDelete,
            onClick: () => run(onDelete),
          },
        ],
      },
      {
        label: 'Edit',
        items: [
          { label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => run(() => editor?.chain().focus().undo().run()) },
          { label: 'Redo', shortcut: 'Ctrl+Y', onClick: () => run(() => editor?.chain().focus().redo().run()) },
          'separator',
          { label: 'Tim kiem va thay the', shortcut: 'Ctrl+H', onClick: () => run(onToggleFind) },
        ],
      },
      {
        label: 'View',
        items: [
          {
            label: viewMode === 'paged' ? 'Che do lien tuc' : 'Che do phan trang',
            checked: viewMode === 'paged',
            onClick: () => run(() => onViewModeChange(viewMode === 'paged' ? 'continuous' : 'paged')),
          },
          { label: 'Cau hinh trang', onClick: () => run(onPageSetup) },
        ],
      },
      {
        label: 'Insert',
        items: [
          { label: 'Chen anh', onClick: () => run(() => imageInputRef.current?.click()) },
          { label: 'Chen bang', onClick: () => run(onInsertTable) },
          { label: 'Chen duong ke ngang', onClick: () => run(() => editor?.chain().focus().setHorizontalRule().run()) },
          { label: 'Chen page break', shortcut: 'Ctrl+Enter', onClick: () => run(onInsertPageBreak) },
        ],
      },
      {
        label: 'Format',
        items: [
          {
            label: 'Doan van',
            checked: editor?.isActive('paragraph') ?? false,
            onClick: () => run(() => editor?.chain().focus().setParagraph().run()),
          },
          {
            label: 'Heading 1',
            shortcut: 'Ctrl+Alt+1',
            checked: editor?.isActive('heading', { level: 1 }) ?? false,
            onClick: () => run(() => editor?.chain().focus().toggleHeading({ level: 1 }).run()),
          },
          {
            label: 'Heading 2',
            shortcut: 'Ctrl+Alt+2',
            checked: editor?.isActive('heading', { level: 2 }) ?? false,
            onClick: () => run(() => editor?.chain().focus().toggleHeading({ level: 2 }).run()),
          },
          'separator',
          toggleMark('bold', 'Ctrl+B'),
          toggleMark('italic', 'Ctrl+I'),
          toggleMark('underline', 'Ctrl+U'),
          toggleMark('strike', 'Ctrl+Shift+X'),
          'separator',
          { label: 'Chi so duoi', onClick: () => run(() => editor?.chain().focus().toggleSubscript().run()) },
          { label: 'Chi so tren', onClick: () => run(() => editor?.chain().focus().toggleSuperscript().run()) },
          'separator',
          {
            label: 'Danh sach gach dau dau',
            checked: editor?.isActive('bulletList') ?? false,
            onClick: () => run(() => editor?.chain().focus().toggleBulletList().run()),
          },
          {
            label: 'Danh sach danh so',
            checked: editor?.isActive('orderedList') ?? false,
            onClick: () => run(() => editor?.chain().focus().toggleOrderedList().run()),
          },
          'separator',
          {
            label: 'Can trai',
            checked: editor?.isActive({ textAlign: 'left' }) ?? false,
            onClick: () => run(() => editor?.chain().focus().setTextAlign('left').run()),
          },
          {
            label: 'Can giua',
            checked: editor?.isActive({ textAlign: 'center' }) ?? false,
            onClick: () => run(() => editor?.chain().focus().setTextAlign('center').run()),
          },
          {
            label: 'Can phai',
            checked: editor?.isActive({ textAlign: 'right' }) ?? false,
            onClick: () => run(() => editor?.chain().focus().setTextAlign('right').run()),
          },
        ],
      },
      {
        label: 'Tools',
        items: [
          { label: `So tu: ${wordCount}`, disabled: true, onClick: () => undefined },
          { label: `So ky tu: ${charCount}`, disabled: true, onClick: () => undefined },
          'separator',
          { label: 'Bang phim tat', onClick: () => run(onHelp) },
        ],
      },
      {
        label: 'Help',
        items: [{ label: 'Bang phim tat', shortcut: 'F1', onClick: () => run(onHelp) }],
      },
    ];
  }, [editor, viewMode, canDelete, wordCount, charCount]);

  return (
    <div ref={barRef} className="menu-row" role="menubar" aria-label="Menu tai lieu">
      {menus.map((menu) => (
        <div className="dropdown-root" role="none" key={menu.label}>
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={openLabel === menu.label}
            onClick={() => setOpenLabel(openLabel === menu.label ? null : menu.label)}
          >
            {menu.label}
            <ChevronDown aria-hidden="true" className="menu-chevron" />
          </button>
          {openLabel === menu.label && (
            <div className="dropdown-panel" role="menu">
              {menu.items.map((item, index) =>
                item === 'separator' ? (
                  <div className="dropdown-separator" key={`sep-${index}`} />
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    className={`dropdown-item${item.danger ? ' danger' : ''}`}
                    disabled={item.disabled}
                    key={item.label}
                    onClick={item.onClick}
                  >
                    <span className="dropdown-item-label">
                      {item.checked && <span className="dropdown-check" aria-hidden="true">✓</span>}
                      {item.label}
                    </span>
                    {item.shortcut && <kbd className="menu-shortcut">{item.shortcut}</kbd>}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
      <button className="gemini-menu" type="button">
        <Sparkles aria-hidden="true" /> Gemini
      </button>
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