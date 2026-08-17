import { InetIcon } from '@office/ui-kit';
import { useTranslation } from '@office/i18n';
import type { Theme } from '@office/ui-kit';
import { ProductSwitcher } from './ProductSwitcher';
import type { ProductIdentity } from './types';

interface TopBarProps {
  product: ProductIdentity;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

/** Thanh tren cung dung chung cho Docs/Sheets/Slides (home + editor). */
export const TopBar = ({
  product,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}: TopBarProps) => {
  const { t } = useTranslation('appShell');

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <div className="flex items-center">
        <ProductSwitcher current={product.kind} accentVar={product.accentVar} />
      </div>
      <div className="flex flex-1 items-center justify-center px-4">
        <label className="flex h-10 w-full max-w-xl items-center gap-2 rounded-lg bg-muted px-3 text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
          <InetIcon name="search" size={16} className="shrink-0" aria-hidden="true" />
          <input
            aria-label={t('header.searchPlaceholder')}
            className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder={t('header.searchPlaceholder')}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? (
            <InetIcon name="sun" size={20} aria-hidden="true" />
          ) : (
            <InetIcon name="moon" size={20} aria-hidden="true" />
          )}
        </button>
        <span
          className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          aria-label={t('header.account')}
        >
          D
        </span>
      </div>
    </header>
  );
};