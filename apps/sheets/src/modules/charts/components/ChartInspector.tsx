import { Button, Icon, ScrollArea, Separator } from '@office/ui-kit';
import { useState } from 'react';
import type { ChartSpec } from '../types/charts.types';
import { ChartCustomizeTab } from './inspector/ChartCustomizeTab';
import { ChartSetupTab } from './inspector/ChartSetupTab';

export interface ChartInspectorProps {
  spec: ChartSpec | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSpec: (updater: Partial<ChartSpec>) => void;
  onDeleteChart?: () => void;
}

export const ChartInspector = ({
  spec,
  isOpen,
  onClose,
  onUpdateSpec,
  onDeleteChart,
}: ChartInspectorProps) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'customize'>('setup');

  if (!isOpen || !spec) return null;

  return (
    <aside
      aria-label="Trình chỉnh sửa biểu đồ"
      className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-background text-foreground shadow-lg animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <Icon name="bar-chart-2" size={16} className="text-primary" />
          <h3 className="text-sm font-semibold">Trình chỉnh sửa biểu đồ</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <Icon name="x" size={16} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 border-b border-border bg-muted/30 p-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('setup')}
          className={`flex h-8 items-center justify-center gap-1.5 rounded-md font-medium transition-all ${
            activeTab === 'setup'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="settings" size={13} />
          <span>Thiết lập</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('customize')}
          className={`flex h-8 items-center justify-center gap-1.5 rounded-md font-medium transition-all ${
            activeTab === 'customize'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="palette" size={13} />
          <span>Tùy chỉnh</span>
        </button>
      </div>

      {/* Tab Content */}
      <ScrollArea className="flex-1 p-4">
        {activeTab === 'setup' ? (
          <ChartSetupTab spec={spec} onUpdateSpec={onUpdateSpec} />
        ) : (
          <ChartCustomizeTab spec={spec} onUpdateSpec={onUpdateSpec} />
        )}
      </ScrollArea>

      {/* Footer Actions */}
      {onDeleteChart && (
        <div className="shrink-0 border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteChart}
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
          >
            <Icon name="trash-2" size={14} className="mr-1.5" />
            Xoá biểu đồ này
          </Button>
        </div>
      )}
    </aside>
  );
};
