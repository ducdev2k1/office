import { cn } from '@office/ui-kit';
import { type FontVariant, getFontFamilyCSS } from '@office/fonts';

const FONT_VARIANTS: FontVariant[] = ['Normal', 'Medium', 'Semi Bold', 'Bold'];

const VARIANT_WEIGHT: Record<FontVariant, number> = {
  Light: 300,
  Normal: 400,
  Medium: 500,
  'Semi Bold': 600,
  Bold: 700,
  Italic: 400,
  'Bold Italic': 700,
};

const VARIANT_STYLE: Record<FontVariant, string> = {
  Light: 'normal',
  Normal: 'normal',
  Medium: 'normal',
  'Semi Bold': 'normal',
  Bold: 'normal',
  Italic: 'italic',
  'Bold Italic': 'italic',
};

interface FontVariantSubmenuProps {
  font: string;
  onSelect: (font: string, variant: FontVariant) => void;
}

export const FontVariantSubmenu = ({ font, onSelect }: FontVariantSubmenuProps) => (
  <div
    className={cn(
      'absolute left-full top-0 ml-0.5 z-[60] min-w-[140px]',
      'rounded-lg border border-border bg-popover shadow-xl py-1',
    )}
  >
    {FONT_VARIANTS.map((variant) => (
      <button
        key={variant}
        type="button"
        onClick={() => onSelect(font, variant)}
        className={cn(
          'w-full px-4 py-[5px] text-left text-[13px] text-foreground',
          'hover:bg-hover transition-colors cursor-pointer',
        )}
        style={{
          ...getFontFamilyCSS(font),
          fontWeight: VARIANT_WEIGHT[variant],
          fontStyle: VARIANT_STYLE[variant],
        }}
      >
        {variant}
      </button>
    ))}
  </div>
);
