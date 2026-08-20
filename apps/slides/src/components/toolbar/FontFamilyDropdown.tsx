import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@office/ui-kit';

const FONTS = [
  { label: 'Inter (Mặc định)', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Playfair Display (Serif)', value: '"Playfair Display", serif' },
  { label: 'Merriweather (Serif)', value: 'Merriweather, serif' },
  { label: 'Lora (Serif)', value: 'Lora, serif' },
  { label: 'Caveat (Viết tay)', value: 'Caveat, cursive' },
  { label: 'Dancing Script (Nghệ thuật)', value: '"Dancing Script", cursive' },
  { label: 'JetBrains Mono (Mã lệnh)', value: '"JetBrains Mono", monospace' },
];

interface FontFamilyDropdownProps {
  currentFont?: string;
  onSelectFont: (font: string) => void;
}

export const FontFamilyDropdown = ({
  currentFont = 'Inter, sans-serif',
  onSelectFont,
}: FontFamilyDropdownProps) => {
  const currentLabel =
    FONTS.find((f) => f.value === currentFont)?.label.split(' ')[0] || 'Phông chữ';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-7 max-w-[120px] justify-between gap-1 px-2 text-xs font-normal"
          />
        }
      >
        <span className="truncate">{currentLabel}</span>
        <Icon name="chevron-down" size={11} className="opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto w-56">
        {FONTS.map((font) => (
          <DropdownMenuItem
            key={font.value}
            onClick={() => onSelectFont(font.value)}
            className={font.value === currentFont ? 'bg-accent font-semibold text-primary' : ''}
          >
            <span style={{ fontFamily: font.value }}>{font.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
