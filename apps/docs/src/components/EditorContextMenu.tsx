import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { cn, Icon } from '@office/ui-kit';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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

interface MenuItem {
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!position || !editor) return null;

  const sections: MenuItem[][] = [
    // 1. History & Clipboard
    [
      {
        label: t('contextMenu.undo'),
        icon: 'undo',
        shortcut: 'Ctrl+Z',
        onClick: () => editor.chain().focus().undo().run(),
      },
      {
        label: t('contextMenu.redo'),
        icon: 'redo',
        shortcut: 'Ctrl+Y',
        onClick: () => editor.chain().focus().redo().run(),
      },
      {
        label: t('contextMenu.cut'),
        icon: 'scissors',
        shortcut: 'Ctrl+X',
        onClick: () => document.execCommand('cut'),
      },
      {
        label: t('contextMenu.copy'),
        icon: 'copy',
        shortcut: 'Ctrl+C',
        onClick: () => document.execCommand('copy'),
      },
      {
        label: t('contextMenu.paste'),
        icon: 'clipboard-paste',
        shortcut: 'Ctrl+V',
        onClick: async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (text) {
              editor.chain().focus().insertContent(text).run();
              return;
            }
          } catch {
            // fallback
          }
          document.execCommand('paste');
        },
      },
    ],
    // 2. Text Formatting
    [
      {
        label: t('contextMenu.bold'),
        icon: 'bold',
        shortcut: 'Ctrl+B',
        active: editor.isActive('bold'),
        onClick: () => editor.chain().focus().toggleBold().run(),
      },
      {
        label: t('contextMenu.italic'),
        icon: 'italic',
        shortcut: 'Ctrl+I',
        active: editor.isActive('italic'),
        onClick: () => editor.chain().focus().toggleItalic().run(),
      },
      {
        label: t('contextMenu.underline'),
        icon: 'underline',
        shortcut: 'Ctrl+U',
        active: editor.isActive('underline'),
        onClick: () => editor.chain().focus().toggleUnderline().run(),
      },
      {
        label: t('contextMenu.strikethrough'),
        icon: 'strikethrough',
        shortcut: 'Ctrl+Shift+X',
        active: editor.isActive('strike'),
        onClick: () => editor.chain().focus().toggleStrike().run(),
      },
    ],
    // 3. Paragraph & Headings
    [
      {
        label: t('contextMenu.paragraph'),
        icon: 'pilcrow',
        active: editor.isActive('paragraph'),
        onClick: () => editor.chain().focus().setParagraph().run(),
      },
      {
        label: t('contextMenu.heading1'),
        icon: 'heading-1',
        shortcut: 'Ctrl+Alt+1',
        active: editor.isActive('heading', { level: 1 }),
        onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        label: t('contextMenu.heading2'),
        icon: 'heading-2',
        shortcut: 'Ctrl+Alt+2',
        active: editor.isActive('heading', { level: 2 }),
        onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
    ],
    // 4. Lists & Alignment
    [
      {
        label: t('contextMenu.bulletList'),
        icon: 'list',
        shortcut: 'Ctrl+Shift+7',
        active: editor.isActive('bulletList'),
        onClick: () => editor.chain().focus().toggleBulletList().run(),
      },
      {
        label: t('contextMenu.orderedList'),
        icon: 'list-ordered',
        shortcut: 'Ctrl+Shift+8',
        active: editor.isActive('orderedList'),
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
      },
      {
        label: t('contextMenu.alignLeft'),
        icon: 'align-left',
        active: editor.isActive({ textAlign: 'left' }),
        onClick: () => editor.chain().focus().setTextAlign('left').run(),
      },
      {
        label: t('contextMenu.alignCenter'),
        icon: 'align-center',
        active: editor.isActive({ textAlign: 'center' }),
        onClick: () => editor.chain().focus().setTextAlign('center').run(),
      },
      {
        label: t('contextMenu.alignRight'),
        icon: 'align-right',
        active: editor.isActive({ textAlign: 'right' }),
        onClick: () => editor.chain().focus().setTextAlign('right').run(),
      },
    ],
    // 5. Insert Objects
    [
      {
        label: t('contextMenu.insertImage'),
        icon: 'image-plus',
        onClick: () => imageInputRef.current?.click(),
      },
      {
        label: t('contextMenu.insertTable'),
        icon: 'table',
        onClick: onInsertTable,
      },
      {
        label: t('contextMenu.insertPageBreak'),
        icon: 'separator-horizontal',
        onClick: onInsertPageBreak,
      },
    ],
    // 6. Search & Replace
    [
      {
        label: t('contextMenu.findAndReplace'),
        icon: 'search',
        shortcut: 'Ctrl+H',
        onClick: onToggleFind,
      },
    ],
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-transparent"
        onClick={onClose}
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      />
      <div
        ref={menuRef}
        role="menu"
        aria-label={t('contextMenu.ariaLabel')}
        className="fixed z-50 min-w-56 max-h-[min(480px,85vh)] overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg backdrop-blur-sm"
        style={{
          left: `${coords.x}px`,
          top: `${coords.y}px`,
        }}
      >
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {sIdx > 0 && <div className="-mx-1 my-1 h-px bg-muted" />}
            {section.map((item) => (
              <button
                key={item.label}
                type="button"
                className={cn(
                  'group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                  item.active && 'bg-accent/60 font-medium text-accent-foreground',
                  item.danger && 'text-destructive hover:bg-destructive/10 hover:text-destructive',
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
              >
                <Icon
                  name={item.icon}
                  size={15}
                  className="shrink-0 text-muted-foreground group-hover:text-foreground"
                  aria-hidden="true"
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <kbd className="ml-auto font-mono text-[10px] text-muted-foreground/70 group-hover:text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      <input
        ref={imageInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onInsertImage(file);
          event.target.value = '';
        }}
      />
    </>
  );
};