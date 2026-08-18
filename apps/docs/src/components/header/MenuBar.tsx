import type { ViewMode } from '@/editor/use-pagination';
import { useTranslation } from '@office/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import { useMemo, useRef } from 'react';

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

const MenuItemRow = ({ item }: { item: MenuAction }) => (
  <span className="flex w-full items-center gap-2">
    <span className="flex w-4 shrink-0 items-center justify-center">
      {item.checked && <Icon name="check" className="size-3.5" />}
    </span>
    <span className={item.danger ? 'text-destructive' : undefined}>{item.label}</span>
    {item.shortcut && <kbd className="menu-shortcut ml-auto">{item.shortcut}</kbd>}
  </span>
);

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
  const { t } = useTranslation('docs');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const menus = useMemo<MenuSpec[]>(() => {
    const toggleMark = (name: string, label: string, shortcut: string): MenuAction => ({
      label,
      shortcut,
      checked: editor?.isActive(name) ?? false,
      onClick: () => editor?.chain().focus().toggleMark(name).run(),
    });

    return [
      {
        label: t('menu.file.label'),
        items: [
          { label: t('menu.file.newDoc'), onClick: onNewDoc },
          { label: t('menu.file.openList'), onClick: onToggleSidebar },
          'separator',
          { label: t('menu.file.pageSetup'), onClick: onPageSetup },
          { label: t('menu.file.print'), shortcut: 'Ctrl+P', onClick: onPrint },
          'separator',
          { label: t('menu.file.exportHtml'), onClick: onExportHtml },
          { label: t('menu.file.exportTxt'), onClick: onExportText },
          'separator',
          {
            label: t('menu.file.deleteDoc'),
            danger: true,
            disabled: !canDelete,
            onClick: onDelete,
          },
        ],
      },
      {
        label: t('menu.edit.label'),
        items: [
          {
            label: t('menu.edit.undo'),
            shortcut: 'Ctrl+Z',
            onClick: () => editor?.chain().focus().undo().run(),
          },
          {
            label: t('menu.edit.redo'),
            shortcut: 'Ctrl+Y',
            onClick: () => editor?.chain().focus().redo().run(),
          },
          'separator',
          { label: t('menu.edit.findAndReplace'), shortcut: 'Ctrl+H', onClick: onToggleFind },
        ],
      },
      {
        label: t('menu.view.label'),
        items: [
          {
            label: viewMode === 'paged' ? t('menu.view.continuousMode') : t('menu.view.pagedMode'),
            checked: viewMode === 'paged',
            onClick: () => onViewModeChange(viewMode === 'paged' ? 'continuous' : 'paged'),
          },
          { label: t('menu.file.pageSetup'), onClick: onPageSetup },
        ],
      },
      {
        label: t('menu.insert.label'),
        items: [
          { label: t('menu.insert.image'), onClick: () => imageInputRef.current?.click() },
          { label: t('menu.insert.table'), onClick: onInsertTable },
          {
            label: t('menu.insert.horizontalRule'),
            onClick: () => editor?.chain().focus().setHorizontalRule().run(),
          },
          {
            label: t('menu.insert.pageBreak'),
            shortcut: 'Ctrl+Enter',
            onClick: onInsertPageBreak,
          },
        ],
      },
      {
        label: t('menu.format.label'),
        items: [
          {
            label: t('toolbar.normalText'),
            checked: editor?.isActive('paragraph') ?? false,
            onClick: () => editor?.chain().focus().setParagraph().run(),
          },
          {
            label: t('toolbar.heading1'),
            shortcut: 'Ctrl+Alt+1',
            checked: editor?.isActive('heading', { level: 1 }) ?? false,
            onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
          },
          {
            label: t('toolbar.heading2'),
            shortcut: 'Ctrl+Alt+2',
            checked: editor?.isActive('heading', { level: 2 }) ?? false,
            onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
          },
          'separator',
          toggleMark('bold', t('menu.format.bold'), 'Ctrl+B'),
          toggleMark('italic', t('menu.format.italic'), 'Ctrl+I'),
          toggleMark('underline', t('menu.format.underline'), 'Ctrl+U'),
          toggleMark('strike', t('menu.format.strikethrough'), 'Ctrl+Shift+X'),
          'separator',
          {
            label: t('menu.format.subscript'),
            onClick: () => editor?.chain().focus().toggleSubscript().run(),
          },
          {
            label: t('menu.format.superscript'),
            onClick: () => editor?.chain().focus().toggleSuperscript().run(),
          },
          'separator',
          {
            label: t('menu.format.bulletList'),
            checked: editor?.isActive('bulletList') ?? false,
            onClick: () => editor?.chain().focus().toggleBulletList().run(),
          },
          {
            label: t('menu.format.orderedList'),
            checked: editor?.isActive('orderedList') ?? false,
            onClick: () => editor?.chain().focus().toggleOrderedList().run(),
          },
          'separator',
          {
            label: t('menu.format.alignLeft'),
            checked: editor?.isActive({ textAlign: 'left' }) ?? false,
            onClick: () => editor?.chain().focus().setTextAlign('left').run(),
          },
          {
            label: t('menu.format.alignCenter'),
            checked: editor?.isActive({ textAlign: 'center' }) ?? false,
            onClick: () => editor?.chain().focus().setTextAlign('center').run(),
          },
          {
            label: t('menu.format.alignRight'),
            checked: editor?.isActive({ textAlign: 'right' }) ?? false,
            onClick: () => editor?.chain().focus().setTextAlign('right').run(),
          },
        ],
      },
      {
        label: t('menu.tools.label'),
        items: [
          {
            label: `${t('menu.tools.wordCount')}: ${wordCount}`,
            disabled: true,
            onClick: () => undefined,
          },
          {
            label: `${t('menu.tools.characterCount')}: ${charCount}`,
            disabled: true,
            onClick: () => undefined,
          },
          'separator',
          { label: t('menu.tools.shortcuts'), onClick: onHelp },
        ],
      },
      {
        label: t('menu.help.label'),
        items: [{ label: t('menu.help.shortcuts'), shortcut: 'F1', onClick: onHelp }],
      },
    ];
  }, [
    editor,
    viewMode,
    canDelete,
    wordCount,
    charCount,
    onNewDoc,
    onToggleSidebar,
    onPageSetup,
    onPrint,
    onExportHtml,
    onExportText,
    onDelete,
    onToggleFind,
    onViewModeChange,
    onInsertTable,
    onInsertPageBreak,
    onHelp,
    t,
  ]);

  return (
    <div className="menu-row" role="menubar" aria-label={t('menu.ariaLabel')}>
      {menus.map((menu) => (
        <DropdownMenu key={menu.label}>
          <DropdownMenuTrigger
            className="menu-trigger"
            render={<Button variant="ghost" size="sm" />}
          >
            {menu.label}
            <Icon name="chevron-down" className="menu-chevron" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={2}>
            {menu.items.map((item, index) =>
              item === 'separator' ? (
                <DropdownMenuSeparator key={`sep-${index}`} />
              ) : (
                <DropdownMenuItem
                  key={item.label}
                  disabled={item.disabled}
                  onClick={item.onClick}
                  className={item.danger ? 'text-destructive focus:text-destructive' : undefined}
                >
                  <MenuItemRow item={item} />
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
      <Button className="gemini-menu" variant="ghost" size="sm" type="button">
        <Icon name="sparkles" /> Gemini
      </Button>
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
