import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  Icon,
} from '@office/ui-kit';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ContextMenuPosition } from '@/modules/editor/types/editor.types';

interface EditorContextMenuProps {
  editor: Editor | null;
  position: ContextMenuPosition | null;
  onClose: () => void;
  onInsertImage: (file: File) => void;
  onInsertTable: () => void;
  onInsertPageBreak: () => void;
  onToggleFind: () => void;
  onAddComment?: () => void;
  isReadOnly?: boolean;
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
  onAddComment,
  isReadOnly = false,
}: EditorContextMenuProps) => {
  const { t } = useTranslation('docs');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isOpen = position !== null && editor !== null;

  const virtualAnchor = useMemo(
    () =>
      position
        ? {
            getBoundingClientRect: () => ({
              x: position.x,
              y: position.y,
              width: 0,
              height: 0,
              top: position.y,
              right: position.x,
              bottom: position.y,
              left: position.x,
              toJSON: () => {},
            }),
          }
        : undefined,
    [position?.x, position?.y],
  );

  const inTable = editor?.isActive('table') ?? false;
  const inImage = editor?.isActive('imageResize') ?? false;
  const hasSelection = editor ? !editor.state.selection.empty : false;
  const isViewOnly = isReadOnly || !editor?.isEditable;

  const handleCopy = useCallback(async () => {
    if (!editor) return;
    const text = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      '\n',
    );
    if (text) await navigator.clipboard.writeText(text);
    onClose();
  }, [editor, onClose]);

  const handleCut = useCallback(async () => {
    if (!editor) return;
    await handleCopy();
    editor.chain().focus().deleteSelection().run();
    onClose();
  }, [editor, handleCopy, onClose]);

  const handlePaste = useCallback(async () => {
    if (!editor) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) editor.chain().focus().insertContent(text).run();
    } catch {
      /* clipboard permission denied */
    }
    onClose();
  }, [editor, onClose]);

  const runAndClose = useCallback(
    (action: () => void) => {
      action();
      onClose();
    },
    [onClose],
  );

  const renderMenuItems = (items: ContextActionItem[]) =>
    items.map((item) => (
      <ContextMenuItem
        key={item.label}
        danger={item.danger}
        className={item.active ? 'bg-accent font-medium text-primary' : undefined}
        onClick={item.onClick}
      >
        <Icon name={item.icon} size={15} />
        <span className="flex-1">{item.label}</span>
        {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
      </ContextMenuItem>
    ));

  const clipboardItems: ContextActionItem[] = isViewOnly
    ? [
        {
          label: t('contextMenu.copy'),
          icon: 'copy',
          shortcut: 'Ctrl+C',
          active: hasSelection,
          onClick: () => handleCopy(),
        },
        {
          label: t('contextMenu.selectAll'),
          icon: 'check-square',
          shortcut: 'Ctrl+A',
          onClick: () =>
            runAndClose(() => editor!.chain().focus().selectAll().run()),
        },
        {
          label: t('menu.edit.findAndReplace'),
          icon: 'search',
          shortcut: 'Ctrl+H',
          onClick: () => runAndClose(onToggleFind),
        },
      ]
    : [
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
        ...(hasSelection && onAddComment
          ? [
              {
                label: 'Bình luận',
                icon: 'message-square',
                onClick: () => runAndClose(onAddComment),
              },
            ]
          : []),
      ];

  const formatItems: ContextActionItem[] = [
    {
      label: t('contextMenu.bold'),
      icon: 'bold',
      shortcut: 'Ctrl+B',
      active: editor?.isActive('bold'),
      onClick: () =>
        runAndClose(() => editor!.chain().focus().toggleBold().run()),
    },
    {
      label: t('contextMenu.italic'),
      icon: 'italic',
      shortcut: 'Ctrl+I',
      active: editor?.isActive('italic'),
      onClick: () =>
        runAndClose(() => editor!.chain().focus().toggleItalic().run()),
    },
    {
      label: t('contextMenu.underline'),
      icon: 'underline',
      shortcut: 'Ctrl+U',
      active: editor?.isActive('underline'),
      onClick: () =>
        runAndClose(() => editor!.chain().focus().toggleUnderline().run()),
    },
  ];

  const insertItems: ContextActionItem[] = [
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

  const tableItems: ContextActionItem[] = [
    {
      label: t('toolbar.addRowBelow'),
      icon: 'rows-3',
      onClick: () =>
        runAndClose(() => editor!.chain().focus().addRowAfter().run()),
    },
    {
      label: t('toolbar.addColumnRight'),
      icon: 'columns-3',
      onClick: () =>
        runAndClose(() => editor!.chain().focus().addColumnAfter().run()),
    },
    {
      label: t('toolbar.deleteRow'),
      icon: 'trash-2',
      danger: true,
      onClick: () =>
        runAndClose(() => editor!.chain().focus().deleteRow().run()),
    },
    {
      label: t('toolbar.deleteColumn'),
      icon: 'trash-2',
      danger: true,
      onClick: () =>
        runAndClose(() => editor!.chain().focus().deleteColumn().run()),
    },
    {
      label: t('toolbar.deleteTable'),
      icon: 'table',
      danger: true,
      onClick: () =>
        runAndClose(() => editor!.chain().focus().deleteTable().run()),
    },
  ];

  const imageItems: ContextActionItem[] = [
    {
      label: t('toolbar.alignLeft'),
      icon: 'align-left',
      onClick: () =>
        runAndClose(() => editor!.chain().focus().setImageAlign('left').run()),
    },
    {
      label: t('toolbar.alignCenter'),
      icon: 'align-center',
      onClick: () =>
        runAndClose(() =>
          editor!.chain().focus().setImageAlign('center').run(),
        ),
    },
    {
      label: t('toolbar.alignRight'),
      icon: 'align-right',
      onClick: () =>
        runAndClose(() =>
          editor!.chain().focus().setImageAlign('right').run(),
        ),
    },
    {
      label: t('toolbar.deleteImage'),
      icon: 'trash-2',
      danger: true,
      onClick: () =>
        runAndClose(() => editor!.chain().focus().deleteImage().run()),
    },
  ];

  if (!editor) return null;

  return (
    <>
      <ContextMenu open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <ContextMenuContent anchor={virtualAnchor}>
          {renderMenuItems(clipboardItems)}
          {(!isViewOnly || inTable || inImage) && <ContextMenuSeparator />}
          {!isViewOnly && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Icon name="type" size={15} />
                <span>{t('menu.format.label')}</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {renderMenuItems(formatItems)}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          {!isViewOnly && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Icon name="plus" size={15} />
                <span>{t('menu.insert.label')}</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {renderMenuItems(insertItems)}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          {inTable && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Icon name="table" size={15} />
                <span>{t('menu.insert.table')}</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {renderMenuItems(tableItems)}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          {inImage && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Icon name="image" size={15} />
                <span>{t('menu.insert.image')}</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {renderMenuItems(imageItems)}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
        </ContextMenuContent>
      </ContextMenu>
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
