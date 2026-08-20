import { useTranslation } from '@office/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
} from '@office/ui-kit';
import { useRef, useState } from 'react';

const SOLID_COLORS = [
  '#ffffff',
  '#f8fafc',
  '#f1f5f9',
  '#e2e8f0',
  '#0f172a',
  '#eff6ff',
  '#dbeafe',
  '#bfdbfe',
  '#1e40af',
  '#1e3a8a',
  '#f0fdf4',
  '#dcfce7',
  '#bbf7d0',
  '#16a34a',
  '#14532d',
  '#fffbeb',
  '#fef3c7',
  '#fde68a',
  '#b45309',
  '#78350f',
  '#fef2f2',
  '#fee2e2',
  '#fecaca',
  '#dc2626',
  '#7f1d1d',
  '#faf5ff',
  '#f3e8ff',
  '#e9d5ff',
  '#9333ea',
  '#581c87',
];

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
];

interface SlideBackgroundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBg?: string;
  onApplyBackground: (bg: string, applyToAll?: boolean) => void;
}

export const SlideBackgroundDialog = ({
  open,
  onOpenChange,
  currentBg = '#ffffff',
  onApplyBackground,
}: SlideBackgroundDialogProps) => {
  const { t } = useTranslation('slides');
  const [selectedBg, setSelectedBg] = useState(currentBg);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedBg(`url(${reader.result}) center/cover no-repeat`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="palette" size={16} className="text-primary" />
            <span>Tuỳ chỉnh hình nền trang chiếu</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div>
            <label className="mb-2 block font-medium text-foreground">Màu đơn sắc (Solid):</label>
            <div className="grid grid-cols-6 gap-1.5">
              {SOLID_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedBg(c)}
                  className={`h-7 w-full rounded border shadow-2xs transition-transform hover:scale-105 ${
                    selectedBg === c ? 'ring-2 ring-primary ring-offset-1' : 'border-border'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium text-foreground">
              Màu chuyển sắc (Gradient):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENTS.map((g, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedBg(g)}
                  className={`h-9 w-full rounded-md border shadow-2xs transition-transform hover:scale-105 ${
                    selectedBg === g ? 'ring-2 ring-primary ring-offset-1' : 'border-border'
                  }`}
                  style={{ background: g }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-medium text-foreground">Hình ảnh nền:</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFile}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-full gap-2 text-xs"
            >
              <Icon name="image" size={14} />
              <span>Tải ảnh từ máy tính làm hình nền</span>
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onApplyBackground(selectedBg, true);
              onOpenChange(false);
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Áp dụng cho tất cả slide
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Huỷ
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApplyBackground(selectedBg, false);
                onOpenChange(false);
              }}
              className="h-8 text-xs bg-primary text-white"
            >
              Xong
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
