import { useState } from 'react';
import { useTranslation } from '@office/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Switch,
} from '@office/ui-kit';
import type { WatermarkSetup } from '@/types/docs.types';

interface WatermarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watermark?: WatermarkSetup;
  onSave: (watermark: WatermarkSetup) => void;
}

const PRESET_TEXTS = ['BẢO MẬT', 'BẢN THẢO', 'TUYỆT MẬT', 'NỘI BỘ', 'MẪU'];
const COLOR_PRESETS = [
  { name: 'Xám', value: '#64748B' },
  { name: 'Đỏ', value: '#EF4444' },
  { name: 'Xanh dương', value: '#3B82F6' },
  { name: 'Hổ phách', value: '#F59E0B' },
];

export const WatermarkDialog = ({
  open,
  onOpenChange,
  watermark,
  onSave,
}: WatermarkDialogProps) => {
  const { t } = useTranslation('docs');
  const [enabled, setEnabled] = useState(watermark?.enabled ?? false);
  const [text, setText] = useState(watermark?.text || 'BẢO MẬT');
  const [opacity, setOpacity] = useState(watermark?.opacity ?? 0.15);
  const [color, setColor] = useState(watermark?.color || '#64748B');
  const [fontSize, setFontSize] = useState(watermark?.fontSize ?? 48);

  const handleSave = () => {
    onSave({
      enabled,
      text: text.trim() || 'BẢO MẬT',
      opacity,
      color,
      fontSize,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hình nền mờ (Watermark)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <label htmlFor="watermark-toggle" className="text-sm font-medium text-foreground cursor-pointer">
              Bật hình nền mờ trên tài liệu
            </label>
            <Switch
              id="watermark-toggle"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <>
              <div className="space-y-2">
                <label htmlFor="watermark-text" className="text-xs font-medium text-foreground">
                  Nội dung chữ
                </label>
                <Input
                  id="watermark-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ví dụ: BẢO MẬT, BẢN THẢO..."
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_TEXTS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => setText(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">Độ mờ (Opacity)</span>
                  <span className="text-muted-foreground">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">Màu sắc</span>
                <div className="flex gap-2">
                  {COLOR_PRESETS.map((p) => (
                    <Button
                      key={p.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`h-7 text-xs px-2 gap-1.5 ${color === p.value ? 'border-primary ring-1 ring-primary' : ''}`}
                      onClick={() => setColor(p.value)}
                    >
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: p.value }}
                      />
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">Kích thước chữ</span>
                  <span className="text-muted-foreground">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="72"
                  step="4"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Preview */}
              <div className="relative h-24 border border-border rounded-lg bg-card overflow-hidden grid place-items-center">
                <span className="text-xs text-muted-foreground z-10">Bản xem trước</span>
                <div
                  className="absolute select-none pointer-events-none font-bold tracking-widest uppercase transform -rotate-25 whitespace-nowrap"
                  style={{
                    color,
                    opacity,
                    fontSize: `${fontSize / 1.8}px`,
                  }}
                >
                  {text || 'BẢO MẬT'}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
