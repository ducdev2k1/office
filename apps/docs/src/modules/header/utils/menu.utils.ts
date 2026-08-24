import type {
  HeaderMenuActions,
  MenuAction,
  MenuSpec,
} from '@/modules/header/types/header.types';
import type { RefObject } from 'react';

interface BuildMenuOptions extends HeaderMenuActions {
  docxInputRef: RefObject<HTMLInputElement | null>;
  imageInputRef: RefObject<HTMLInputElement | null>;
  t: (key: string, values?: Record<string, string | number>) => string;
  handleCopy: () => void;
  handleCut: () => void;
  handlePaste: () => void;
}

export const buildHeaderMenus = ({
  editor,
  viewMode,
  canDelete,
  isReadOnly = false,
  docxInputRef,
  imageInputRef,
  t,
  onNewDoc,
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
}: BuildMenuOptions): MenuSpec[] => {
  const toggleMark = (name: string, labelKey: string, icon: string, shortcut?: string): MenuAction => ({
    label: t(labelKey),
    icon,
    shortcut,
    checked: editor?.isActive(name) ?? false,
    disabled: isReadOnly,
    onClick: () => editor?.chain().focus().toggleMark(name).run(),
  });

  return [
    {
      label: t('menu.file.label'),
      items: [
        {
          label: t('menu.file.newDoc'),
          icon: 'file-plus',
          onClick: onNewDoc,
        },
        {
          label: t('menu.file.openFromDevice'),
          icon: 'folder-open',
          onClick: () => docxInputRef.current?.click(),
        },
        {
          label: t('menu.file.openList'),
          icon: 'sidebar',
          onClick: onToggleSidebar,
        },
        {
          label: t('menu.file.download'),
          icon: 'download',
          items: [
            {
              label: t('menu.file.exportDocx'),
              icon: 'file-text',
              onClick: onExportDocx ?? onExportHtml,
            },
            {
              label: t('menu.file.exportPdf'),
              icon: 'printer',
              onClick: onExportPdf ?? onPrint,
            },
            {
              label: t('menu.file.exportMarkdown'),
              icon: 'file-code',
              onClick: onExportMarkdown ?? onExportText,
            },
            {
              label: t('menu.file.exportHtml'),
              icon: 'code',
              onClick: onExportHtml,
            },
            {
              label: t('menu.file.exportTxt'),
              icon: 'file',
              onClick: onExportText,
            },
          ],
        },
        'separator',
        {
          label: t('menu.file.pageSetup'),
          icon: 'sliders',
          onClick: onPageSetup,
        },
        {
          label: t('menu.file.print'),
          icon: 'printer',
          shortcut: 'Ctrl+P',
          onClick: onPrint,
        },
        'separator',
        {
          label: t('menu.file.deleteDoc'),
          icon: 'trash-2',
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
          icon: 'undo-2',
          shortcut: 'Ctrl+Z',
          disabled: isReadOnly,
          onClick: () => editor?.chain().focus().undo().run(),
        },
        {
          label: t('menu.edit.redo'),
          icon: 'redo-2',
          shortcut: 'Ctrl+Y',
          disabled: isReadOnly,
          onClick: () => editor?.chain().focus().redo().run(),
        },
        'separator',
        {
          label: t('menu.edit.cut'),
          icon: 'scissors',
          shortcut: 'Ctrl+X',
          disabled: isReadOnly,
          onClick: handleCut,
        },
        {
          label: t('menu.edit.copy'),
          icon: 'copy',
          shortcut: 'Ctrl+C',
          onClick: handleCopy,
        },
        {
          label: t('menu.edit.paste'),
          icon: 'clipboard',
          shortcut: 'Ctrl+V',
          disabled: isReadOnly,
          onClick: handlePaste,
        },
        {
          label: t('menu.edit.selectAll'),
          icon: 'check-square',
          shortcut: 'Ctrl+A',
          onClick: () => editor?.chain().focus().selectAll().run(),
        },
        'separator',
        {
          label: t('menu.edit.findAndReplace'),
          icon: 'search',
          shortcut: 'Ctrl+H',
          onClick: onToggleFind,
        },
      ],
    },
    {
      label: t('menu.view.label'),
      items: [
        {
          label: t('menu.view.mode'),
          icon: 'eye',
          items: [
            {
              label: t('menu.view.pagedMode'),
              icon: 'file-text',
              checked: viewMode === 'paged',
              onClick: () => onViewModeChange('paged'),
            },
            {
              label: t('menu.view.continuousMode'),
              icon: 'rows-2',
              checked: viewMode === 'continuous',
              onClick: () => onViewModeChange('continuous'),
            },
          ],
        },
        {
          label: t('menu.file.pageSetup'),
          icon: 'sliders',
          onClick: onPageSetup,
        },
      ],
    },
    {
      label: t('menu.insert.label'),
      items: [
        {
          label: t('menu.insert.image'),
          icon: 'image',
          disabled: isReadOnly,
          onClick: () => imageInputRef.current?.click(),
        },
        {
          label: t('menu.insert.table'),
          icon: 'table',
          tablePicker: true,
          disabled: isReadOnly,
        },
        {
          label: t('menu.insert.chart'),
          icon: 'scatter-chart',
          disabled: isReadOnly,
          onClick: () => onInsertChart?.(),
        },
        {
          label: t('menu.insert.horizontalRule'),
          icon: 'minus',
          disabled: isReadOnly,
          onClick: () => editor?.chain().focus().setHorizontalRule().run(),
        },
        {
          label: t('menu.insert.breaks'),
          icon: 'split',
          items: [
            {
              label: t('menu.insert.pageBreak'),
              icon: 'separator-horizontal',
              shortcut: 'Ctrl+Enter',
              disabled: isReadOnly,
              onClick: onInsertPageBreak,
            },
            {
              label: t('menu.insert.sectionBreak'),
              icon: 'section',
              disabled: isReadOnly,
              onClick: () => onInsertSectionBreak?.(),
            },
          ],
        },
        {
          label: t('menu.insert.callouts'),
          icon: 'sticky-note',
          disabled: isReadOnly,
          onClick: () => onInsertCallout?.(),
        },
        {
          label: t('menu.insert.bookmark'),
          icon: 'bookmark',
          disabled: isReadOnly,
          onClick: () => onInsertBookmark?.(),
        },
        {
          label: t('menu.insert.math'),
          icon: 'sigma',
          disabled: isReadOnly,
          onClick: () => onInsertMath?.(),
        },
        {
          label: t('menu.insert.footnote'),
          icon: 'text-quote',
          disabled: isReadOnly,
          onClick: () => onInsertFootnote?.(),
        },
        {
          label: t('menu.insert.columns'),
          icon: 'columns-2',
          items: [
            {
              label: t('menu.insert.column1'),
              icon: 'rectangle-horizontal',
              disabled: isReadOnly,
              onClick: () => onInsertColumns?.(1),
            },
            {
              label: t('menu.insert.column2'),
              icon: 'columns-2',
              disabled: isReadOnly,
              onClick: () => onInsertColumns?.(2),
            },
            {
              label: t('menu.insert.column3'),
              icon: 'columns-3',
              disabled: isReadOnly,
              onClick: () => onInsertColumns?.(3),
            },
          ],
        },
        'separator',
        {
          label: t('menu.insert.watermark'),
          icon: 'stamp',
          onClick: () => onWatermark?.(),
        },
        {
          label: t('menu.insert.headerFooter'),
          icon: 'layout-template',
          disabled: isReadOnly,
          onClick: () => onHeaderFooter?.(),
        },
      ],
    },
    {
      label: t('menu.format.label'),
      items: [
        {
          label: t('menu.format.text'),
          icon: 'type',
          items: [
            toggleMark('bold', 'menu.format.bold', 'bold', 'Ctrl+B'),
            toggleMark('italic', 'menu.format.italic', 'italic', 'Ctrl+I'),
            toggleMark('underline', 'menu.format.underline', 'underline', 'Ctrl+U'),
            toggleMark('strike', 'menu.format.strikethrough', 'strikethrough', 'Ctrl+Shift+X'),
            {
              label: t('menu.format.subscript'),
              icon: 'subscript',
              checked: editor?.isActive('subscript') ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().toggleSubscript().run(),
            },
            {
              label: t('menu.format.superscript'),
              icon: 'superscript',
              checked: editor?.isActive('superscript') ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().toggleSuperscript().run(),
            },
          ],
        },
        {
          label: t('menu.format.paragraphStyles'),
          icon: 'heading',
          items: [
            {
              label: t('menu.format.normalText'),
              icon: 'text',
              checked: editor?.isActive('paragraph') ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().setParagraph().run(),
            },
            {
              label: t('menu.format.heading1'),
              icon: 'heading-1',
              shortcut: 'Ctrl+Alt+1',
              checked: editor?.isActive('heading', { level: 1 }) ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
            },
            {
              label: t('menu.format.heading2'),
              icon: 'heading-2',
              shortcut: 'Ctrl+Alt+2',
              checked: editor?.isActive('heading', { level: 2 }) ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
            },
            {
              label: t('menu.format.heading3'),
              icon: 'heading-3',
              shortcut: 'Ctrl+Alt+3',
              checked: editor?.isActive('heading', { level: 3 }) ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
            },
          ],
        },
        {
          label: t('menu.format.alignAndIndent'),
          icon: 'align-left',
          items: [
            {
              label: t('menu.format.alignLeft'),
              icon: 'align-left',
              checked: editor?.isActive({ textAlign: 'left' }) ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().setTextAlign('left').run(),
            },
            {
              label: t('menu.format.alignCenter'),
              icon: 'align-center',
              checked: editor?.isActive({ textAlign: 'center' }) ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().setTextAlign('center').run(),
            },
            {
              label: t('menu.format.alignRight'),
              icon: 'align-right',
              checked: editor?.isActive({ textAlign: 'right' }) ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().setTextAlign('right').run(),
            },
            {
              label: t('menu.format.alignJustify'),
              icon: 'align-justify',
              checked: editor?.isActive({ textAlign: 'justify' }) ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().setTextAlign('justify').run(),
            },
          ],
        },
        {
          label: t('menu.format.lists'),
          icon: 'list',
          items: [
            {
              label: t('menu.format.bulletList'),
              icon: 'list',
              shortcut: 'Ctrl+Shift+7',
              checked: editor?.isActive('bulletList') ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().toggleBulletList().run(),
            },
            {
              label: t('menu.format.orderedList'),
              icon: 'list-ordered',
              shortcut: 'Ctrl+Shift+8',
              checked: editor?.isActive('orderedList') ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().toggleOrderedList().run(),
            },
            {
              label: t('menu.format.taskList'),
              icon: 'list-todo',
              shortcut: 'Ctrl+Shift+9',
              checked: editor?.isActive('taskList') ?? false,
              disabled: isReadOnly,
              onClick: () => editor?.chain().focus().toggleTaskList().run(),
            },
          ],
        },
        'separator',
        {
          label: t('menu.format.clearFormatting'),
          icon: 'remove-formatting',
          shortcut: 'Ctrl+\\',
          disabled: isReadOnly,
          onClick: () => editor?.chain().focus().unsetAllMarks().clearNodes().run(),
        },
      ],
    },
    {
      label: t('menu.tools.label'),
      items: [
        {
          label: t('menu.tools.wordCount'),
          icon: 'calculator',
          shortcut: 'Ctrl+Shift+C',
          onClick: () => onWordCount?.(),
        },
        {
          label: t('menu.tools.vnAdmin'),
          icon: 'shield-check',
          onClick: () => onVnAdmin?.(),
        },
        'separator',
        {
          label: t('menu.tools.shortcuts'),
          icon: 'keyboard',
          shortcut: 'F1',
          onClick: onHelp,
        },
      ],
    },
    {
      label: t('menu.help.label'),
      items: [
        {
          label: t('menu.help.shortcuts'),
          icon: 'keyboard',
          shortcut: 'F1',
          onClick: onHelp,
        },
        {
          label: t('menu.help.about'),
          icon: 'info',
          onClick: onHelp,
        },
      ],
    },
  ];
};
