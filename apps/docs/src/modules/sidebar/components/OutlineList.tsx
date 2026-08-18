import type { OutlineItem } from '@/types/common.types';
import { useTranslation } from '@office/i18n';

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
    <div className="c-side_outline">
      <div className="c-side_outlabel">{t('sidebar.outlineTitle')}</div>
      {outline.length ? (
        outline.map((item, index) => (
          <button
            className={`c-side_outitem level-${item.level}`}
            key={item.id}
            type="button"
            onClick={() => handleScrollToHeading(index)}
          >
            {item.text}
          </button>
        ))
      ) : (
        <p className="c-side_empty">{t('sidebar.emptyOutline')}</p>
      )}
    </div>
  );
};
