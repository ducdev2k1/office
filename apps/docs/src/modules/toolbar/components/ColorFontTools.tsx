import { ColorPalettePopover } from '@/modules/toolbar/components/ColorPalettePopover';
import {
  FontPickerPopover,
  FONT_VARIANT_WEIGHTS,
} from '@/modules/toolbar/components/FontPickerPopover';
import { FontSizePicker } from '@/modules/toolbar/components/FontSizePicker';
import { useTranslation } from '@office/i18n';
import { Separator } from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import type { RefObject } from 'react';
import type { FontVariant } from '@office/fonts';

interface ColorFontToolsProps {
  editor: Editor;
  fontPickerRef?: RefObject<HTMLButtonElement | null>;
  colorPickerRef?: RefObject<HTMLButtonElement | null>;
}

export const ColorFontTools = ({
  editor,
  fontPickerRef,
  colorPickerRef,
}: ColorFontToolsProps) => {
  const { t } = useTranslation('docs');
  const textStyle = editor.getAttributes('textStyle');
  const highlightStyle = editor.getAttributes('highlight');

  const currentFont = typeof textStyle.fontFamily === 'string' ? textStyle.fontFamily : '';
  const currentSize =
    typeof textStyle.fontSize === 'string'
      ? textStyle.fontSize.replace('px', '')
      : typeof textStyle.fontSize === 'number'
        ? String(textStyle.fontSize)
        : '14';

  const handleSelectFont = (font: string) => {
    if (font) editor.chain().focus().setFontFamily(font).run();
    else editor.chain().focus().unsetFontFamily().run();
  };

  const handleSelectVariant = (font: string, variant: FontVariant) => {
    handleSelectFont(font);
    const weight = FONT_VARIANT_WEIGHTS[variant] ?? 400;
    if (weight === 400) editor.chain().focus().unsetFontWeight().run();
    else editor.chain().focus().setFontWeight(weight).run();
  };

  const handleChangeSize = (size: number) => {
    editor.chain().focus().setFontSize(`${size}px`).run();
  };

  return (
    <>
      <div className="flex items-center gap-0.5">
        <ColorPalettePopover
          iconName="baseline"
          label={t('toolbar.textColor')}
          currentColor={typeof textStyle.color === 'string' ? textStyle.color : '#000000'}
          active={Boolean(textStyle.color)}
          triggerRef={colorPickerRef}
          onSelectColor={(color) => editor.chain().focus().setColor(color).run()}
          onResetColor={() => editor.chain().focus().unsetColor().run()}
        />
        <ColorPalettePopover
          iconName="highlighter"
          label={t('toolbar.highlightColor')}
          currentColor={typeof highlightStyle.color === 'string' ? highlightStyle.color : undefined}
          active={editor.isActive('highlight')}
          onSelectColor={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
          onResetColor={() => editor.chain().focus().unsetHighlight().run()}
        />
      </div>

      <Separator orientation="vertical" className="h-5 w-px bg-border/50 mx-1 shrink-0" />

      <FontPickerPopover
        currentFont={currentFont}
        onSelectFont={handleSelectFont}
        onSelectVariant={handleSelectVariant}
        triggerRef={fontPickerRef}
      />

      <FontSizePicker currentSize={currentSize} onChangeSize={handleChangeSize} />
    </>
  );
};