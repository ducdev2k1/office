import { useTranslation } from '@office/i18n';
import { Icon, ToolbarButton } from '@office/ui-kit';

export interface InsertToolsProps {
  onInsertLink: () => void;
  onInsertCheckbox: () => void;
  onCreateFilter: () => void;
  onInsertChart?: () => void;
  onInsertImage?: () => void;
  onAddComment?: () => void;
  onOpenCommentsSidebar?: () => void;
}

export const InsertTools = ({
  onInsertLink,
  onInsertCheckbox,
  onCreateFilter,
  onInsertChart,
  onInsertImage,
  onAddComment,
  onOpenCommentsSidebar,
}: InsertToolsProps) => {
  const { t } = useTranslation('sheets');

  return (
    <div className="flex items-center gap-0.5">
      {/* Insert Chart */}
      {onInsertChart && (
        <ToolbarButton label={t('toolbar.insert.chart')} onClick={onInsertChart}>
          <Icon name="bar-chart-2" size={16} />
        </ToolbarButton>
      )}

      {/* Insert Image */}
      {onInsertImage && (
        <ToolbarButton label={t('images.insertTitle')} onClick={onInsertImage}>
          <Icon name="image" size={16} />
        </ToolbarButton>
      )}

      {/* Add Comment */}
      {onAddComment && (
        <ToolbarButton label={t('comments.addComment')} onClick={onAddComment}>
          <Icon name="message-square-plus" size={16} />
        </ToolbarButton>
      )}

      {/* Open Comments Sidebar */}
      {onOpenCommentsSidebar && (
        <ToolbarButton label={t('comments.sidebarTitle')} onClick={onOpenCommentsSidebar}>
          <Icon name="message-square" size={16} />
        </ToolbarButton>
      )}

      {/* Insert Link */}
      <ToolbarButton label={t('toolbar.insert.link')} onClick={onInsertLink}>
        <Icon name="link" size={16} />
      </ToolbarButton>

      {/* Insert Checkbox */}
      <ToolbarButton label={t('toolbar.insert.checkbox')} onClick={onInsertCheckbox}>
        <Icon name="check-square" size={16} />
      </ToolbarButton>

      {/* Create Filter */}
      <ToolbarButton label={t('toolbar.insert.filter')} onClick={onCreateFilter}>
        <Icon name="filter" size={16} />
      </ToolbarButton>
    </div>
  );
};
