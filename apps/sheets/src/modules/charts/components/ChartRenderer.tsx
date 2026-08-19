import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';
import type { ChartSpec, ParsedDataMatrix } from '../types/charts.types';
import { buildEChartsOption } from '../utils/echartsOptions.utils';

export interface ChartRendererProps {
  spec: ChartSpec;
  data: ParsedDataMatrix;
  isDark?: boolean;
  className?: string;
  onInstanceReady?: (instance: echarts.ECharts) => void;
}

export const ChartRenderer = ({
  spec,
  data,
  isDark = false,
  className = '',
  onInstanceReady,
}: ChartRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!chartInstanceRef.current) {
      const chart = echarts.init(containerRef.current, undefined, {
        renderer: 'canvas',
      });
      chartInstanceRef.current = chart;
      onInstanceReady?.(chart);
    }

    const chart = chartInstanceRef.current;
    const option = buildEChartsOption(spec, data, isDark);
    chart.setOption(option, true);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [spec, data, isDark, onInstanceReady]);

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full select-none overflow-hidden ${className}`}
    />
  );
};
