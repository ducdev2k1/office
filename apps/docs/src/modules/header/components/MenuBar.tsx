import { useMemo, useRef } from 'react';
import type { HeaderMenuActions, MenuAction, MenuSpec } from '@/modules/header/types/header.types';
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

const MenuItemRow = ({ item }: { item: MenuAction }) => (
  <span className="flex w-full items-center gap-2">
    <span className="flex w-4 shrink-0 items-center justify-center">
      {item.checked && <Icon name="check" className="size-3.5" />}
    </span>
    <span className={item.danger ? 'text-destructive' : undefined}>{item.label}</span>
    {item.shortcut && (
      <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground leading-none">
        {item.shortcut}
      </kbd>
    )}
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
        label: t('format.label'),
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
          toggleMark('bold', t('format.bold'), 'Ctrl+B'),
          toggleMark('italic', t('format.italic'), 'Ctrl+I'),
          toggleMark('underline', t('format.underline'), 'Ctrl+U'),
          toggleMark('strike', t('format.strikethrough'), 'Ctrl+Shift+X'),
          'separator',
          {
            label: t('format.subscript'),
            onClick: () => editor?.chain().focus().toggleSubscript().run(),
          },
          {
            label: t('format.superscript'),
            onClick: () => editor?.chain().focus().toggleSuperscript().run(),
          },
          'separator',
          {
            label: t('format.bulletList'),
            checked: editor?.isActive('bulletList') ?? false,
            onClick: () => editor?.chain().focus().toggleBulletList().run(),
          },
          {
            label: t('format.orderedList'),
            checked: editor?.isActive('orderedList') ?? false,
            onClick: () => editor?.chain().focus().toggleOrderedList().run(),
          },
          'separator',
          {
            label: t('format.alignLeft'),
            checked: editor?.isActive({ textAlign: 'left' }) ?? false,
            onClick: () => editor?.chain().focus().setTextAlign('left').run(),
          },
          {
            label: t('format.alignCenter'),
            checked: editor?.isActive({ textAlign: 'center' }) ?? false,
            onClick: () => editor?.chain().focus().setTextAlign('center').run(),
          },
          {
            label: t('format.alignRight'),
            checked: editor?.isActive({ textAlign: 'right' }) ?? false,
            onClick: () => editor?.chain().focus().setTextAlign('right').run(),
          },
        ],
      },
      {
        label: t('menu.tools.label'),
        items: [
          { label: `${t('menu.tools.wordCount')}: ${wordCount}`, disabled: true, onClick: () => undefined },
          { label: `Ký tự: ${charCount}`, disabled: true, onClick: () => undefined },
          'separator',
          { label: t('menu.tools.shortcuts'), onClick: onHelp },
        ],
      },
      {
        label: t('menu.help.label'),
        items: [{ label: t('menu.help.shortcuts'), shortcut: 'F1', onClick: onHelp }],
      },
    ];
  }, [editor, viewMode, canDelete, wordCount, charCount, onNewDoc, onToggleSidebar, onPageSetup, onPrint, onExportHtml, onExportText, onDelete, onToggleFind, onViewModeChange, onInsertTable, onInsertPageBreak, onHelp, t]);

  return (
    <div className="flex items-center gap-0.5 h-6" role="menubar" aria-label="Menu bar">
      {menus.map((menu) => (
        <DropdownMenu key={menu.label}>
          <DropdownMenuTrigger
            className="inline-flex items-center gap-1 h-6 px-2 text-xs font-normal rounded text-foreground/80 hover:text-foreground hover:bg-hover transition-colors"
            render={<Button variant="ghost" size="sm" />}
          >
            {menu.label}
            <Icon name="chevron-down" className="size-3 opacity-60 transition-transform" />
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
      <Button
        className="inline-flex items-center gap-1 h-6 px-2 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-full ml-1.5"
        variant="ghost"
        size="sm"
        type="button"
      >
        <Icon name="sparkles" className="size-3.5" /> Gemini
      </Button>
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
    </div>
  );
};
