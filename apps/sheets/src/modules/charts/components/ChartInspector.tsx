import {
  Button,
  Icon,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
  cn,
} from '@office/ui-kit';
import { useRef } from 'react';
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
  // Giữ spec cuối cùng để panel vẫn còn nội dung trong lúc chạy animation đóng
  const lastSpecRef = useRef<ChartSpec | null>(null);
  if (spec) lastSpecRef.current = spec;
  const activeSpec = spec ?? lastSpecRef.current;

  // Chưa từng mở biểu đồ nào: không dựng DOM
  if (!activeSpec) return null;

  const isVisible = isOpen && Boolean(spec);

  return (
    <aside
      aria-label="Trình chỉnh sửa biểu đồ"
      aria-hidden={!isVisible}
      // Panel đóng vẫn nằm trong DOM: chặn focus/tab vào nội dung bị che
      inert={!isVisible}
      className={cn(
        'h-full shrink-0 overflow-hidden bg-background text-foreground',
        'transition-[width,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'motion-reduce:transition-none',
        isVisible
          ? 'w-80 border-l border-border opacity-100 shadow-lg'
          : 'pointer-events-none w-0 border-l-0 opacity-0 shadow-none',
      )}
    >
      {/* Chiều rộng cố định để nội dung không bị co lại khi panel trượt vào/ra */}
      <div className="flex h-full w-80 flex-col">
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
        <Tabs defaultValue="setup" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="grid shrink-0 grid-cols-2 rounded-none border-b border-border">
            <TabsIndicator />
            <TabsTrigger value="setup">
              <Icon name="settings" size={13} />
              <span>Thiết lập</span>
            </TabsTrigger>
            <TabsTrigger value="customize">
              <Icon name="palette" size={13} />
              <span>Tùy chỉnh</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="setup">
              <ChartSetupTab spec={activeSpec} onUpdateSpec={onUpdateSpec} />
            </TabsContent>
            <TabsContent value="customize">
              <ChartCustomizeTab spec={activeSpec} onUpdateSpec={onUpdateSpec} />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
        {onDeleteChart && (
          <div className="shrink-0 border-t border-border p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteChart}
              className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Icon name="trash-2" size={14} className="mr-1.5" />
              Xoá biểu đồ này
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};
