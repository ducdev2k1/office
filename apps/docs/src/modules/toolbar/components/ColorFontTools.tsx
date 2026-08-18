import { ColorPalettePopover } from '@/modules/toolbar/components/ColorPalettePopover';
import { useTranslation } from '@office/i18n';
import { Separator } from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import type { RefObject } from 'react';

const FONT_FAMILIES = ['Arial', 'Roboto', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
const FONT_SIZES = [8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

interface ColorFontToolsProps {
  editor: Editor;
  fontPickerRef?: RefObject<HTMLSelectElement | null>;
  colorPickerRef?: RefObject<HTMLInputElement | null>;
}

const selectCls =
  'h-7 rounded border border-border bg-background px-1.5 text-xs text-foreground ' +
  'outline-none hover:bg-hover focus:ring-1 focus:ring-ring transition-colors cursor-pointer';

export const ColorFontTools = ({ editor }: ColorFontToolsProps) => {
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
          currentColor={typeof highlightStyle.color === 'string' ? highlightStyle.color : undefined}
          active={editor.isActive('highlight')}
          onSelectColor={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
          onResetColor={() => editor.chain().focus().unsetHighlight().run()}
        />
      </div>

      <Separator orientation="vertical" className="h-5 w-px bg-border/50 mx-1 shrink-0" />

      <select
        aria-label={t('toolbar.fontFamily')}
        title={t('toolbar.fontFamily')}
        value={currentFont}
        onChange={(e) => {
          const val = e.target.value;
          if (val) editor.chain().focus().setFontFamily(val).run();
          else editor.chain().focus().unsetFontFamily().run();
        }}
        className={`${selectCls} min-w-[90px] max-w-[120px]`}
      >
        <option value="">{t('toolbar.defaultFont')}</option>
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
      </select>

      <select
        aria-label={t('toolbar.fontSize')}
        title={t('toolbar.fontSize')}
        value={currentSize}
        onChange={(e) => {
          const size = Number(e.target.value);
          if (size) editor.chain().focus().setFontSize(`${size}px`).run();
        }}
        className={`${selectCls} w-[46px]`}
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={String(s)}>{s}</option>
        ))}
      </select>
    </>
  );
};
