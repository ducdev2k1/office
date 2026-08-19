import { useTranslation } from '@office/i18n';
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
  const { t } = useTranslation('sheets');

  return (
    <div className="flex items-center gap-0.5">
      <FontSizePicker
        currentSize={fontSize}
        onChangeSize={onFontSizeChange}
        decreaseLabel={t('toolbar.font.decreaseSize')}
        increaseLabel={t('toolbar.font.increaseSize')}
        fontSizeLabel={t('toolbar.font.size')}
      />

      <ToolbarButton
        label={t('toolbar.text.bold')}
        active={bold}
        onClick={onToggleBold}
      >
        <Icon name="bold" size={16} />
      </ToolbarButton>

      <ToolbarButton
        label={t('toolbar.text.italic')}
        active={italic}
        onClick={onToggleItalic}
      >
        <Icon name="italic" size={16} />
      </ToolbarButton>

      <ToolbarButton
        label={t('toolbar.text.underline')}
        active={underline}
        onClick={onToggleUnderline}
      >
        <Icon name="underline" size={16} />
      </ToolbarButton>

      <ToolbarButton
        label={t('toolbar.text.strikethrough')}
        active={strikethrough}
        onClick={onToggleStrikethrough}
      >
        <Icon name="strikethrough" size={16} />
      </ToolbarButton>

      <ColorPalettePopover
        iconName="baseline"
        label={t('toolbar.text.color')}
        currentColor={textColor}
        onSelectColor={onTextColorChange}
        onResetColor={() => onTextColorChange('#000000')}
        resetLabel={t('toolbar.text.colorReset')}
      />

      <ColorPalettePopover
        iconName="palette"
        label={t('toolbar.text.fill')}
        currentColor={fillColor}
        onSelectColor={onFillColorChange}
        onResetColor={() => onFillColorChange('')}
        resetLabel={t('toolbar.text.fillReset')}
      />
    </div>
  );
};
