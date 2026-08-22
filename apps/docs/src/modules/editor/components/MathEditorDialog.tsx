import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Switch } from '@office/ui-kit';
import katex from 'katex';

interface MathEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTex?: string;
  initialBlock?: boolean;
  onSave: (tex: string, isBlock: boolean) => void;
}

const PRESET_FORMULAS = [
  { label: 'Phân số', tex: '\\frac{a}{b}' },
  { label: 'Căn bậc hai', tex: '\\sqrt{x}' },
  { label: 'Phương trình bậc 2', tex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { label: 'Tích phân', tex: '\\int_{a}^{b} f(x) dx' },
  { label: 'Tổng sigma', tex: '\\sum_{i=1}^{n} x_i' },
  { label: 'Giới hạn', tex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
  { label: 'Đẳng thức Euler', tex: 'e^{i\\pi} + 1 = 0' },
  { label: 'Ma trận', tex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
];

export const MathEditorDialog = ({
  open,
  onOpenChange,
  initialTex = 'E = mc^2',
  initialBlock = false,
  onSave,
}: MathEditorDialogProps) => {
  const [tex, setTex] = useState(initialTex);
  const [isBlock, setIsBlock] = useState(initialBlock);

  let renderedHtml = '';
  let errorMsg = '';
  try {
    renderedHtml = katex.renderToString(tex || 'E = mc^2', {
      throwOnError: true,
      displayMode: isBlock,
    });
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Lỗi cú pháp LaTeX';
  }

  const handleSave = () => {
    if (!tex.trim()) return;
    onSave(tex.trim(), isBlock);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chèn công thức toán học (LaTeX)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Toggle Block Mode */}
          <div className="flex items-center justify-between">
            <label htmlFor="math-block-toggle" className="text-xs font-medium text-foreground cursor-pointer">
              Hiển thị dạng khối riêng biệt (Block mode)
            </label>
            <Switch
              id="math-block-toggle"
              checked={isBlock}
              onCheckedChange={setIsBlock}
            />
          </div>

          {/* LaTeX Input */}
          <div className="space-y-1.5">
            <label htmlFor="latex-input" className="text-xs font-medium text-foreground">
              Mã nguồn LaTeX
            </label>
            <Input
              id="latex-input"
              value={tex}
              onChange={(e) => setTex(e.target.value)}
              placeholder="Ví dụ: \frac{a}{b}, \sqrt{x}..."
              className="font-mono text-xs h-9"
              autoFocus
            />
          </div>

          {/* Presets */}
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Mẫu công thức phổ biến:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_FORMULAS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] px-2"
                  onClick={() => setTex(preset.tex)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Bản xem trước trực tiếp:</span>
            <div className="min-h-16 p-3 rounded-lg border border-border bg-card flex items-center justify-center overflow-x-auto">
              {errorMsg ? (
                <span className="text-xs text-destructive font-mono">{errorMsg}</span>
              ) : (
                <div
                  className="text-base text-foreground font-serif"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 pt-4 mt-2 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="px-4 text-xs font-medium border-border/80 bg-background text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="default"
            size="default"
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-600 font-semibold px-5 text-xs shadow-sm hover:shadow transition-all gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleSave}
            disabled={Boolean(errorMsg) || !tex.trim()}
          >
            Chèn công thức
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
