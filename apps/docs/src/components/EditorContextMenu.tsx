import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@office/ui-kit';
import { useRef } from 'react';

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

  if (!position || !editor) return null;

  const items: CtxItem[] = [
    { label: t('contextMenu.undo'), shortcut: 'Ctrl+Z', onClick: () => editor.chain().focus().undo().run() },
    { label: t('contextMenu.redo'), shortcut: 'Ctrl+Y', onClick: () => editor.chain().focus().redo().run() },
    'separator',
    { label: t('contextMenu.cut'), shortcut: 'Ctrl+X', onClick: () => document.execCommand('cut') },
    { label: t('contextMenu.copy'), shortcut: 'Ctrl+C', onClick: () => document.execCommand('copy') },
    { label: t('contextMenu.paste'), shortcut: 'Ctrl+V', onClick: () => document.execCommand('paste') },
    'separator',
    { label: t('contextMenu.paragraph'), onClick: () => editor.chain().focus().setParagraph().run() },
    {
      label: t('contextMenu.heading1'),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: t('contextMenu.heading2'),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    'separator',
    { label: t('contextMenu.bold'), shortcut: 'Ctrl+B', onClick: () => editor.chain().focus().toggleBold().run() },
    {
      label: t('contextMenu.italic'),
      shortcut: 'Ctrl+I',
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: t('contextMenu.underline'),
      shortcut: 'Ctrl+U',
      onClick: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: t('contextMenu.strikethrough'),
      shortcut: 'Ctrl+Shift+X',
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    'separator',
    {
      label: t('contextMenu.bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: t('contextMenu.orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    'separator',
    { label: t('contextMenu.alignLeft'), onClick: () => editor.chain().focus().setTextAlign('left').run() },
    { label: t('contextMenu.alignCenter'), onClick: () => editor.chain().focus().setTextAlign('center').run() },
    { label: t('contextMenu.alignRight'), onClick: () => editor.chain().focus().setTextAlign('right').run() },
    'separator',
    { label: t('contextMenu.insertImage'), onClick: () => imageInputRef.current?.click() },
    { label: t('contextMenu.insertTable'), onClick: onInsertTable },
    { label: t('contextMenu.insertPageBreak'), onClick: onInsertPageBreak },
    'separator',
    { label: t('contextMenu.findAndReplace'), shortcut: 'Ctrl+H', onClick: onToggleFind },
  ];

  const runItem = (item: Extract<CtxItem, { label: string }>) => {
    item.onClick();
    onClose();
  };

  return (
    <ContextMenu open onOpenChange={(open) => !open && onClose()}>
      <ContextMenuContent className="w-60">
        {items.map((item, index) =>
          item === 'separator' ? (
            <ContextMenuSeparator key={`sep-${index}`} />
          ) : (
            <ContextMenuItem
              key={item.label}
              className={item.danger ? 'text-destructive focus:text-destructive' : undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runItem(item)}
            >
              <span className="flex w-full items-center gap-2">
                <span className={item.danger ? 'text-destructive' : undefined}>{item.label}</span>
                {item.shortcut && <kbd className="menu-shortcut ml-auto">{item.shortcut}</kbd>}
              </span>
            </ContextMenuItem>
          ),
        )}
      </ContextMenuContent>
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
    </ContextMenu>
  );
};