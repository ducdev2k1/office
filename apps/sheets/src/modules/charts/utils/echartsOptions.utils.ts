import type { EChartsOption } from 'echarts';
import { DEFAULT_PALETTES } from '../constants/charts.constants';
import type { ChartSpec, ParsedDataMatrix } from '../types/charts.types';

/** Nhãn hiển thị do component truyền vào để util giữ được tính thuần khiết */
export interface ChartOptionLabels {
  noData: string;
  seriesFallback: string;
  /** Mẫu tên danh mục dự phòng, ví dụ "Mục {index}" */
  categoryFallback: string;
  radarIndicator: string;
}

export const buildEChartsOption = (
  spec: ChartSpec,
  data: ParsedDataMatrix,
  isDark: boolean,
  labels: ChartOptionLabels,
): EChartsOption => {
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const splitLineColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const palette = spec.palette && spec.palette.length > 0 ? spec.palette : DEFAULT_PALETTES.inet;

  const titleOption = spec.title
    ? {
        text: spec.title,
        subtext: spec.subtitle,
        left: 'center',
        top: 6,
        textStyle: {
          color: textColor,
          fontSize: 14,
          fontWeight: 'bold' as const,
          fontFamily: 'inherit',
        },
        subtextStyle: {
          color: textMuted,
          fontSize: 11,
        },
      }
    : undefined;

  const orient: 'vertical' | 'horizontal' =
    spec.legend.position === 'left' || spec.legend.position === 'right' ? 'vertical' : 'horizontal';

  const legendOption = spec.legend.show
    ? {
        show: true,
        orient,
        left:
          spec.legend.position === 'left'
            ? 10
            : spec.legend.position === 'right'
              ? 'right'
              : 'center',
        top:
          spec.legend.position === 'top'
            ? spec.title
              ? 32
              : 10
            : spec.legend.position === 'bottom'
              ? 'bottom'
              : 'middle',
        textStyle: {
          color: textMuted,
          fontSize: 11,
        },
      }
    : { show: false };

  const gridTop = spec.title
    ? spec.legend.show && spec.legend.position === 'top'
      ? 64
      : 40
    : spec.legend.show && spec.legend.position === 'top'
      ? 40
      : 20;
  const gridBottom = spec.legend.show && spec.legend.position === 'bottom' ? 40 : 25;
  const gridLeft = spec.legend.show && spec.legend.position === 'left' ? 80 : 40;
  const gridRight = spec.legend.show && spec.legend.position === 'right' ? 80 : 20;

  const commonGrid = {
    top: gridTop,
    bottom: gridBottom,
    left: gridLeft,
    right: gridRight,
    containLabel: true,
  };

  const triggerType: 'axis' | 'item' =
    spec.type === 'pie' || spec.type === 'funnel' ? 'item' : 'axis';

  const commonTooltip = {
    trigger: triggerType,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    textStyle: { color: textColor, fontSize: 12 },
    confine: true,
  };

  // Base fallback when no data
  if (!data.categories.length && !data.seriesData.length) {
    return {
      title: titleOption,
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          fill: textMuted,
          text: labels.noData,
          fontSize: 13,
        },
      },
    };
  }

  switch (spec.type) {
    case 'bar': {
      return {
        color: palette,
        title: titleOption,
        tooltip: commonTooltip,
        legend: legendOption,
        grid: commonGrid,
        xAxis: {
          type: 'value',
          axisLabel: { color: textMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        yAxis: {
          type: 'category',
          data: data.categories,
          axisLabel: { color: textMuted, fontSize: 11 },
          axisTick: { show: false },
        },
        series: data.seriesData.map((s) => ({
          name: s.name,
          type: 'bar' as const,
          data: s.values,
          stack: spec.isStacked ? 'total' : undefined,
          itemStyle: { borderRadius: [0, 4, 4, 0] },
        })),
      };
    }

    case 'line': {
      return {
        color: palette,
        title: titleOption,
        tooltip: commonTooltip,
        legend: legendOption,
        grid: commonGrid,
        xAxis: {
          type: 'category',
          data: data.categories,
          axisLabel: { color: textMuted, fontSize: 11 },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: textMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        series: data.seriesData.map((s) => ({
          name: s.name,
          type: 'line' as const,
          data: s.values,
          smooth: spec.isSmooth ?? true,
          symbolSize: 6,
        })),
      };
    }

    case 'area': {
      return {
        color: palette,
        title: titleOption,
        tooltip: commonTooltip,
        legend: legendOption,
        grid: commonGrid,
        xAxis: {
          type: 'category',
          data: data.categories,
          axisLabel: { color: textMuted, fontSize: 11 },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: textMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        series: data.seriesData.map((s) => ({
          name: s.name,
          type: 'line' as const,
          data: s.values,
          smooth: spec.isSmooth ?? true,
          areaStyle: { opacity: 0.35 },
          stack: spec.isStacked ? 'total' : undefined,
          symbolSize: 6,
        })),
      };
    }

    case 'pie': {
      const primarySeries = data.seriesData[0];
      const pieData = data.categories.map((cat, idx) => ({
        name: cat || labels.categoryFallback.replace('{index}', String(idx + 1)),
        value: primarySeries?.values[idx] ?? 0,
      }));

      return {
        color: palette,
        title: titleOption,
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          textStyle: { color: textColor, fontSize: 12 },
        },
        legend: legendOption,
        series: [
          {
            name: primarySeries?.name || spec.title || labels.seriesFallback,
            type: 'pie' as const,
            radius: spec.isDonut ? ['42%', '72%'] : '72%',
            center: ['50%', spec.title ? '56%' : '50%'],
            data: pieData,
            itemStyle: {
              borderRadius: spec.isDonut ? 4 : 2,
              borderColor: isDark ? '#0f172a' : '#ffffff',
              borderWidth: 2,
            },
            label: {
              color: textMuted,
              fontSize: 11,
            },
          },
        ],
      };
    }

    case 'scatter': {
      const seriesList = data.seriesData.map((s) => ({
        name: s.name,
        type: 'scatter' as const,
        data: s.values.map((v, i) => [i + 1, v]),
        symbolSize: 10,
      }));

      return {
        color: palette,
        title: titleOption,
        tooltip: commonTooltip,
        legend: legendOption,
        grid: commonGrid,
        xAxis: {
          type: 'value',
          axisLabel: { color: textMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: textMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        series: seriesList,
      };
    }

    case 'radar': {
      const maxVal = Math.max(
        ...data.seriesData.flatMap((s) => s.values).filter((n) => typeof n === 'number'),
        100,
      );
      const indicator = data.categories.map((cat) => ({
        name: cat,
        max: Math.ceil(maxVal * 1.15),
      }));

      return {
        color: palette,
        title: titleOption,
        tooltip: commonTooltip,
        legend: legendOption,
        radar: {
          indicator: indicator.length > 0 ? indicator : [{ name: labels.radarIndicator, max: 100 }],
          radius: '65%',
          center: ['50%', spec.title ? '56%' : '50%'],
          axisName: { color: textMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: splitLineColor } },
          splitArea: { show: false },
        },
        series: [
          {
            type: 'radar' as const,
            data: data.seriesData.map((s) => ({
              name: s.name,
              value: s.values,
            })),
          },
        ],
      };
    }

    case 'funnel': {
      const primarySeries = data.seriesData[0];
      const funnelData = data.categories.map((cat, idx) => ({
        name: cat,
        value: primarySeries?.values[idx] ?? 0,
      }));

      return {
        color: palette,
        title: titleOption,
        tooltip: commonTooltip,
        legend: legendOption,
        series: [
          {
            name: primarySeries?.name || spec.title,
            type: 'funnel' as const,
            left: '15%',
            top: spec.title ? 60 : 30,
            bottom: 30,
            width: '70%',
            data: funnelData,
            label: { color: textMuted, fontSize: 11 },
          },
        ],
      };
    }

    case 'combo': {
      return {
        color: palette,
        title: titleOption,
        tooltip: commonTooltip,
        legend: legendOption,
        grid: commonGrid,
        xAxis: {
          type: 'category',
          data: data.categories,
          axisLabel: { color: textMuted, fontSize: 11 },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: textMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        series: data.seriesData.map((s, idx) => ({
          name: s.name,
          type: (idx % 2 === 0 ? 'bar' : 'line') as 'bar' | 'line',
          data: s.values,
          smooth: true,
          itemStyle: idx % 2 === 0 ? { borderRadius: [4, 4, 0, 0] } : undefined,
        })),
      };
    }

    case 'column':
    default: {
      return {
        color: palette,
        title: titleOption,
        tooltip: commonTooltip,
        legend: legendOption,
        grid: commonGrid,
        xAxis: {
          type: 'category',
          data: data.categories,
          axisLabel: { color: textMuted, fontSize: 11 },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: textMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        series: data.seriesData.map((s) => ({
          name: s.name,
          type: 'bar' as const,
          data: s.values,
          stack: spec.isStacked ? 'total' : undefined,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        })),
      };
    }
  }
};
