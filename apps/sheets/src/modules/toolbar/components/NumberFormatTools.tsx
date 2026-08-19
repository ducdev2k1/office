import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  ToolbarButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@office/ui-kit';

interface NumberFormatToolsProps {
  currentFormat: string;
  onSetNumberFormat: (pattern: string) => void;
  onAdjustDecimals: (delta: number) => void;
}

const NUMBER_FORMATS = [
  { label: 'Tự động (General)', pattern: 'General' },
  { label: 'Số (1,000.12)', pattern: '#,##0.00' },
  { label: 'Phần trăm (12.34%)', pattern: '0.00%' },
  { label: 'Tiền tệ (1,000 ₫)', pattern: '#,##0" ₫"' },
  { label: 'Tiền tệ ($1,000.00)', pattern: '$#,##0.00' },
  { label: 'Ngày tháng (yyyy-mm-dd)', pattern: 'yyyy-mm-dd' },
  { label: 'Giờ (hh:mm:ss)', pattern: 'hh:mm:ss' },
  { label: 'Văn bản thuần (@)', pattern: '@' },
];

export const NumberFormatTools = ({
  currentFormat,
  onSetNumberFormat,
  onAdjustDecimals,
}: NumberFormatToolsProps) => {
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        label="Định dạng tiền tệ ($ / ₫)"
        onClick={() => onSetNumberFormat('#,##0" ₫"')}
      >
        <Icon name="dollar-sign" size={16} />
      </ToolbarButton>

      <ToolbarButton
        label="Định dạng phần trăm (%)"
        onClick={() => onSetNumberFormat('0.00%')}
      >
        <Icon name="percent" size={16} />
      </ToolbarButton>

      <ToolbarButton
        label="Giảm chữ số thập phân (.00 → .0)"
        onClick={() => onAdjustDecimals(-1)}
      >
        <Icon name="arrow-left-to-line" size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Tăng chữ số thập phân (.0 → .00)"
        onClick={() => onAdjustDecimals(1)}
      >
        <Icon name="arrow-right-to-line" size={15} />
      </ToolbarButton>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Định dạng số khác"
                    className="h-7 min-w-7 px-1.5 rounded text-foreground/80 hover:text-foreground hover:bg-hover transition-colors"
                  />
                }
              >
                <Icon name="binary" size={16} />
              </DropdownMenuTrigger>
            }
          >
            {null}
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            Định dạng số
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" sideOffset={4} className="min-w-44">
          {NUMBER_FORMATS.map((item) => (
            <DropdownMenuItem
              key={item.pattern}
              onClick={() => onSetNumberFormat(item.pattern)}
              className={cn(currentFormat === item.pattern && 'bg-primary/10 text-primary font-medium')}
            >
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
