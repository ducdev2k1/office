import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, type NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';

export type ChartType = 'bar' | 'line' | 'pie' | 'area';

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartBlockAttrs {
  chartType: ChartType;
  title: string;
  categories: string[];
  series: ChartSeries[];
  width?: string;
  height?: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chartBlock: {
      insertChart: (attrs?: Partial<ChartBlockAttrs>) => ReturnType;
      updateChart: (attrs: Partial<ChartBlockAttrs>) => ReturnType;
      deleteChart: () => ReturnType;
    };
  }

  interface Storage {
    chartBlock: {
      onEditChart: ((attrs: ChartBlockAttrs, update: (newAttrs: Partial<ChartBlockAttrs>) => void) => void) | null;
    };
  }
}

export interface ChartBlockStorage {
  onEditChart: ((attrs: ChartBlockAttrs, update: (newAttrs: Partial<ChartBlockAttrs>) => void) => void) | null;
}

export const DEFAULT_CHART_ATTRS: ChartBlockAttrs = {
  chartType: 'bar',
  title: 'Biểu đồ tăng trưởng doanh số',
  categories: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
  series: [
    { name: 'Kế hoạch', data: [120, 150, 180, 220], color: '#3b82f6' },
    { name: 'Thực tế', data: [135, 160, 175, 240], color: '#10b981' },
  ],
  width: '100%',
  height: 320,
};

