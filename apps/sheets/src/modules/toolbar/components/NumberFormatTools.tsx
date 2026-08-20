import { useTranslation } from '@office/i18n';
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
  { labelKey: 'toolbar.number.formats.general', pattern: 'General' },
  { labelKey: 'toolbar.number.formats.number', pattern: '#,##0.00' },
  { labelKey: 'toolbar.number.formats.percent', pattern: '0.00%' },
  { labelKey: 'toolbar.number.formats.currencyVnd', pattern: '#,##0" ₫"' },
  { labelKey: 'toolbar.number.formats.currencyUsd', pattern: '$#,##0.00' },
  { labelKey: 'toolbar.number.formats.date', pattern: 'yyyy-mm-dd' },
  { labelKey: 'toolbar.number.formats.time', pattern: 'hh:mm:ss' },
  { labelKey: 'toolbar.number.formats.text', pattern: '@' },
];

export const NumberFormatTools = ({
  currentFormat,
  onSetNumberFormat,
  onAdjustDecimals,
}: NumberFormatToolsProps) => {
  const { t } = useTranslation('sheets');

  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        label={t('toolbar.number.currency')}
        onClick={() => onSetNumberFormat('#,##0" ₫"')}
      >
        <Icon name="dollar-sign" size={16} />
      </ToolbarButton>

      <ToolbarButton label={t('toolbar.number.percent')} onClick={() => onSetNumberFormat('0.00%')}>
        <Icon name="percent" size={16} />
      </ToolbarButton>

      <ToolbarButton
        label={t('toolbar.number.decreaseDecimal')}
        onClick={() => onAdjustDecimals(-1)}
      >
        <Icon name="arrow-left-to-line" size={15} />
      </ToolbarButton>

      <ToolbarButton
        label={t('toolbar.number.increaseDecimal')}
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
                    aria-label={t('toolbar.number.moreAriaLabel')}
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
            {t('toolbar.number.label')}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" sideOffset={4} className="min-w-44">
          {NUMBER_FORMATS.map((item) => (
            <DropdownMenuItem
              key={item.pattern}
              onClick={() => onSetNumberFormat(item.pattern)}
              className={cn(
                currentFormat === item.pattern && 'bg-primary/10 text-primary font-medium',
              )}
            >
              <span>{t(item.labelKey)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
