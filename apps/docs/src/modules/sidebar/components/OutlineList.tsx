import type { OutlineItem } from '@/types/common.types';
import { useTranslation } from '@office/i18n';
import { Button, cn } from '@office/ui-kit';

interface OutlineListProps {
  outline: OutlineItem[];
}

export const OutlineList = ({ outline }: OutlineListProps) => {
  const { t } = useTranslation('docs');

  const handleScrollToHeading = (index: number) => {
    const headings = document.querySelectorAll('.tiptap h1, .tiptap h2, .tiptap h3');
    if (headings[index]) {
      headings[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="mt-5 pt-3.5 border-t border-border">
      <div className="my-0 mx-2 mb-2 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
        {t('sidebar.outlineTitle')}
      </div>
      {outline.length ? (
        outline.map((item, index) => (
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start py-1.5 px-2.5 h-auto text-foreground truncate text-left text-xs',
              item.level === 1 && 'font-medium',
              item.level === 2 && 'pl-5',
              item.level === 3 && 'pl-8 text-muted-foreground',
            )}
            key={item.id}
            type="button"
            onClick={() => handleScrollToHeading(index)}
          >
            {item.text}
          </Button>
        ))
      ) : (
        <p className="my-3.5 mx-2 text-muted-foreground text-xs leading-relaxed">
          {t('sidebar.emptyOutline')}
        </p>
      )}
    </div>
  );
};
