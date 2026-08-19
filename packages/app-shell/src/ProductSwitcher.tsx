import { useTranslation } from '@office/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@office/ui-kit';
import type { ShellKind } from './types';

const PRODUCTS: { kind: ShellKind; available: boolean; icon: string }[] = [
  { kind: 'docs', available: true, icon: 'file-text' },
  { kind: 'sheets', available: true, icon: 'file-spreadsheet' },
  { kind: 'slides', available: true, icon: 'presentation' },
];


interface ProductSwitcherProps {
  current: ShellKind;
  accentVar: string;
}

/** Chon san pham Docs/Sheets/Slides — app chua ra mat thi disabled. */
export const ProductSwitcher = ({ current, accentVar }: ProductSwitcherProps) => {
  const { t } = useTranslation('appShell');
  const active = PRODUCTS.find((p) => p.kind === current) ?? PRODUCTS[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[15px] font-medium text-foreground outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <span
          className="flex size-6 items-center justify-center rounded-md text-white"
          style={{ backgroundColor: accentVar }}
          aria-hidden="true"
        >
          <Icon name={active.icon} size={16} />
        </span>
        {t(`nav.${active.kind}`)}
        <Icon name="chevron-down" size={16} className="text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6}>
        {PRODUCTS.map((p) => (
          <DropdownMenuItem key={p.kind} disabled={!p.available}>
            <Icon
              name={p.icon}
              size={16}
              className="mr-2 text-muted-foreground"
              aria-hidden="true"
            />
            {t(`nav.${p.kind}`)}
            {p.kind === current && (
              <Icon name="check" size={16} className="ml-auto" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
