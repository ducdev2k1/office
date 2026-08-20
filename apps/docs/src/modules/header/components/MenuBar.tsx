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
import { useMemo, useRef } from 'react';

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
  onOpenFromDevice,
  onToggleSidebar,
  onToggleFind,
  onPageSetup,
  onViewModeChange,
  onPrint,
  onExportDocx,
  onExportMarkdown,
  onExportPdf,
  onExportHtml,
  onExportText,
  onDelete,
  onInsertImage,
  onInsertTable,
  onInsertPageBreak,
  onInsertSectionBreak,
  onInsertBookmark,
  onWatermark,
  onHeaderFooter,
  onHelp,
  isReadOnly = false,
}: HeaderMenuActions) => {
  const { t } = useTranslation('docs');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  const menus = useMemo<MenuSpec[]>(() => {
    const toggleMark = (name: string, label: string, shortcut: string): MenuAction => ({
      label,
      shortcut,
      checked: editor?.isActive(name) ?? false,
      disabled: isReadOnly,
      onClick: () => editor?.chain().focus().toggleMark(name).run(),
    });

    return [
      {
        label: t('menu.file.label'),
        items: [
          { label: t('menu.file.newDoc'), onClick: onNewDoc },
          { label: t('menu.file.openFromDevice'), onClick: () => docxInputRef.current?.click() },
          { label: t('menu.file.openList'), onClick: onToggleSidebar },
          'separator',
          { label: t('menu.file.pageSetup'), onClick: onPageSetup },
          { label: t('menu.file.print'), shortcut: 'Ctrl+P', onClick: onPrint },
          'separator',
          { label: t('menu.file.exportDocx'), onClick: onExportDocx ?? onExportHtml },
          { label: t('menu.file.exportMarkdown'), onClick: onExportMarkdown ?? onExportText },
          { label: t('menu.file.exportPdf'), onClick: onExportPdf ?? onPrint },
          { label: t('menu.file.exportHtml'), onClick: onExportHtml },
          { label: t('menu.file.exportTxt'), onClick: onExportText },
          'separator',
          {
            label: t('menu.file.deleteDoc'),
            danger: true,
            disabled: !canDelete || isReadOnly,
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
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().undo().run(),
          },
          {
            label: t('menu.edit.redo'),
            shortcut: 'Ctrl+Y',
            disabled: isReadOnly,
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
          {
            label: t('menu.insert.image'),
            disabled: isReadOnly,
            onClick: () => imageInputRef.current?.click(),
          },
          { label: t('menu.insert.table'), disabled: isReadOnly, onClick: onInsertTable },
          {
            label: t('menu.insert.horizontalRule'),
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().setHorizontalRule().run(),
          },
          {
            label: t('menu.insert.pageBreak'),
            shortcut: 'Ctrl+Enter',
            disabled: isReadOnly,
            onClick: onInsertPageBreak,
          },
          {
            label: t('menu.insert.sectionBreak'),
            disabled: isReadOnly,
            onClick: () => onInsertSectionBreak?.(),
          },
          {
            label: t('menu.insert.bookmark'),
            disabled: isReadOnly,
            onClick: () => onInsertBookmark?.(),
          },
          'separator',
          {
            label: t('menu.insert.watermark'),
            onClick: () => onWatermark?.(),
          },
          {
            label: t('menu.insert.headerFooter'),
            disabled: isReadOnly,
            onClick: () => onHeaderFooter?.(),
          },
        ],
      },
      {
        label: t('menu.format.label'),
        items: [
          {
            label: t('toolbar.normalText'),
            checked: editor?.isActive('paragraph') ?? false,
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().setParagraph().run(),
          },
          {
            label: t('toolbar.heading1'),
            shortcut: 'Ctrl+Alt+1',
            checked: editor?.isActive('heading', { level: 1 }) ?? false,
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
          },
          {
            label: t('toolbar.heading2'),
            shortcut: 'Ctrl+Alt+2',
            checked: editor?.isActive('heading', { level: 2 }) ?? false,
            disabled: isReadOnly,
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
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().toggleSubscript().run(),
          },
          {
            label: t('menu.format.superscript'),
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().toggleSuperscript().run(),
          },
          'separator',
          {
            label: t('menu.format.bulletList'),
            checked: editor?.isActive('bulletList') ?? false,
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().toggleBulletList().run(),
          },
          {
            label: t('menu.format.orderedList'),
            checked: editor?.isActive('orderedList') ?? false,
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().toggleOrderedList().run(),
          },
          'separator',
          {
            label: t('menu.format.alignLeft'),
            checked: editor?.isActive({ textAlign: 'left' }) ?? false,
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().setTextAlign('left').run(),
          },
          {
            label: t('menu.format.alignCenter'),
            checked: editor?.isActive({ textAlign: 'center' }) ?? false,
            disabled: isReadOnly,
            onClick: () => editor?.chain().focus().setTextAlign('center').run(),
          },
          {
            label: t('menu.format.alignRight'),
            checked: editor?.isActive({ textAlign: 'right' }) ?? false,
            disabled: isReadOnly,
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
  }, [
    editor,
    editor?.state,
    viewMode,
    canDelete,
    wordCount,
    charCount,
    isReadOnly,
    onNewDoc,
    onOpenFromDevice,
    onToggleSidebar,
    onPageSetup,
    onPrint,
    onExportDocx,
    onExportMarkdown,
    onExportPdf,
    onExportHtml,
    onExportText,
    onDelete,
    onToggleFind,
    onViewModeChange,
    onInsertTable,
    onInsertPageBreak,
    onInsertSectionBreak,
    onInsertBookmark,
    onWatermark,
    onHeaderFooter,
    onHelp,
    t,
  ]);

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
      <input
        ref={docxInputRef}
        className="hidden"
        type="file"
        accept=".docx,.txt,.html,.htm,.md"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onOpenFromDevice(file);
          event.target.value = '';
        }}
      />
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
