import type { ECharts } from 'echarts';

export type { ECharts };

type EchartsModule = typeof import('echarts');

let modulePromise: Promise<EchartsModule> | null = null;

export const loadEcharts = (): Promise<EchartsModule> => {
  if (!modulePromise) {
    modulePromise = import('echarts');
  }
  return modulePromise;
};