export const ChartBlock = Node.create<Record<string, never>, ChartBlockStorage>({
  name: 'chartBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addStorage(): ChartBlockStorage {
    return {
      onEditChart: null,
    };
  },

  addAttributes() {
    return {
      chartType: {
        default: 'bar',
        parseHTML: (el) => (el.getAttribute('data-chart-type') as ChartType) || 'bar',
        renderHTML: (attrs) => ({ 'data-chart-type': attrs.chartType || 'bar' }),
      },
      title: {
        default: 'Biểu đồ số liệu',
        parseHTML: (el) => el.getAttribute('data-chart-title') || 'Biểu đồ số liệu',
        renderHTML: (attrs) => ({ 'data-chart-title': attrs.title || 'Biểu đồ số liệu' }),
      },
      categories: {
        default: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute('data-chart-categories') || '[]');
          } catch {
            return ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'];
          }
        },
        renderHTML: (attrs) => ({ 'data-chart-categories': JSON.stringify(attrs.categories || []) }),
      },
      series: {
        default: [
          { name: 'Kế hoạch', data: [120, 150, 180, 220], color: '#3b82f6' },
          { name: 'Thực tế', data: [135, 160, 175, 240], color: '#10b981' },
        ],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute('data-chart-series') || '[]');
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ 'data-chart-series': JSON.stringify(attrs.series || []) }),
      },
      height: {
        default: 320,
        parseHTML: (el) => parseInt(el.getAttribute('data-chart-height') || '320', 10),
        renderHTML: (attrs) => ({ 'data-chart-height': String(attrs.height || 320) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chart-block"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'chart-block',
        'data-chart-type': node.attrs.chartType,
        'data-chart-title': node.attrs.title,
        'data-chart-categories': JSON.stringify(node.attrs.categories),
        'data-chart-series': JSON.stringify(node.attrs.series),
        'data-chart-height': String(node.attrs.height),
        class: 'chart-block my-4 rounded-xl border border-border bg-card p-4 shadow-xs',
      }),
    ];
  },

  addCommands() {
    return {
      insertChart:
        (attrs = DEFAULT_CHART_ATTRS) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { ...DEFAULT_CHART_ATTRS, ...attrs },
          }),
      updateChart:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
      deleteChart:
        () =>
        ({ commands }) =>
          commands.deleteSelection(),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartBlockNodeView);
  },
});

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ChartBlockNodeView = ({ node, selected, updateAttributes, deleteNode, editor }: NodeViewProps) => {
  const attrs = node.attrs as ChartBlockAttrs;
  const { chartType, title, categories = [], series = [], height = 320 } = attrs;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleEdit = () => {
    const storage = (editor.storage as any)?.chartBlock;
    if (storage?.onEditChart) {
      storage.onEditChart(attrs, (newAttrs: Partial<ChartBlockAttrs>) => updateAttributes(newAttrs));
    }
  };

  // SVG Chart Dimensions
  const padding = { top: 40, right: 30, bottom: 50, left: 55 };
  const width = 680;
  const chartHeight = Math.max(260, height);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Max value calculation
  const allValues = series.flatMap((s) => s.data);
  const maxVal = Math.max(10, ...allValues) * 1.15;
  const numTicks = 5;

  return (
    <NodeViewWrapper
      className={`chart-block relative my-4 block overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all ${
        selected ? 'ring-2 ring-primary/80' : ''
      }`}
      data-type="chart-block"
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-foreground">{title || 'Biểu đồ số liệu'}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
            {chartType}
          </span>
        </div>

        <div className="flex items-center gap-1.5" contentEditable={false}>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-hover transition-colors cursor-pointer shadow-2xs"
            onClick={handleEdit}
          >
            <span>⚙️</span>
            <span>Chỉnh sửa số liệu</span>
          </button>
          <button
            type="button"
            className="rounded-md p-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            onClick={deleteNode}
            title="Xóa biểu đồ"
          >
            ✕
          </button>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="flex justify-center select-none overflow-x-auto py-2">
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full max-w-[680px] h-auto text-muted-foreground"
          style={{ minHeight: `${chartHeight}px` }}
        >
          {/* Y Axis Grid & Ticks */}
          {Array.from({ length: numTicks + 1 }).map((_, i) => {
            const val = Math.round((maxVal / numTicks) * (numTicks - i));
            const y = padding.top + (plotHeight / numTicks) * i;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.15}
                  strokeDasharray={i === numTicks ? 'none' : '3 3'}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="currentColor"
                  className="fill-muted-foreground text-[11px]"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bar Chart */}
          {chartType === 'bar' &&
            categories.map((cat, catIdx) => {
              const groupWidth = plotWidth / categories.length;
              const barWidth = Math.min(32, (groupWidth * 0.7) / Math.max(1, series.length));
              const startX = padding.left + groupWidth * catIdx + (groupWidth - barWidth * series.length) / 2;

              return (
                <g key={catIdx}>
                  {series.map((s, sIdx) => {
                    const val = s.data[catIdx] ?? 0;
                    const barH = (val / maxVal) * plotHeight;
                    const x = startX + sIdx * barWidth;
                    const y = padding.top + plotHeight - barH;
                    const color = s.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length]!;

                    return (
                      <rect
                        key={sIdx}
                        x={x}
                        y={y}
                        width={Math.max(2, barWidth - 3)}
                        height={Math.max(0, barH)}
                        fill={color}
                        rx="3"
                        className="transition-all hover:opacity-80"
                      />
                    );
                  })}
                  <text
                    x={padding.left + groupWidth * (catIdx + 0.5)}
                    y={chartHeight - padding.bottom + 22}
                    textAnchor="middle"
                    fontSize="11"
                    className="fill-foreground font-medium"
                  >
                    {cat}
                  </text>
                </g>
              );
            })}

          {/* Line / Area Chart */}
          {(chartType === 'line' || chartType === 'area') && (
            <>
              {categories.map((cat, catIdx) => {
                const x = padding.left + (plotWidth / Math.max(1, categories.length - 1)) * catIdx;
                return (
                  <text
                    key={catIdx}
                    x={x}
                    y={chartHeight - padding.bottom + 22}
                    textAnchor="middle"
                    fontSize="11"
                    className="fill-foreground font-medium"
                  >
                    {cat}
                  </text>
                );
              })}

              {series.map((s, sIdx) => {
                const color = s.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length]!;
                const points = s.data.map((val, catIdx) => {
                  const x = padding.left + (plotWidth / Math.max(1, categories.length - 1)) * catIdx;
                  const y = padding.top + plotHeight - (val / maxVal) * plotHeight;
                  return { x, y, val };
                });

                const pathData = points.reduce(
                  (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
                  '',
                );
                const areaData = `${pathData} L ${points[points.length - 1]?.x} ${
                  padding.top + plotHeight
                } L ${points[0]?.x} ${padding.top + plotHeight} Z`;

                return (
                  <g key={sIdx}>
                    {chartType === 'area' && (
                      <path d={areaData} fill={color} fillOpacity={0.18} />
                    )}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((pt, pIdx) => (
                      <circle
                        key={pIdx}
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#ffffff"
                        stroke={color}
                        strokeWidth="2.5"
                        className="transition-transform hover:scale-125"
                      />
                    ))}
                  </g>
                );
              })}
            </>
          )}

          {/* Pie Chart */}
          {chartType === 'pie' && (
            <g transform={`translate(${width / 2}, ${chartHeight / 2 - 10})`}>
              {(() => {
                const pieData = (series[0]?.data ?? []).slice(0, categories.length);
                const sum = pieData.reduce((a, b) => a + b, 0) || 1;
                let currentAngle = 0;
                const radius = Math.min(plotWidth, plotHeight) / 2.3;

                return pieData.map((val, idx) => {
                  const sliceAngle = (val / sum) * 2 * Math.PI;
                  const x1 = radius * Math.cos(currentAngle);
                  const y1 = radius * Math.sin(currentAngle);
                  const x2 = radius * Math.cos(currentAngle + sliceAngle);
                  const y2 = radius * Math.sin(currentAngle + sliceAngle);
                  const largeArc = sliceAngle > Math.PI ? 1 : 0;
                  const path = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  const color = DEFAULT_COLORS[idx % DEFAULT_COLORS.length]!;
                  currentAngle += sliceAngle;

                  return (
                    <path
                      key={idx}
                      d={path}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-opacity hover:opacity-85"
                    />
                  );
                });
              })()}
            </g>
          )}
        </svg>
      </div>

      {/* Legends */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
        {chartType === 'pie'
          ? categories.map((cat, i) => (
              <div key={i} className="flex items-center gap-1.5 font-medium text-foreground/80">
                <span
                  className="size-3 rounded-xs shadow-2xs"
                  style={{ backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                />
                <span>{cat}</span>
              </div>
            ))
          : series.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 font-medium text-foreground/80">
                <span
                  className="size-3 rounded-xs shadow-2xs"
                  style={{ backgroundColor: s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                />
                <span>{s.name}</span>
              </div>
            ))}
      </div>
    </NodeViewWrapper>
  );
};
