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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/80 shadow-2xl p-6">
        <DialogHeader className="border-b border-border/60 pb-3">
          <DialogTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name="bar-chart-3" size={18} />
            </div>
            <span>{initialAttrs ? t('chart.editChart') : t('chart.insertChart')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          {/* Chart Type selection */}
          <div>
            <label className="text-xs font-semibold text-foreground/80 mb-2 block">
              {t('chart.chartType')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CHART_TYPES.map((item) => {
                const active = chartType === item.type;
                return (
                  <Button
                    key={item.type}
                    type="button"
                    variant={active ? 'outline' : 'ghost'}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium',
                      active
                        ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary/40'
                        : 'border-border/70 text-foreground/80',
                    )}
                    onClick={() => setChartType(item.type)}
                  >
                    <Icon name={item.icon as any} size={16} />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">
              {t('chart.chartTitle')}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề biểu đồ..."
              className="h-9 text-xs rounded-lg border-border/80 focus:ring-primary"
            />
          </div>

          {/* Mini Data Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground/80">
                Bảng số liệu (Categories & Series)
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 gap-1 text-primary border-primary/30 hover:bg-primary/10"
                  onClick={handleAddCategory}
                >
                  <Icon name="plus" size={13} />
                  <span>{t('chart.addRow')} (Cột mốc)</span>
                </Button>
                {chartType !== 'pie' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5 gap-1 text-primary border-primary/30 hover:bg-primary/10"
                    onClick={handleAddSeries}
                  >
                    <Icon name="plus" size={13} />
                    <span>{t('chart.addSeries')} (Chuỗi)</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/80 bg-muted/20 p-1">
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
                            className="size-5 rounded-md border border-border/60 cursor-pointer p-0"
                            aria-label="Đổi màu chuỗi"
                          />
                          <Input
                            type="text"
                            value={s.name}
                            onChange={(e) => handleSeriesNameChange(sIdx, e.target.value)}
                            className="h-6 w-22 rounded-md border-border/60 bg-background px-1.5 text-xs font-semibold focus-visible:outline-primary"
                          />
                          {series.length > 1 && (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveSeries(sIdx)}
                                    aria-label="Xóa chuỗi"
                                  >
                                    ✕
                                  </Button>
                                }
                              />
                              <TooltipContent side="top">Xóa chuỗi này</TooltipContent>
                            </Tooltip>
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
                        <Input
                          type="text"
                          value={cat}
                          onChange={(e) => handleCategoryChange(cIdx, e.target.value)}
                          className="h-7 w-full rounded-md border-border/60 bg-background px-2 text-xs font-medium focus-visible:outline-primary"
                        />
                      </td>
                      {series.map((s, sIdx) => (
                        <td key={sIdx} className="p-1.5">
                          <Input
                            type="number"
                            value={s.data[cIdx] ?? 0}
                            onChange={(e) => handleDataChange(sIdx, cIdx, e.target.value)}
                            className="h-7 w-full rounded-md border-border/60 bg-background px-2 text-xs focus-visible:outline-primary"
                          />
                        </td>
                      ))}
                      <td className="p-1.5 text-center">
                        {categories.length > 1 && (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveCategory(cIdx)}
                                  aria-label="Xóa hàng này"
                                >
                                  ✕
                                </Button>
                              }
                            />
                            <TooltipContent side="left">Xóa hàng này</TooltipContent>
                          </Tooltip>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 pt-4 mt-2 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="px-4 text-xs font-medium border-border/80 bg-background text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="default"
            size="default"
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-600 font-semibold px-5 text-xs shadow-sm hover:shadow transition-all gap-1.5 cursor-pointer"
            onClick={handleSave}
          >
            <Icon name="check" size={14} />
            <span>{t('chart.save')}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
