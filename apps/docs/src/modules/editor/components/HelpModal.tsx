import { useTranslation } from '@office/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Icon,
  Input,
} from '@office/ui-kit';
import { useEffect, useMemo, useState } from 'react';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  items: [string, string][];
}

export const HelpModal = ({ open, onClose }: HelpModalProps) => {
  const { t } = useTranslation('docs');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const groups: ShortcutGroup[] = useMemo(
    () => [
      {
        title: t('helpModal.groups.basicFormatting'),
        items: [
          ['Ctrl+B', t('helpModal.shortcuts.bold')],
          ['Ctrl+I', t('helpModal.shortcuts.italic')],
          ['Ctrl+Shift+X', t('helpModal.shortcuts.strike')],
          ['Ctrl+Shift+5', t('helpModal.shortcuts.subscript')],
          ['Ctrl+Shift+6', t('helpModal.shortcuts.superscript')],
        ],
      },
      {
        title: t('helpModal.groups.font'),
        items: [
          ['Ctrl+Shift+>', t('helpModal.shortcuts.increaseFontSize')],
          ['Ctrl+Shift+<', t('helpModal.shortcuts.decreaseFontSize')],
          ['Ctrl+Alt+7', t('helpModal.shortcuts.textColorPicker')],
          ['Ctrl+Shift+F', t('helpModal.shortcuts.focusFontPicker')],
        ],
      },
      {
        title: t('helpModal.groups.navigation'),
        items: [
          ['Ctrl+H', t('helpModal.shortcuts.findAndReplace')],
          ['Ctrl+K', t('helpModal.shortcuts.insertLink')],
          ['Ctrl+Enter', t('helpModal.shortcuts.insertPageBreak')],
          ['Ctrl+P', t('helpModal.shortcuts.printDoc')],
        ],
      },
      {
        title: t('helpModal.groups.undoRedo'),
        items: [
          ['Ctrl+Z', t('helpModal.shortcuts.undo')],
          ['Ctrl+Y / Ctrl+Shift+Z', t('helpModal.shortcuts.redo')],
          ['Ctrl+Alt+1/2/3', t('helpModal.shortcuts.headings')],
          ['Ctrl+Shift+7/8', t('helpModal.shortcuts.lists')],
          ['Ctrl+`', t('helpModal.shortcuts.codeBlock')],
          ['Tab / Shift+Tab', t('helpModal.shortcuts.indent')],
        ],
      },
    ],
    [t],
  );

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          ([key, label]) =>
            label.toLowerCase().includes(normalizedQuery) ||
            key.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const hasResults = filteredGroups.length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-[620px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('helpModal.title')}</DialogTitle>
          <DialogDescription>{t('helpModal.description')}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Icon
            name="search"
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('helpModal.searchPlaceholder')}
            className="pl-9"
            aria-label={t('helpModal.searchPlaceholder')}
          />
        </div>
        <div className="max-h-[60vh] pr-1.5 overflow-y-auto scrollbar-thin">
          {hasResults ? (
            filteredGroups.map((group) => (
              <div key={group.title} className="mb-4.5">
                <div className="mb-2 pb-1 border-b border-border text-xs font-semibold text-foreground">
                  {group.title}
                </div>
                {group.items.map(([key, label]) => (
                  <div
                    className="flex items-center justify-between gap-4 py-1 text-xs text-foreground"
                    key={key}
                  >
                    <span>{label}</span>
                    <kbd className="px-1.5 py-0.5 border border-border rounded bg-muted text-foreground font-mono text-[11px] shadow-xs shrink-0">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {t('helpModal.noResults')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
