import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  ToolbarButton,
} from '@office/ui-kit';

export interface FormulaToolsProps {
  onInsertFormula: (formula: string) => void;
  onClearFormatting: () => void;
  onOpenFindReplace: () => void;
}

const COMMON_FUNCTIONS = [
  { name: 'SUM', desc: 'Tính tổng các giá trị' },
  { name: 'AVERAGE', desc: 'Tính giá trị trung bình' },
  { name: 'COUNT', desc: 'Đếm số lượng giá trị số' },
  { name: 'MAX', desc: 'Tìm giá trị lớn nhất' },
  { name: 'MIN', desc: 'Tìm giá trị nhỏ nhất' },
];

const ADVANCED_FUNCTIONS = [
  { name: 'IF', desc: 'Kiểm tra điều kiện logic' },
  { name: 'VLOOKUP', desc: 'Tìm kiếm theo chiều dọc' },
  { name: 'COUNTIF', desc: 'Đếm theo điều kiện' },
  { name: 'SUMIF', desc: 'Tính tổng theo điều kiện' },
  { name: 'CONCATENATE', desc: 'Nối chuỗi văn bản' },
  { name: 'TRIM', desc: 'Xóa khoảng trắng thừa' },
  { name: 'ROUND', desc: 'Làm tròn số' },
  { name: 'TODAY', desc: 'Lấy ngày hiện tại' },
  { name: 'NOW', desc: 'Lấy ngày giờ hiện tại' },
];

export const FormulaTools = ({
  onInsertFormula,
  onClearFormatting,
  onOpenFindReplace,
}: FormulaToolsProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {/* Formula Σ Functions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label="Chèn hàm tính toán"
              className="flex h-7 items-center gap-0.5 rounded px-1.5 text-foreground hover:bg-accent/70"
            />
          }
        >
          <span className="font-serif text-sm font-bold leading-none">Σ</span>
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 text-xs">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              Hàm phổ biến
            </DropdownMenuLabel>
            {COMMON_FUNCTIONS.map((f) => (
              <DropdownMenuItem
                key={f.name}
                onClick={() => onInsertFormula(f.name)}
                className="flex items-center justify-between py-1 text-xs font-medium"
              >
                <span>{f.name}</span>
                <span className="text-[10px] font-normal text-muted-foreground">{f.desc}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              Logic & Thống kê
            </DropdownMenuLabel>
            {ADVANCED_FUNCTIONS.map((f) => (
              <DropdownMenuItem
                key={f.name}
                onClick={() => onInsertFormula(f.name)}
                className="flex items-center justify-between py-1 text-xs"
              >
                <span className="font-medium">{f.name}</span>
                <span className="text-[10px] text-muted-foreground">{f.desc}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Formatting */}
      <ToolbarButton
        label="Xóa định dạng (Ctrl+\)"
        onClick={onClearFormatting}
      >
        <Icon name="remove-formatting" size={16} />
      </ToolbarButton>

      {/* Find & Replace */}
      <ToolbarButton
        label="Tìm kiếm và thay thế (Ctrl+H)"
        onClick={onOpenFindReplace}
      >
        <Icon name="search" size={16} />
      </ToolbarButton>
    </div>
  );
};
