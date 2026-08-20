import type { SlideLayoutType } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@office/ui-kit';

interface SlideLayoutDropdownProps {
  onSelectLayout: (layout: SlideLayoutType) => void;
}

const LAYOUTS: { id: SlideLayoutType; label: string; icon: string }[] = [
  { id: 'title', label: 'Trang tiêu đề', icon: 'type' },
  { id: 'title-body', label: 'Tiêu đề và nội dung', icon: 'file-text' },
  { id: 'two-column', label: 'Hai cột nội dung', icon: 'columns' },
  { id: 'section-header', label: 'Tiêu đề phần', icon: 'heading' },
  { id: 'title-only', label: 'Chỉ tiêu đề', icon: 'align-left' },
  { id: 'comparison', label: 'So sánh 2 phương án', icon: 'grid' },
  { id: 'one-column', label: 'Một cột chính', icon: 'align-center' },
  { id: 'blank', label: 'Trang trống', icon: 'square' },
];

export const SlideLayoutDropdown = ({ onSelectLayout }: SlideLayoutDropdownProps) => {
  const { t } = useTranslation('slides');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
          />
        }
      >
        <Icon name="layout" size={13} />
        <span>Bố cục</span>
        <Icon name="chevron-down" size={11} className="opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="grid grid-cols-2 gap-1 p-1.5 w-72">
        {LAYOUTS.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => onSelectLayout(item.id)}
            className="flex flex-col items-start gap-1 p-2 rounded hover:bg-accent cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-medium text-xs">
              <Icon name={item.icon} size={13} className="text-primary" />
              <span>{item.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
