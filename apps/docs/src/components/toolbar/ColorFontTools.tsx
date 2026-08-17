import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import type { RefObject } from 'react';
import { ColorPalettePopover } from '@/components/toolbar/ColorPalettePopover';

const FONT_FAMILIES = ['Arial', 'Roboto', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

interface ColorFontToolsProps {
  editor: Editor;
  fontPickerRef: RefObject<HTMLSelectElement | null>;
  colorPickerRef?: RefObject<HTMLInputElement | null>;
}

export const ColorFontTools = ({ editor, fontPickerRef }: ColorFontToolsProps) => {
  const { t } = useTranslation('docs');
  const textStyle = editor.getAttributes('textStyle');
  const highlightStyle = editor.getAttributes('highlight');

  return (
    <>
      <div className="flex items-center gap-0.5">
        <ColorPalettePopover
          iconName="baseline"
          label={t('toolbar.textColor')}
          currentColor={typeof textStyle.color === 'string' ? textStyle.color : '#000000'}
          active={Boolean(textStyle.color)}
          onSelectColor={(color) => editor.chain().focus().setColor(color).run()}
          onResetColor={() => editor.chain().focus().unsetColor().run()}
        />
        <ColorPalettePopover
          iconName="highlighter"
          label={t('toolbar.highlightColor')}
          currentColor={typeof highlightStyle.color === 'string' ? highlightStyle.color : '#fef000'}
          active={editor.isActive('highlight')}
          onSelectColor={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
          onResetColor={() => editor.chain().focus().unsetHighlight().run()}
        />
      </div>
      <span className="toolbar-separator" />
      <select
        ref={fontPickerRef}
        className="tool-picker"
        title={t('toolbar.fontFamily')}
        aria-label={t('toolbar.fontFamily')}
        value={typeof textStyle.fontFamily === 'string' ? textStyle.fontFamily : ''}
        onChange={(event) => {
          const value = event.target.value;
          value
            ? editor.chain().focus().setFontFamily(value).run()
            : editor.chain().focus().unsetFontFamily().run();
        }}
      >
        <option value="">{t('toolbar.defaultFont')}</option>
        {FONT_FAMILIES.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
      <select
        className="tool-picker"
        title={t('toolbar.fontSize')}
        aria-label={t('toolbar.fontSize')}
        value={typeof textStyle.fontSize === 'string' ? textStyle.fontSize : ''}
        onChange={(event) => {
          const value = event.target.value;
          value
            ? editor.chain().focus().setFontSize(value).run()
            : editor.chain().focus().unsetFontSize().run();
        }}
      >
        <option value="">{t('toolbar.defaultSize')}</option>
        {FONT_SIZES.map((size) => (
          <option key={size} value={`${size}px`}>
            {size}
          </option>
        ))}
      </select>
    </>
  );
};