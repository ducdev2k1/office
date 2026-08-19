import { ColorPalettePopover, FontSizePicker, Icon, ToolbarButton } from '@office/ui-kit';

interface TextFormatToolsProps {
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  textColor: string;
  fillColor: string;
  onFontSizeChange: (size: number) => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onToggleStrikethrough: () => void;
  onTextColorChange: (color: string) => void;
  onFillColorChange: (color: string) => void;
}

export const TextFormatTools = ({
  fontSize,
  bold,
  italic,
  underline,
  strikethrough,
  textColor,
  fillColor,
  onFontSizeChange,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrikethrough,
  onTextColorChange,
  onFillColorChange,
}: TextFormatToolsProps) => {
  return (
    <div className="flex items-center gap-0.5">
      <FontSizePicker
        currentSize={fontSize}
        onChangeSize={onFontSizeChange}
        decreaseLabel="Giảm cỡ chữ (Ctrl+Shift+,)"
        increaseLabel="Tăng cỡ chữ (Ctrl+Shift+.)"
        fontSizeLabel="Cỡ chữ"
      />

      <ToolbarButton
        label="In đậm (Ctrl+B)"
        active={bold}
        onClick={onToggleBold}
      >
        <Icon name="bold" size={16} />
      </ToolbarButton>

      <ToolbarButton
        label="In nghiêng (Ctrl+I)"
        active={italic}
        onClick={onToggleItalic}
      >
        <Icon name="italic" size={16} />
      </ToolbarButton>

      <ToolbarButton
        label="Gạch chân (Ctrl+U)"
        active={underline}
        onClick={onToggleUnderline}
      >
        <Icon name="underline" size={16} />
      </ToolbarButton>

      <ToolbarButton
        label="Gạch ngang chữ (Alt+Shift+5)"
        active={strikethrough}
        onClick={onToggleStrikethrough}
      >
        <Icon name="strikethrough" size={16} />
      </ToolbarButton>

      <ColorPalettePopover
        iconName="baseline"
        label="Màu văn bản"
        currentColor={textColor}
        onSelectColor={onTextColorChange}
        onResetColor={() => onTextColorChange('#000000')}
        resetLabel="Mặc định"
      />

      <ColorPalettePopover
        iconName="palette"
        label="Màu nền ô (Tô màu)"
        currentColor={fillColor}
        onSelectColor={onFillColorChange}
        onResetColor={() => onFillColorChange('')}
        resetLabel="Đặt lại màu nền"
      />
    </div>
  );
};
