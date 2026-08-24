import type { HeaderMenuActions, MenuAction, MenuItem, SubmenuSpec } from '@/modules/header/types/header.types';
import { buildHeaderMenus } from '@/modules/header/utils/menu.utils';
import { useTranslation } from '@office/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Icon,
  TableGridPicker,
  cn,
} from '@office/ui-kit';
import { useCallback, useMemo, useRef } from 'react';

const isSubmenu = (item: MenuItem): item is SubmenuSpec =>
  typeof item === 'object' && ('items' in item || 'tablePicker' in item);

const renderMenuItemNode = (
  item: MenuItem,
  keyPrefix: string,
  onInsertTable?: (rows?: number, cols?: number) => void,
) => {
  if (item === 'separator') {
    return <DropdownMenuSeparator key={`sep-${keyPrefix}`} />;
  }

  if (isSubmenu(item)) {
    return (
      <DropdownMenuSub key={`sub-${item.label}-${keyPrefix}`}>
        <DropdownMenuSubTrigger disabled={item.disabled}>
          {item.icon ? (
            <Icon name={item.icon} size={15} className="shrink-0 text-muted-foreground" />
          ) : (
            <span className="size-3.5 shrink-0" />
          )}
          <span className="flex-1 truncate">{item.label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className={item.tablePicker ? 'p-1 min-w-auto' : undefined}>
          {item.tablePicker ? (
            <TableGridPicker
              onSelect={(rows, cols) => onInsertTable?.(rows, cols)}
            />
          ) : (
            item.items?.map((subItem, idx) =>
              renderMenuItemNode(subItem, `${keyPrefix}-${idx}`, onInsertTable),
            )
          )}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem
      key={`item-${item.label}-${keyPrefix}`}
      disabled={item.disabled}
      onClick={item.onClick}
      danger={item.danger}
      className={cn(
        'flex items-center gap-2',
        item.checked && 'bg-accent/60 font-medium text-foreground',
      )}
    >
      {item.icon ? (
        <Icon
          name={item.icon}
          size={15}
          className={cn(
            'shrink-0',
            item.danger
              ? 'text-destructive'
              : item.checked
                ? 'text-primary'
                : 'text-muted-foreground',
          )}
        />
      ) : (
        <span className="size-3.5 shrink-0" />
      )}
      <span className={cn('flex-1 truncate', item.danger && 'text-destructive')}>
        {item.label}
      </span>
      {item.checked && (
        <Icon name="check" size={14} className="ml-auto text-primary shrink-0" />
      )}
      {item.shortcut && (
        <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
      )}
    </DropdownMenuItem>
  );
};

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
  onInsertMath,
  onInsertFootnote,
  onInsertColumns,
  onInsertChart,
  onInsertCallout,
  onWatermark,
  onHeaderFooter,
  onWordCount,
  onVnAdmin,
  onHelp,
  isReadOnly = false,
}: HeaderMenuActions) => {
  const { t } = useTranslation('docs');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = useCallback(async () => {
    if (!editor) return;
    const text = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      '\n',
    );
    if (text) await navigator.clipboard.writeText(text);
  }, [editor]);

  const handleCut = useCallback(async () => {
    if (!editor) return;
    await handleCopy();
    editor.chain().focus().deleteSelection().run();
  }, [editor, handleCopy]);

  const handlePaste = useCallback(async () => {
    if (!editor) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) editor.chain().focus().insertContent(text).run();
    } catch {
      /* clipboard permission denied */
    }
  }, [editor]);

  const menus = useMemo(() => {
    return buildHeaderMenus({
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
      onInsertMath,
      onInsertFootnote,
      onInsertColumns,
      onInsertChart,
      onInsertCallout,
      onWatermark,
      onHeaderFooter,
      onWordCount,
      onVnAdmin,
      onHelp,
      isReadOnly,
      docxInputRef,
      imageInputRef,
      t,
      handleCopy,
      handleCut,
      handlePaste,
    });
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
    onInsertMath,
    onInsertFootnote,
    onInsertColumns,
    onInsertChart,
    onInsertCallout,
    onWatermark,
    onHeaderFooter,
    onWordCount,
    onVnAdmin,
    onHelp,
    handleCopy,
    handleCut,
    handlePaste,
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
              renderMenuItemNode(item, `${menu.label}-${index}`, onInsertTable),
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

