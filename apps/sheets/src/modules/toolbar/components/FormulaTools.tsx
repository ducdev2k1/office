import { useTranslation } from '@office/i18n';
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

/** Mô tả hàm lấy từ i18n theo khoá toolbar.formula.functions.<name> */
const COMMON_FUNCTIONS = ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'];

const ADVANCED_FUNCTIONS = [
  'IF',
  'VLOOKUP',
  'COUNTIF',
  'SUMIF',
  'CONCATENATE',
  'TRIM',
  'ROUND',
  'TODAY',
  'NOW',
];

export const FormulaTools = ({
  onInsertFormula,
  onClearFormatting,
  onOpenFindReplace,
}: FormulaToolsProps) => {
  const { t } = useTranslation('sheets');

  return (
    <div className="flex items-center gap-0.5">
      {/* Formula Σ Functions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('toolbar.formula.insertAriaLabel')}
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
              {t('toolbar.formula.commonGroup')}
            </DropdownMenuLabel>
            {COMMON_FUNCTIONS.map((name) => (
              <DropdownMenuItem
                key={name}
                onClick={() => onInsertFormula(name)}
                className="flex items-center justify-between py-1 text-xs font-medium"
              >
                <span>{name}</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  {t(`toolbar.formula.functions.${name}`)}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              {t('toolbar.formula.advancedGroup')}
            </DropdownMenuLabel>
            {ADVANCED_FUNCTIONS.map((name) => (
              <DropdownMenuItem
                key={name}
                onClick={() => onInsertFormula(name)}
                className="flex items-center justify-between py-1 text-xs"
              >
                <span className="font-medium">{name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {t(`toolbar.formula.functions.${name}`)}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Formatting */}
      <ToolbarButton
        label={t('toolbar.formula.clearFormatting')}
        onClick={onClearFormatting}
      >
        <Icon name="remove-formatting" size={16} />
      </ToolbarButton>

      {/* Find & Replace */}
      <ToolbarButton
        label={t('toolbar.formula.findReplace')}
        onClick={onOpenFindReplace}
      >
        <Icon name="search" size={16} />
      </ToolbarButton>
    </div>
  );
};
