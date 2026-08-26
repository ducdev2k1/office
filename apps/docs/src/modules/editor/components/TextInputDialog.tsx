import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from '@office/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@office/ui-kit';
import type { TextInputRequest } from '@/modules/editor/hooks/useEditorModals';

interface TextInputDialogProps {
  request: TextInputRequest | null;
  onResolve: (value: string | null) => void;
}

const TITLE_KEY: Record<TextInputRequest['kind'], string> = {
  link: 'inputDialog.linkTitle',
  bookmark: 'inputDialog.bookmarkTitle',
  footnote: 'inputDialog.footnoteTitle',
};

const LABEL_KEY: Record<TextInputRequest['kind'], string> = {
  link: 'inputDialog.linkLabel',
  bookmark: 'inputDialog.bookmarkLabel',
  footnote: 'inputDialog.footnoteLabel',
};

export const TextInputDialog = ({ request, onResolve }: TextInputDialogProps) => {
  const { t } = useTranslation('docs');
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!request) return;
    setValue(request.defaultValue);
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(raf);
  }, [request]);

  if (!request) return null;

  const handleConfirm = () => onResolve(value.trim());

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog
      open={Boolean(request)}
      onOpenChange={(open) => {
        if (!open) onResolve(null);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(TITLE_KEY[request.kind])}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label htmlFor="text-input-dialog-field" className="text-xs font-medium text-foreground">
            {t(LABEL_KEY[request.kind])}
          </label>
          <Input
            id="text-input-dialog-field"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={request.kind === 'link' ? 'https://' : undefined}
          />
        </div>

        <DialogFooter className="border-t border-border/60 pt-4 mt-2 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="px-4 text-xs font-medium border-border/80 bg-background text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer"
            onClick={() => onResolve(null)}
          >
            {t('inputDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="default"
            size="default"
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-600 font-semibold px-5 text-xs shadow-sm hover:shadow transition-all gap-1.5 cursor-pointer"
            onClick={handleConfirm}
          >
            {t('inputDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
