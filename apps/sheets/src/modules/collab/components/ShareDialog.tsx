import { useTranslation } from '@office/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Input,
} from '@office/ui-kit';
import { useState } from 'react';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  sheetId: string;
}

export const ShareDialog = ({ open, onClose, sheetId }: ShareDialogProps) => {
  const { t } = useTranslation('sheets');
  const { t: tCommon } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  const [accessMode, setAccessMode] = useState<'edit' | 'view'>('edit');

  const shareUrl = () => {
    const base = window.location.origin + window.location.pathname.replace(/\/edit\/.*$/, '');
    return `${base}/edit/${sheetId}?access=${accessMode}`;
  };

  const handleCopy = async () => {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('share.title')}</DialogTitle>
          <DialogDescription>{t('share.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Permission Mode selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">
              Quyền hạn liên kết
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={accessMode === 'edit' ? 'default' : 'outline'}
                className="flex-1 text-xs"
                onClick={() => setAccessMode('edit')}
              >
                <Icon name="edit" size={14} className="mr-1.5" />
                {t('share.roles.edit')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={accessMode === 'view' ? 'default' : 'outline'}
                className="flex-1 text-xs"
                onClick={() => setAccessMode('view')}
              >
                <Icon name="eye" size={14} className="mr-1.5" />
                {t('share.roles.view')}
              </Button>
            </div>
          </div>

          {/* Share Link Copy Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">
              {t('share.linkLabel')}
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl()}
                className="min-w-0 flex-1 text-xs text-muted-foreground font-mono"
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button size="sm" variant="outline" onClick={() => void handleCopy()}>
                <Icon name={copied ? 'check' : 'copy'} size={14} />
                {copied ? t('share.copied') : t('share.copy')}
              </Button>
            </div>
          </div>

          <p className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            {t('share.backendNote')}
          </p>
        </div>

        <DialogFooter className="border-t border-border/60 pt-4 mt-2 flex items-center justify-end">
          <Button
            size="default"
            variant="outline"
            className="px-4 text-xs font-medium border-border/80 bg-background text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer"
            onClick={onClose}
          >
            {tCommon('actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
