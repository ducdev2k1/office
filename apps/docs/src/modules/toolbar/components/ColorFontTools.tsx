import { ColorPalettePopover } from '@/modules/toolbar/components/ColorPalettePopover';
import { useTranslation } from '@office/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Separator,
  cn,
} from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import type { RefObject } from 'react';

const FONT_FAMILIES = ['Arial', 'Roboto', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

interface ColorFontToolsProps {
  editor: Editor;
  fontPickerRef?: RefObject<HTMLSelectElement | null>;
  colorPickerRef?: RefObject<HTMLInputElement | null>;
}

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

  const handleSelectFont = (font: string) => {
    if (font) {
      editor.chain().focus().setFontFamily(font).run();
    } else {
      editor.chain().focus().unsetFontFamily().run();
    }
  };

  const handleSelectSize = (size: number) => {
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

      <Separator orientation="vertical" className="c-tool_sep" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="c-tool_select flex items-center justify-between gap-1 min-w-[100px] max-w-[130px] border border-border/40"
              title={t('toolbar.fontFamily')}
              aria-label={t('toolbar.fontFamily')}
            />
          }
        >
          <span className="truncate">{currentFont || t('toolbar.defaultFont')}</span>
          <Icon name="chevron-down" size={12} className="opacity-60 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px] max-h-64 overflow-y-auto">
          <DropdownMenuItem
            onClick={() => handleSelectFont('')}
            className={cn('text-xs flex items-center justify-between', !currentFont && 'font-semibold bg-accent')}
          >
            <span>{t('toolbar.defaultFont')}</span>
            {!currentFont && <Icon name="check" size={14} className="text-primary" />}
          </DropdownMenuItem>
          {FONT_FAMILIES.map((font) => {
            const isSelected = currentFont.toLowerCase() === font.toLowerCase();
            return (
              <DropdownMenuItem
                key={font}
                onClick={() => handleSelectFont(font)}
                style={{ fontFamily: font }}
                className={cn('text-xs flex items-center justify-between', isSelected && 'font-semibold bg-accent')}
              >
                <span>{font}</span>
                {isSelected && <Icon name="check" size={14} className="text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="c-tool_select flex items-center justify-between gap-1 min-w-[50px] border border-border/40"
              title={t('toolbar.fontSize')}
              aria-label={t('toolbar.fontSize')}
            />
          }
        >
          <span>{currentSize}</span>
          <Icon name="chevron-down" size={12} className="opacity-60 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[70px] max-h-64 overflow-y-auto">
          {FONT_SIZES.map((size) => {
            const isSelected = currentSize === String(size);
            return (
              <DropdownMenuItem
                key={size}
                onClick={() => handleSelectSize(size)}
                className={cn('text-xs flex items-center justify-between', isSelected && 'font-semibold bg-accent')}
              >
                <span>{size}</span>
                {isSelected && <Icon name="check" size={14} className="text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
