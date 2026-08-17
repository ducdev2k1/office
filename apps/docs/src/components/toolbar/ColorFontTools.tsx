import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import { useRef, type RefObject } from 'react';

const FONT_FAMILIES = ['Arial', 'Roboto', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

interface ColorFontToolsProps {
  editor: Editor;
  fontPickerRef: RefObject<HTMLSelectElement | null>;
  colorPickerRef: RefObject<HTMLInputElement | null>;
}

export const ColorFontTools = ({ editor, fontPickerRef, colorPickerRef }: ColorFontToolsProps) => {
  const { t } = useTranslation('docs');
  const colorHighlightRef = useRef<HTMLInputElement>(null);
  const textStyle = editor.getAttributes('textStyle');

  return (
    <>
      <div className="color-controls">
        <button
          className={`tool-button ${textStyle.color ? 'active' : ''}`}
          type="button"
          title={t('toolbar.textColor')}
          aria-label={t('toolbar.textColor')}
          onClick={() => colorPickerRef.current?.click()}
        >
          <Icon name="baseline" />
        </button>
        <input
          ref={colorPickerRef}
          className="hidden-color-input"
          type="color"
          value={typeof textStyle.color === 'string' ? textStyle.color : '#000000'}
          onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
          aria-label={t('toolbar.selectTextColor')}
        />
        <button
          className={`tool-button ${editor.isActive('highlight') ? 'active' : ''}`}
          type="button"
          title={t('toolbar.highlightColor')}
          aria-label={t('toolbar.highlightColor')}
          onClick={() => colorHighlightRef.current?.click()}
        >
          <Icon name="highlighter" />
        </button>
        <input
          ref={colorHighlightRef}
          className="hidden-color-input"
          type="color"
          value="#fef000"
          onChange={(event) =>
            editor.chain().focus().toggleHighlight({ color: event.target.value }).run()
          }
          aria-label={t('toolbar.selectHighlightColor')}
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