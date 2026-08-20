import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Separator,
} from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';

interface TablePropertiesProps {
  editor: Editor;
}

const BORDER_COLORS = [
  { name: '#94a3b8', label: 'Slate' },
  { name: '#000000', label: 'Black' },
  { name: '#ef4444', label: 'Red' },
  { name: '#f97316', label: 'Orange' },
  { name: '#22c55e', label: 'Green' },
  { name: '#3b82f6', label: 'Blue' },
];

const CELL_COLORS = [
  { name: 'transparent', label: 'None' },
  { name: '#f8fafc', label: 'White' },
  { name: '#fef3c7', label: 'Amber' },
  { name: '#fee2e2', label: 'Red' },
  { name: '#dcfce7', label: 'Green' },
  { name: '#dbeafe', label: 'Blue' },
  { name: '#f3e8ff', label: 'Purple' },
  { name: '#f1f5f9', label: 'Gray' },
];

export const TableProperties = ({ editor }: TablePropertiesProps) => {
  const { t } = useTranslation('docs');

  const canMerge = editor.can().mergeCells();
  const canSplit = editor.can().splitCell();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button type="button" />}>
        <ToolbarButton label={t('toolbar.tableProperties')} onClick={() => undefined}>
          <Icon name="sliders-horizontal" />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="w-52" sideOffset={6}>
        <DropdownMenuLabel>{t('toolbar.tableProperties')}</DropdownMenuLabel>
        <DropdownMenuItem disabled={!canMerge} onClick={() => editor.chain().focus().mergeCells().run()}>
          {t('toolbar.mergeCells')}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canSplit} onClick={() => editor.chain().focus().splitCell().run()}>
          {t('toolbar.splitCell')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('toolbar.cellBackgroundColor')}</DropdownMenuLabel>
        <div className="flex flex-wrap gap-1.5 px-2 py-1.5">
          {CELL_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              title={color.label}
              aria-label={`${t('toolbar.cellBackgroundColor')}: ${color.label}`}
              className="h-6 w-6 rounded border border-border shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: color.name }}
              onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', color.name).run()}
            />
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('toolbar.borderWidth')}</DropdownMenuLabel>
        <div className="flex gap-1 px-2 py-1.5">
          {[0.5, 1, 2, 3].map((width) => (
            <button
              key={width}
              type="button"
              className="flex-1 rounded border border-border px-1 py-0.5 text-[11px] text-muted-foreground hover:bg-accent"
              onClick={() =>
                editor.chain().focus().setCellAttribute('borderWidth', String(width)).run()
              }
            >
              {width}
            </button>
          ))}
        </div>
        <DropdownMenuLabel>{t('toolbar.borderColor')}</DropdownMenuLabel>
        <div className="flex flex-wrap gap-1.5 px-2 py-1.5">
          {BORDER_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              title={color.label}
              aria-label={`${t('toolbar.borderColor')}: ${color.label}`}
              className="h-6 w-6 rounded border border-border shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: color.name }}
              onClick={() =>
                editor.chain().focus().setCellAttribute('borderColor', color.name).run()
              }
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};