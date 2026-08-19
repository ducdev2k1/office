import { Icon, ToolbarButton } from '@office/ui-kit';

export interface InsertToolsProps {
  onInsertLink: () => void;
  onInsertCheckbox: () => void;
  onCreateFilter: () => void;
  onInsertChart?: () => void;
}

export const InsertTools = ({
  onInsertLink,
  onInsertCheckbox,
  onCreateFilter,
  onInsertChart,
}: InsertToolsProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {/* Insert Chart */}
      {onInsertChart && (
        <ToolbarButton label="Chèn biểu đồ (Chart)" onClick={onInsertChart}>
          <Icon name="bar-chart-2" size={16} />
        </ToolbarButton>
      )}

      {/* Insert Link */}
      <ToolbarButton label="Chèn đường liên kết (Ctrl+K)" onClick={onInsertLink}>
        <Icon name="link" size={16} />
      </ToolbarButton>

      {/* Insert Checkbox */}
      <ToolbarButton label="Chèn hộp kiểm (Checkbox)" onClick={onInsertCheckbox}>
        <Icon name="check-square" size={16} />
      </ToolbarButton>

      {/* Create Filter */}
      <ToolbarButton label="Tạo bộ lọc dữ liệu" onClick={onCreateFilter}>
        <Icon name="filter" size={16} />
      </ToolbarButton>
    </div>
  );
};
