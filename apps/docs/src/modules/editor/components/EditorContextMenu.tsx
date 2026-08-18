import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { cn, Icon } from '@office/ui-kit';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ContextMenuPosition } from '@/modules/editor/types/editor.types';

interface EditorContextMenuProps {
  editor: Editor | null;
  position: ContextMenuPosition | null;
  onClose: () => void;
  onInsertImage: (file: File) => void;
  onInsertTable: () => void;
  onInsertPageBreak: () => void;
  onToggleFind: () => void;
}

interface ContextActionItem {
  label: string;
  icon: string;
  shortcut?: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}

export const EditorContextMenu = ({
  editor,
  position,
  onClose,
  onInsertImage,
  onInsertTable,
  onInsertPageBreak,
  onToggleFind,
}: EditorContextMenuProps) => {
  const { t } = useTranslation('docs');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<ContextMenuPosition>({
    x: position?.x ?? 0,
    y: position?.y ?? 0,
  });

  useLayoutEffect(() => {
    if (!position) return;
    const el = menuRef.current;
    const width = el?.offsetWidth ?? 230;
    const height = el?.offsetHeight ?? 420;
    const pad = 8;

    let x = position.x;
    let y = position.y;

    if (x + width > window.innerWidth - pad) {
      x = Math.max(pad, window.innerWidth - width - pad);
    }
    if (y + height > window.innerHeight - pad) {
      y = Math.max(pad, window.innerHeight - height - pad);
    }
    setCoords({ x, y });
  }, [position]);

  useEffect(() => {
    if (!position) return;
    const handleOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, [position, onClose]);

  if (!position || !editor) return null;

  const inTable = editor.isActive('table');
  const hasSelection = !editor.state.selection.empty;

  const handleCopy = async () => {
    const text = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      '\n',
    );
    if (text) await navigator.clipboard.writeText(text);
    onClose();
  };

  const handleCut = async () => {
    await handleCopy();
    editor.chain().focus().deleteSelection().run();
    onClose();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) editor.chain().focus().insertContent(text).run();
    } catch {
      /* clipboard permission denied */
    }
    onClose();
  };

  const runAndClose = (action: () => void) => {
    action();
    onClose();
  };

  const clipboardGroup: ContextActionItem[] = [
    {
      label: t('contextMenu.cut'),
      icon: 'scissors',
      shortcut: 'Ctrl+X',
      active: hasSelection,
      onClick: () => handleCut(),
    },
    {
      label: t('contextMenu.copy'),
      icon: 'copy',
      shortcut: 'Ctrl+C',
      active: hasSelection,
      onClick: () => handleCopy(),
    },
    {
      label: t('contextMenu.paste'),
      icon: 'clipboard',
      shortcut: 'Ctrl+V',
      onClick: () => handlePaste(),
    },
  ];

  const formatGroup: ContextActionItem[] = [
    {
      label: t('format.bold'),
      icon: 'bold',
      shortcut: 'Ctrl+B',
      active: editor.isActive('bold'),
      onClick: () => runAndClose(() => editor.chain().focus().toggleBold().run()),
    },
    {
      label: t('format.italic'),
      icon: 'italic',
      shortcut: 'Ctrl+I',
      active: editor.isActive('italic'),
      onClick: () => runAndClose(() => editor.chain().focus().toggleItalic().run()),
    },
    {
      label: t('format.underline'),
      icon: 'underline',
      shortcut: 'Ctrl+U',
      active: editor.isActive('underline'),
      onClick: () => runAndClose(() => editor.chain().focus().toggleUnderline().run()),
    },
  ];

  const insertGroup: ContextActionItem[] = [
    {
      label: t('menu.insert.image'),
      icon: 'image',
      onClick: () => imageInputRef.current?.click(),
    },
    {
      label: t('menu.insert.table'),
      icon: 'table',
      onClick: () => runAndClose(onInsertTable),
    },
    {
      label: t('menu.insert.pageBreak'),
      icon: 'separator-horizontal',
      shortcut: 'Ctrl+Enter',
      onClick: () => runAndClose(onInsertPageBreak),
    },
    {
      label: t('menu.edit.findAndReplace'),
      icon: 'search',
      shortcut: 'Ctrl+H',
      onClick: () => runAndClose(onToggleFind),
    },
  ];

  const tableGroup: ContextActionItem[] = inTable
    ? [
        {
          label: t('toolbar.addRowBelow'),
          icon: 'rows-3',
          onClick: () => runAndClose(() => editor.chain().focus().addRowAfter().run()),
        },
        {
          label: t('toolbar.addColumnRight'),
          icon: 'columns-3',
          onClick: () => runAndClose(() => editor.chain().focus().addColumnAfter().run()),
        },
        {
          label: t('toolbar.deleteRow'),
          icon: 'trash-2',
          danger: true,
          onClick: () => runAndClose(() => editor.chain().focus().deleteRow().run()),
        },
        {
          label: t('toolbar.deleteColumn'),
          icon: 'trash-2',
          danger: true,
          onClick: () => runAndClose(() => editor.chain().focus().deleteColumn().run()),
        },
        {
          label: t('toolbar.deleteTable'),
          icon: 'table',
          danger: true,
          onClick: () => runAndClose(() => editor.chain().focus().deleteTable().run()),
        },
      ]
    : [];

  return (
    <>
      <div
        ref={menuRef}
        className="c-menu_ctx"
        style={{ position: 'fixed', left: `${coords.x}px`, top: `${coords.y}px` }}
        role="menu"
        aria-label="Editor context menu"
      >
        {clipboardGroup.map((item) => (
          <button
            key={item.label}
            type="button"
            className="c-menu_ctx-item"
            onClick={item.onClick}
          >
            <Icon name={item.icon} size={15} />
            <span>{item.label}</span>
            {item.shortcut && <kbd className="c-menu_ctx-kbd">{item.shortcut}</kbd>}
          </button>
        ))}
        <div className="c-menu_ctx-sep" />
        {formatGroup.map((item) => (
          <button
            key={item.label}
            type="button"
            className={cn('c-menu_ctx-item', item.active && 'is-active bg-accent font-medium')}
            onClick={item.onClick}
          >
            <Icon name={item.icon} size={15} />
            <span>{item.label}</span>
            {item.shortcut && <kbd className="c-menu_ctx-kbd">{item.shortcut}</kbd>}
          </button>
        ))}
        <div className="c-menu_ctx-sep" />
        {insertGroup.map((item) => (
          <button
            key={item.label}
            type="button"
            className="c-menu_ctx-item"
            onClick={item.onClick}
          >
            <Icon name={item.icon} size={15} />
            <span>{item.label}</span>
            {item.shortcut && <kbd className="c-menu_ctx-kbd">{item.shortcut}</kbd>}
          </button>
        ))}
        {tableGroup.length > 0 && (
          <>
            <div className="c-menu_ctx-sep" />
            {tableGroup.map((item) => (
              <button
                key={item.label}
                type="button"
                className={cn('c-menu_ctx-item', item.danger && 'is-danger text-destructive')}
                onClick={item.onClick}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </button>
            ))}
          </>
        )}
      </div>
      <input
        ref={imageInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onInsertImage(file);
            onClose();
          }
          event.target.value = '';
        }}
      />
    </>
  );
};
