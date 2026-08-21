import { useMemo } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Icon,
} from '@office/ui-kit';
import { useTranslation } from '@office/i18n';

interface WordCountDialogProps {
  open: boolean;
  editor: Editor | null;
  pageCount: number;
  onClose: () => void;
  showFloating: boolean;
  onToggleFloating: (val: boolean) => void;
}

export const WordCountDialog = ({
  open,
  editor,
  pageCount,
  onClose,
  showFloating,
  onToggleFloating,
}: WordCountDialogProps) => {
  const { t } = useTranslation('docs');

  const stats = useMemo(() => {
    if (!editor) {
      return { words: 0, characters: 0, charactersNoSpaces: 0, paragraphs: 0, readingTime: 1 };
    }

    const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, ' ', ' ');
    const trimmed = text.trim();
    const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    let paragraphs = 0;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'paragraph' || node.type.name === 'heading') {
        paragraphs++;
      }
    });

    const readingTime = Math.max(1, Math.ceil(words / 200));

    return {
      words,
      characters,
      charactersNoSpaces,
      paragraphs: Math.max(1, paragraphs),
      readingTime,
    };
  }, [editor, open]);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="file-text" size={18} className="text-primary" />
            {t('wordCount.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="py-3">
          <div className="divide-y divide-border/60 rounded-lg border border-border/80 bg-muted/20">
            <div className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="text-muted-foreground">{t('wordCount.pages')}</span>
              <span className="font-semibold text-foreground">{pageCount}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="text-muted-foreground">{t('wordCount.words')}</span>
              <span className="font-semibold text-foreground">{stats.words.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="text-muted-foreground">{t('wordCount.characters')}</span>
              <span className="font-semibold text-foreground">{stats.characters.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="text-muted-foreground">{t('wordCount.charactersNoSpaces')}</span>
              <span className="font-semibold text-foreground">
                {stats.charactersNoSpaces.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="text-muted-foreground">{t('wordCount.paragraphs')}</span>
              <span className="font-semibold text-foreground">{stats.paragraphs.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-xs bg-primary/5">
              <span className="font-medium text-primary">{t('wordCount.readingTime')}</span>
              <span className="font-semibold text-primary">
                {t('wordCount.readingTimeValue', { minutes: stats.readingTime })}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-1">
            <label htmlFor="toggle-floating-count" className="text-xs text-muted-foreground cursor-pointer">
              {t('wordCount.showFloating')}
            </label>
            <input
              id="toggle-floating-count"
              type="checkbox"
              checked={showFloating}
              onChange={(e) => onToggleFloating(e.target.checked)}
              className="size-4 rounded accent-primary cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" onClick={onClose}>
            {t('wordCount.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
