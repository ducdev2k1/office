import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  cn,
  Icon,
} from '@office/ui-kit';
import { useTranslation } from '@office/i18n';
import {
  DEFAULT_CHART_ATTRS,
  type ChartBlockAttrs,
  type ChartType,
  type ChartSeries,
} from '@office/tiptap-extensions';

interface ChartEditorDialogProps {
  open: boolean;
  initialAttrs?: ChartBlockAttrs | null;
  onClose: () => void;
  onSave: (attrs: ChartBlockAttrs) => void;
}

const CHART_TYPES: Array<{ type: ChartType; label: string; icon: string }> = [
  { type: 'bar', label: 'Cột (Bar)', icon: 'bar-chart-3' },
  { type: 'line', label: 'Đường (Line)', icon: 'line-chart' },
  { type: 'area', label: 'Miền (Area)', icon: 'area-chart' },
  { type: 'pie', label: 'Tròn (Pie)', icon: 'pie-chart' },
];

export const ChartEditorDialog = ({
  open,
  initialAttrs,
  onClose,
  onSave,
}: ChartEditorDialogProps) => {
  const { t } = useTranslation('docs');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('Biểu đồ tăng trưởng doanh số');
  const [categories, setCategories] = useState<string[]>(['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4']);
  const [series, setSeries] = useState<ChartSeries[]>([
    { name: 'Kế hoạch', data: [120, 150, 180, 220], color: '#3b82f6' },
    { name: 'Thực tế', data: [135, 160, 175, 240], color: '#10b981' },
  ]);

  useEffect(() => {
    if (initialAttrs) {
      setChartType(initialAttrs.chartType);
      setTitle(initialAttrs.title);
      setCategories([...initialAttrs.categories]);
      setSeries(initialAttrs.series.map((s) => ({ ...s, data: [...s.data] })));
    } else {
      setChartType(DEFAULT_CHART_ATTRS.chartType);
      setTitle(DEFAULT_CHART_ATTRS.title);
      setCategories([...DEFAULT_CHART_ATTRS.categories]);
      setSeries(DEFAULT_CHART_ATTRS.series.map((s) => ({ ...s, data: [...s.data] })));
    }
  }, [initialAttrs, open]);

  const handleAddCategory = () => {
    const nextIdx = categories.length + 1;
    setCategories([...categories, `Mục ${nextIdx}`]);
    setSeries(series.map((s) => ({ ...s, data: [...s.data, 100] })));
  };

  const handleRemoveCategory = (catIdx: number) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter((_, i) => i !== catIdx));
    setSeries(
      series.map((s) => ({
        ...s,
        data: s.data.filter((_, i) => i !== catIdx),
      })),
    );
  };

  const handleCategoryChange = (catIdx: number, val: string) => {
    const updated = [...categories];
    updated[catIdx] = val;
    setCategories(updated);
  };

  const handleAddSeries = () => {
    const colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
    const color = colors[series.length % colors.length]!;
    setSeries([
      ...series,
      {
        name: `Chuỗi ${series.length + 1}`,
        data: categories.map(() => 100),
        color,
      },
    ]);
  };

  const handleRemoveSeries = (sIdx: number) => {
    if (series.length <= 1) return;
    setSeries(series.filter((_, i) => i !== sIdx));
  };

  const handleSeriesNameChange = (sIdx: number, name: string) => {
    const updated = [...series];
    updated[sIdx] = { ...updated[sIdx]!, name };
    setSeries(updated);
  };

  const handleSeriesColorChange = (sIdx: number, color: string) => {
    const updated = [...series];
    updated[sIdx] = { ...updated[sIdx]!, color };
    setSeries(updated);
  };

  const handleDataChange = (sIdx: number, cIdx: number, val: string) => {
    const num = parseFloat(val) || 0;
    const updated = [...series];
    const sData = [...updated[sIdx]!.data];
    sData[cIdx] = num;
    updated[sIdx] = { ...updated[sIdx]!, data: sData };
    setSeries(updated);
  };

  const handleSave = () => {
    onSave({
      chartType,
      title: title.trim() || 'Biểu đồ số liệu',
      categories,
      series,
      width: '100%',
      height: 320,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="bar-chart-3" size={18} className="text-primary" />
            {initialAttrs ? t('chart.editChart') : t('chart.insertChart')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Chart Type selection */}
          <div>
            <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">
              {t('chart.chartType')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CHART_TYPES.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all cursor-pointer',
                    chartType === item.type
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-2xs'
                      : 'border-border/70 hover:bg-hover text-foreground/80',
                  )}
                  onClick={() => setChartType(item.type)}
                >
                  <Icon name={item.icon as any} size={15} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-foreground/80 mb-1 block">
              {t('chart.chartTitle')}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề biểu đồ..."
              className="h-8 text-xs"
            />
          </div>

          {/* Mini Data Table */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Bảng số liệu (Categories & Series)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                  onClick={handleAddCategory}
                >
                  + {t('chart.addRow')} (Cột mốc)
                </button>
                {chartType !== 'pie' && (
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                    onClick={handleAddSeries}
                  >
                    + {t('chart.addSeries')} (Chuỗi)
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/80 bg-muted/20 p-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="p-2 text-left font-semibold text-muted-foreground w-28">
                      Danh mục
                    </th>
                    {series.map((s, sIdx) => (
                      <th key={sIdx} className="p-2 text-left font-semibold">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={s.color || '#3b82f6'}
                            onChange={(e) => handleSeriesColorChange(sIdx, e.target.value)}
                            className="size-4 rounded-xs border-0 cursor-pointer p-0"
                            title="Đổi màu chuỗi"
                          />
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => handleSeriesNameChange(sIdx, e.target.value)}
                            className="h-6 w-20 rounded border border-border/60 bg-background px-1 text-xs font-semibold"
                          />
                          {series.length > 1 && (
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive text-[11px] cursor-pointer"
                              onClick={() => handleRemoveSeries(sIdx)}
                              title="Xóa chuỗi"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, cIdx) => (
                    <tr key={cIdx} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={cat}
                          onChange={(e) => handleCategoryChange(cIdx, e.target.value)}
                          className="h-7 w-full rounded border border-border/60 bg-background px-2 text-xs font-medium"
                        />
                      </td>
                      {series.map((s, sIdx) => (
                        <td key={sIdx} className="p-1.5">
                          <input
                            type="number"
                            value={s.data[cIdx] ?? 0}
                            onChange={(e) => handleDataChange(sIdx, cIdx, e.target.value)}
                            className="h-7 w-full rounded border border-border/60 bg-background px-2 text-xs"
                          />
                        </td>
                      ))}
                      <td className="p-1.5 text-center">
                        {categories.length > 1 && (
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive text-xs cursor-pointer"
                            onClick={() => handleRemoveCategory(cIdx)}
                            title="Xóa hàng này"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button size="sm" onClick={handleSave}>
            {t('chart.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
