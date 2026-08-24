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
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';

interface InsertImageDialogProps {
  open: boolean;
  onClose: () => void;
  onInsertImage: (url: string, title?: string) => void;
}

export const InsertImageDialog = ({
  open,
  onClose,
  onInsertImage,
}: InsertImageDialogProps) => {
  const { t } = useTranslation('sheets');
  const { t: tCommon } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImageUrl(val);
    setPreviewUrl(val);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    onInsertImage(imageUrl.trim(), imageTitle.trim() || 'Image');
    setPreviewUrl(null);
    setImageUrl('');
    setImageTitle('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="image" size={18} className="text-primary" />
            {t('images.insertTitle')}
          </DialogTitle>
          <DialogDescription>{t('images.insertDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Mode Tabs */}
          <div className="flex gap-2 border-b border-border pb-2">
            <Button
              type="button"
              size="sm"
              variant={activeTab === 'upload' ? 'default' : 'outline'}
              className="flex-1 text-xs"
              onClick={() => setActiveTab('upload')}
            >
              <Icon name="upload" size={14} className="mr-1.5" />
              {t('images.uploadTab')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === 'url' ? 'default' : 'outline'}
              className="flex-1 text-xs"
              onClick={() => setActiveTab('url')}
            >
              <Icon name="link" size={14} className="mr-1.5" />
              {t('images.urlTab')}
            </Button>
          </div>

          {activeTab === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-20 border-dashed border-2 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:border-primary cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="upload" size={20} />
                <span className="text-xs">{t('images.chooseFile')}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">
                {t('images.urlTab')}
              </label>
              <Input
                value={imageUrl}
                onChange={handleUrlChange}
                placeholder={t('images.urlPlaceholder')}
                className="text-xs"
                autoFocus
              />
            </div>
          )}

          {/* Preview Frame */}
          {previewUrl && (
            <div className="h-36 w-full rounded-md border border-border bg-muted/30 p-2 flex items-center justify-center overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-full max-w-full object-contain rounded-xs"
                onError={() => setPreviewUrl(null)}
              />
            </div>
          )}

          <DialogFooter className="border-t border-border pt-4 mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPreviewUrl(null);
                setImageUrl('');
                onClose();
              }}
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!imageUrl.trim()}
              style={{ backgroundColor: 'var(--o-kind-sheets)' }}
              className="text-white"
            >
              {t('images.insertBtn')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
