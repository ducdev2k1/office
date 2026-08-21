import { useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { cn, Icon } from '@office/ui-kit';
import { mountPopup, type SlashCommandItem } from '@office/tiptap-extensions';

interface SlashCommandSuggestProps {
  editor: Editor | null;
  onOpenImageUpload?: () => void;
  onOpenMathDialog?: () => void;
  onOpenChartDialog?: () => void;
}

interface SlashState {
  anchor: DOMRect;
  query: string;
}

export const SlashCommandSuggest = ({
  editor,
  onOpenImageUpload,
  onOpenMathDialog,
  onOpenChartDialog,
}: SlashCommandSuggestProps) => {
  const { t } = useTranslation('docs');
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SlashState | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const commandItems: SlashCommandItem[] = useMemo(() => {
    if (!editor) return [];

    return [
      // Text
      {
        id: 'paragraph',
        title: t('slash.paragraph'),
        description: 'Đoạn văn bản thường',
        category: 'text',
        icon: 'type',
        command: ({ editor: ed }) => ed.chain().focus().setParagraph().run(),
      },
      {
        id: 'heading-1',
        title: t('slash.heading1'),
        description: 'Tiêu đề cấp lớn nhất',
        category: 'text',
        icon: 'heading-1',
        command: ({ editor: ed }) => ed.chain().focus().setHeading({ level: 1 }).run(),
      },
      {
        id: 'heading-2',
        title: t('slash.heading2'),
        description: 'Tiêu đề phân mục',
        category: 'text',
        icon: 'heading-2',
        command: ({ editor: ed }) => ed.chain().focus().setHeading({ level: 2 }).run(),
      },
      {
        id: 'heading-3',
        title: t('slash.heading3'),
        description: 'Tiêu đề phân mục nhỏ',
        category: 'text',
        icon: 'heading-3',
        command: ({ editor: ed }) => ed.chain().focus().setHeading({ level: 3 }).run(),
      },
      {
        id: 'blockquote',
        title: t('slash.quote'),
        description: 'Đoạn trích dẫn nổi bật',
        category: 'text',
        icon: 'quote',
        command: ({ editor: ed }) => ed.chain().focus().toggleBlockquote().run(),
      },
      {
        id: 'codeblock',
        title: t('slash.code'),
        description: 'Khối mã nguồn định dạng code',
        category: 'text',
        icon: 'code',
        command: ({ editor: ed }) => ed.chain().focus().toggleCodeBlock().run(),
      },

      // Lists
      {
        id: 'bullet-list',
        title: t('slash.bulletList'),
        description: 'Danh sách dấu đầu dòng',
        category: 'lists',
        icon: 'list',
        command: ({ editor: ed }) => ed.chain().focus().toggleBulletList().run(),
      },
      {
        id: 'ordered-list',
        title: t('slash.orderedList'),
        description: 'Danh sách đánh số thứ tự',
        category: 'lists',
        icon: 'list-ordered',
        command: ({ editor: ed }) => ed.chain().focus().toggleOrderedList().run(),
      },
      {
        id: 'checklist',
        title: t('slash.checklist'),
        description: 'Danh sách việc cần làm có ô tích',
        category: 'lists',
        icon: 'check-square',
        command: ({ editor: ed }) => ed.chain().focus().toggleTaskList().run(),
      },

      // Media & Tables
      {
        id: 'table',
        title: t('slash.table'),
        description: 'Chèn bảng 3x3 tùy biến',
        category: 'media',
        icon: 'table',
        command: ({ editor: ed }) =>
          ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      },
      {
        id: 'chart',
        title: t('slash.chart'),
        description: 'Biểu đồ Cột, Đường, Tròn, Miền',
        category: 'media',
        icon: 'bar-chart-3',
        badge: 'Mới',
        command: () => onOpenChartDialog?.(),
      },
      {
        id: 'image',
        title: t('slash.image'),
        description: 'Tải ảnh từ máy tính lên',
        category: 'media',
        icon: 'image',
        command: () => onOpenImageUpload?.(),
      },

      // Callouts
      {
        id: 'callout-info',
        title: t('slash.calloutInfo'),
        description: 'Hộp ghi chú thông tin màu xanh',
        category: 'callouts',
        icon: 'info',
        command: ({ editor: ed }) => ed.chain().focus().setCallout({ type: 'info' }).run(),
      },
      {
        id: 'callout-tip',
        title: t('slash.calloutTip'),
        description: 'Hộp mẹo vặt hữu ích màu xanh lá',
        category: 'callouts',
        icon: 'lightbulb',
        command: ({ editor: ed }) => ed.chain().focus().setCallout({ type: 'tip' }).run(),
      },
      {
        id: 'callout-warning',
        title: t('slash.calloutWarning'),
        description: 'Hộp lưu ý quan trọng màu cam',
        category: 'callouts',
        icon: 'alert-triangle',
        command: ({ editor: ed }) => ed.chain().focus().setCallout({ type: 'warning' }).run(),
      },
      {
        id: 'callout-danger',
        title: t('slash.calloutDanger'),
        description: 'Hộp cảnh báo nguy hiểm màu đỏ',
        category: 'callouts',
        icon: 'alert-octagon',
        command: ({ editor: ed }) => ed.chain().focus().setCallout({ type: 'danger' }).run(),
      },

      // Advanced
      {
        id: 'math',
        title: t('slash.math'),
        description: 'Công thức toán học KaTeX',
        category: 'advanced',
        icon: 'sigma',
        command: () => onOpenMathDialog?.(),
      },
      {
        id: 'footnote',
        title: t('slash.footnote'),
        description: 'Chú thích chân trang tài liệu',
        category: 'advanced',
        icon: 'file-text',
        command: ({ editor: ed }) => ed.chain().focus().insertFootnote({ text: 'Chú thích' }).run(),
      },
      {
        id: 'columns',
        title: t('slash.columns'),
        description: 'Chia bố cục thành 2 cột',
        category: 'advanced',
        icon: 'columns-2',
        command: ({ editor: ed }) => ed.chain().focus().insertColumns({ count: 2 }).run(),
      },
      {
        id: 'toc',
        title: t('slash.toc'),
        description: 'Mục lục tự động theo tiêu đề',
        category: 'advanced',
        icon: 'list-tree',
        command: ({ editor: ed }) => ed.chain().focus().insertContent('<div data-type="toc"></div>').run(),
      },
      {
        id: 'page-break',
        title: t('slash.pageBreak'),
        description: 'Ngắt sang trang mới',
        category: 'advanced',
        icon: 'file-minus',
        command: ({ editor: ed }) => ed.chain().focus().setPageBreak().run(),
      },
      {
        id: 'divider',
        title: t('slash.divider'),
        description: 'Đường kẻ ngang phân cách',
        category: 'advanced',
        icon: 'minus',
        command: ({ editor: ed }) => ed.chain().focus().setHorizontalRule().run(),
      },
    ];
  }, [editor, t, onOpenImageUpload, onOpenMathDialog, onOpenChartDialog]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return commandItems;
    return commandItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [commandItems, searchQuery]);

  useEffect(() => {
    if (!editor) return;
    const storage = editor.storage.slashCommand;
    if (!storage) return;

    storage.onOpen = ({ anchor }) => {
      setSearchQuery('');
      setSelectedIndex(0);
      setState({ anchor, query: '' });
    };

    storage.onClose = () => {
      setState(null);
    };

    const handleSync = () => {
      if (!state) return;
      const { state: pmState } = editor;
      const textBefore = pmState.doc.textBetween(
        Math.max(0, pmState.selection.from - 64),
        pmState.selection.from,
        '\n',
        '\uFFFC',
      );
      const slashIdx = textBefore.lastIndexOf('/');
      if (slashIdx === -1) {
        setState(null);
        return;
      }
      const queryText = textBefore.slice(slashIdx + 1);
      if (/\s/.test(queryText)) {
        setState(null);
        return;
      }
      setSearchQuery(queryText);
    };

    editor.on('selectionUpdate', handleSync);
    editor.on('transaction', handleSync);

    return () => {
      editor.off('selectionUpdate', handleSync);
      editor.off('transaction', handleSync);
      storage.onOpen = null;
      storage.onClose = null;
    };
  }, [editor, state]);

  useEffect(() => {
    if (!state || !containerRef.current) return;
    const controller = mountPopup(containerRef.current, {
      placement: 'bottom-start',
      anchor: state.anchor,
      offset: 8,
    });
    return () => controller.destroy();
  }, [state]);

  const executeItem = (item: SlashCommandItem) => {
    if (!editor) return;
    const { state: pmState } = editor;
    const textBefore = pmState.doc.textBetween(
      Math.max(0, pmState.selection.from - 64),
      pmState.selection.from,
      '\n',
      '\uFFFC',
    );
    const slashIdx = textBefore.lastIndexOf('/');
    if (slashIdx !== -1) {
      const from = pmState.selection.from - (textBefore.length - slashIdx);
      editor.chain().focus().deleteRange({ from, to: pmState.selection.from }).run();
    }
    item.command({ editor, range: { from: 0, to: 0 } });
    setState(null);
  };

  useEffect(() => {
    if (!state) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0,
        );
      } else if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        if (filteredItems[selectedIndex]) {
          executeItem(filteredItems[selectedIndex]!);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setState(null);
      }
    };
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [state, filteredItems, selectedIndex]);

  if (!state) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto z-50 w-72 max-h-80 overflow-hidden flex flex-col rounded-xl border border-border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-2 border-b border-border/70 px-3 py-2 bg-muted/20">
        <Icon name="command" size={13} className="text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground/80">{t('slash.title')}</span>
        {searchQuery && (
          <span className="ml-auto rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary">
            /{searchQuery}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {filteredItems.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-muted-foreground">
            {t('slash.noResults')}
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer',
                index === selectedIndex
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground/80 hover:bg-hover hover:text-foreground',
              )}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => executeItem(item)}
            >
              <div
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-md border text-xs',
                  index === selectedIndex
                    ? 'border-primary/30 bg-primary/15 text-primary'
                    : 'border-border/60 bg-background text-muted-foreground',
                )}
              >
                <Icon name={item.icon as any} size={14} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span className="rounded-sm bg-amber-500/15 px-1 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="truncate text-[11px] text-muted-foreground font-normal">
                  {item.description}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
