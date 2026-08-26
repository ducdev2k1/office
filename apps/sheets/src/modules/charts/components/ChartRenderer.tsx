import { useTranslation } from '@office/i18n';
import { useEffect, useRef } from 'react';
import type { ChartSpec, ParsedDataMatrix } from '../types/charts.types';
import { loadEcharts, type ECharts } from '../utils/echartsLoader.utils';
import { buildEChartsOption } from '../utils/echartsOptions.utils';

export interface ChartRendererProps {
  spec: ChartSpec;
  data: ParsedDataMatrix;
  isDark?: boolean;
  className?: string;
  onInstanceReady?: (instance: ECharts) => void;
}

export const ChartRenderer = ({
  spec,
  data,
  isDark = false,
  className = '',
  onInstanceReady,
}: ChartRendererProps) => {
  const { t } = useTranslation('sheets');
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const resizeObserver = new ResizeObserver(() => {
      chartInstanceRef.current?.resize();
    });
    resizeObserver.observe(container);

    void loadEcharts().then((echarts) => {
      if (cancelled || !containerRef.current) return;

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = echarts.init(containerRef.current, undefined, {
          renderer: 'canvas',
        });
        onInstanceReady?.(chartInstanceRef.current);
      }

      const chart = chartInstanceRef.current;
      if (!chart) return;
      const option = buildEChartsOption(spec, data, isDark, {
        noData: t('chart.noData'),
        seriesFallback: t('chart.seriesFallback'),
        categoryFallback: t('chart.fallback.category'),
        radarIndicator: t('chart.fallback.radarIndicator'),
      });
      chart.setOption(option, true);
    });

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [spec, data, isDark, onInstanceReady, t]);

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`h-full w-full select-none overflow-hidden ${className}`} />
  );
};
