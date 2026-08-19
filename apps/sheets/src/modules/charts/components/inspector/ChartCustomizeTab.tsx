import { Button, Input, Switch, cn } from '@office/ui-kit';
import { DEFAULT_PALETTES } from '../../constants/charts.constants';
import type { ChartSpec, LegendPosition } from '../../types/charts.types';

export interface ChartCustomizeTabProps {
  spec: ChartSpec;
  onUpdateSpec: (partial: Partial<ChartSpec>) => void;
}

export const ChartCustomizeTab = ({ spec, onUpdateSpec }: ChartCustomizeTabProps) => {
  const legendPositions: { value: LegendPosition; label: string }[] = [
    { value: 'top', label: 'Trên cùng' },
    { value: 'bottom', label: 'Dưới cùng' },
    { value: 'left', label: 'Bên trái' },
    { value: 'right', label: 'Bên phải' },
    { value: 'none', label: 'Không hiển thị' },
  ];

  const palettes = [
    { key: 'inet', name: 'iNET Chuẩn', colors: DEFAULT_PALETTES.inet },
    { key: 'warm', name: 'Ấm áp (Warm)', colors: DEFAULT_PALETTES.warm },
    { key: 'cool', name: 'Mát mẻ (Cool)', colors: DEFAULT_PALETTES.cool },
    { key: 'pastel', name: 'Pastel nhẹ', colors: DEFAULT_PALETTES.pastel },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Tiêu đề biểu đồ */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="chart-title-input" className="text-xs font-semibold text-foreground">
          Tiêu đề chính
        </label>
        <Input
          id="chart-title-input"
          value={spec.title}
          onChange={(e) => onUpdateSpec({ title: e.target.value })}
          placeholder="Nhập tiêu đề..."
          className="h-8 text-xs"
        />
      </div>

      {/* 2. Tiêu đề phụ */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="chart-sub-input" className="text-xs font-semibold text-foreground">
          Phụ đề (Subtitle)
        </label>
        <Input
          id="chart-sub-input"
          value={spec.subtitle || ''}
          onChange={(e) => onUpdateSpec({ subtitle: e.target.value })}
          placeholder="Mô tả bổ sung (nếu có)..."
          className="h-8 text-xs"
        />
      </div>

      {/* 3. Chú giải (Legend) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Vị trí chú giải (Legend)</label>
        <div className="grid grid-cols-2 gap-1.5">
          {legendPositions.map((pos) => {
            const isSelected =
              pos.value === 'none'
                ? !spec.legend.show
                : spec.legend.show && spec.legend.position === pos.value;
            return (
              <Button
                key={pos.value}
                variant="outline"
                size="sm"
                aria-pressed={isSelected}
                onClick={() =>
                  onUpdateSpec({
                    legend: {
                      show: pos.value !== 'none',
                      position: pos.value === 'none' ? 'top' : pos.value,
                    },
                  })
                }
                className={cn(
                  'h-auto rounded-md px-1.5 py-1.5',
                  isSelected
                    ? 'border-primary bg-primary/10 font-semibold text-primary hover:bg-primary/15 hover:text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {pos.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 4. Bộ màu sắc (Palette) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Bảng màu sắc</label>
        <div className="flex flex-col gap-1.5">
          {palettes.map((p) => {
            const isSelected =
              JSON.stringify(spec.palette) === JSON.stringify(p.colors) ||
              (!spec.palette && p.key === 'inet');
            return (
              <Button
                key={p.key}
                variant="outline"
                size="sm"
                aria-pressed={isSelected}
                onClick={() => onUpdateSpec({ palette: p.colors })}
                className={cn(
                  'h-auto w-full justify-between rounded-md p-2',
                  isSelected && 'border-primary bg-primary/5 ring-1 ring-primary',
                )}
              >
                <span className="font-medium text-foreground">{p.name}</span>
                <div className="flex items-center gap-1">
                  {p.colors.slice(0, 5).map((color, i) => (
                    <span
                      key={i}
                      style={{ backgroundColor: color }}
                      className="h-3.5 w-3.5 rounded-full shadow-xs"
                    />
                  ))}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 5. Tùy chọn bánh Donut (với Pie chart) */}
      {spec.type === 'pie' && (
        <div className="flex items-center justify-between rounded-md border border-border p-2.5">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">Dạng bánh Donut</span>
            <span className="text-[11px] text-muted-foreground">Khoét rỗng tâm hình tròn</span>
          </div>
          <Switch
            checked={Boolean(spec.isDonut)}
            onCheckedChange={(checked) => onUpdateSpec({ isDonut: Boolean(checked) })}
          />
        </div>
      )}
    </div>
  );
};
