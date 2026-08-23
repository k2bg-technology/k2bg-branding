export const ChartPeriod = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
} as const;
export type ChartPeriod = (typeof ChartPeriod)[keyof typeof ChartPeriod];

export const ChartColor = {
  CHART_1: 'chart-1',
  CHART_2: 'chart-2',
  CHART_3: 'chart-3',
  CHART_4: 'chart-4',
  CHART_5: 'chart-5',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;
export type ChartColor = (typeof ChartColor)[keyof typeof ChartColor];

export type ChartHeight = 'sm' | 'md' | 'lg';

export interface TimeSeriesPoint {
  timestamp: number;
  /** null renders as a gap in the line/area. */
  value: number | null;
}

export interface TimeSeriesSeries {
  id: string;
  /** Display label, already localized by the consuming app. */
  label: string;
  color?: ChartColor;
  points: TimeSeriesPoint[];
}

export interface BarSeries {
  id: string;
  /** Display label, already localized by the consuming app. */
  label: string;
  color?: ChartColor;
  /** One value per category, index-aligned with the chart's categories. */
  values: number[];
}

export interface ChartTooltipItem {
  id: string;
  label: string;
  color: string;
  value: string;
}

export interface ChartTooltipData {
  heading: string;
  items: ChartTooltipItem[];
}
