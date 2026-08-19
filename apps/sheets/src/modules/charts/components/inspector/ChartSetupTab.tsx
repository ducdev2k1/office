import { Checkbox, Input, Switch } from '@office/ui-kit';
import type { ChartSpec } from '../../types/charts.types';
import { ChartTypeSelector } from './ChartTypeSelector';

export interface ChartSetupTabProps {
  spec: ChartSpec;
  onUpdateSpec: (partial: Partial<ChartSpec>) => void;
}

export const ChartSetupTab = ({ spec, onUpdateSpec }: ChartSetupTabProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* 1. Chọn loại biểu đồ */}
      <ChartTypeSelector
        selectedType={spec.type}
        onSelectType={(type) => onUpdateSpec({ type })}
      />

      {/* 2. Cấu hình dải dữ liệu */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="data-range-input" className="text-xs font-semibold text-foreground">
          Dải ô dữ liệu (Data Range)
        </label>
        <Input
          id="data-range-input"
          value={spec.dataRange}
          onChange={(e) => onUpdateSpec({ dataRange: e.target.value })}
          placeholder="Ví dụ: A1:C10"
          className="h-8 text-xs font-mono"
        />
        <span className="text-[11px] text-muted-foreground">
          Ví dụ: A1:D10 hoặc Sheet1!A1:D10
        </span>
      </div>

      {/* 3. Thiết lập tiêu đề hàng / cột */}
      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/20 p-3">
        <span className="text-xs font-medium text-foreground">Cấu trúc dữ liệu</span>
        
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <Checkbox
            checked={spec.hasHeaderRow}
            onCheckedChange={(checked) => onUpdateSpec({ hasHeaderRow: Boolean(checked) })}
          />
          <span>Sử dụng hàng 1 làm tiêu đề chuỗi</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <Checkbox
            checked={spec.hasHeaderColumn}
            onCheckedChange={(checked) => onUpdateSpec({ hasHeaderColumn: Boolean(checked) })}
          />
          <span>Sử dụng cột đầu tiên làm nhãn (Trục X)</span>
        </label>
      </div>

      {/* 4. Tùy chọn nâng cao theo kiểu biểu đồ */}
      {(spec.type === 'column' || spec.type === 'bar' || spec.type === 'area') && (
        <div className="flex items-center justify-between rounded-md border border-border p-2.5">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">Xếp chồng (Stack)</span>
            <span className="text-[11px] text-muted-foreground">Cộng dồn giá trị các chuỗi</span>
          </div>
          <Switch
            checked={Boolean(spec.isStacked)}
            onCheckedChange={(checked) => onUpdateSpec({ isStacked: Boolean(checked) })}
          />
        </div>
      )}

      {(spec.type === 'line' || spec.type === 'area' || spec.type === 'combo') && (
        <div className="flex items-center justify-between rounded-md border border-border p-2.5">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">Làm mịn đường vẽ</span>
            <span className="text-[11px] text-muted-foreground">Đường cong uốn lượn mượt mà</span>
          </div>
          <Switch
            checked={spec.isSmooth ?? true}
            onCheckedChange={(checked) => onUpdateSpec({ isSmooth: Boolean(checked) })}
          />
        </div>
      )}
    </div>
  );
};
