import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from '@office/ui-kit';
import { useTranslation } from '@office/i18n';
import type { Editor } from '@tiptap/core';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';

interface TablePropertiesProps {
  editor: Editor;
}

const TABLE_CELL_COLORS = [
  { name: 'transparent', label: 'None' },
  { name: '#fef2f2', label: 'Red' },
  { name: '#fefce8', label: 'Yellow' },
  { name: '#f0fdf4', label: 'Green' },
  { name: '#eff6ff', label: 'Blue' },
  { name: '#f3e8ff', label: 'Purple' },
  { name: '#f1f5f9', label: 'Gray' },
];

export const TableProperties = ({ editor }: TablePropertiesProps) => {
  const { t } = useTranslation('docs');

  const canMerge = editor.can().mergeCells();
  const canSplit = editor.can().splitCell();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<span className="inline-flex" />}>
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
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t('toolbar.cellBackground')}</DropdownMenuLabel>
        <div className="flex items-center gap-1 px-2 py-1 flex-wrap">
          {TABLE_CELL_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              className="size-5 rounded border border-border transition-transform hover:scale-110"
              style={{ backgroundColor: color.name === 'transparent' ? '#ffffff' : color.name }}
              onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', color.name).run()}
              aria-label={color.label}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};