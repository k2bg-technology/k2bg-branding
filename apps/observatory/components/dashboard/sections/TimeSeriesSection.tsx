import { ChartPeriod } from 'ui';

import type {
  DashboardDefinition,
  Period,
  PeriodGrain,
  TimeSeriesSection as TimeSeriesSectionDefinition,
} from '../../../modules/dashboard/domain';
import {
  DEFAULT_DASHBOARD_LABELS,
  formatPeriodRange,
  timeSeriesSpine,
  toEpochMilliseconds,
} from '../../../modules/dashboard/domain';
import type { SectionData } from '../../../modules/dashboard/use-cases';
import { TimeSeriesSectionChart } from './TimeSeriesSectionChart';

// ChartPeriod describes the displayed span, so date buckets use date ticks.
const chartPeriodByGrain: Record<PeriodGrain, ChartPeriod> = {
  month: ChartPeriod.MONTH,
  week: ChartPeriod.QUARTER,
  day: ChartPeriod.MONTH,
};

interface Props {
  dashboard: DashboardDefinition;
  section: TimeSeriesSectionDefinition;
  data: SectionData;
  period: Period;
}

export function TimeSeriesSection({ dashboard, section, data, period }: Props) {
  const spine = timeSeriesSpine(
    period,
    section.window,
    data.buckets,
    data.truncated
  );
  const series = section.series.map((definition, index) => ({
    id: `series-${index}`,
    label: definition.label,
    points: spine.map(({ period: bucketPeriod, values }) => ({
      timestamp: toEpochMilliseconds(bucketPeriod.firstDate),
      value: values[index] ?? null,
    })),
  }));
  const first = spine[0]?.period;
  const last = spine.at(-1)?.period;
  if (first === undefined || last === undefined) {
    return null;
  }
  const windowLabel = formatPeriodRange(first, last, dashboard.locale);
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };

  return (
    <div className="flex flex-col gap-condensed">
      <p>
        {windowLabel}
        {data.truncated && ` · ${labels.truncated}`}
      </p>
      <TimeSeriesSectionChart
        label={section.title}
        chartPeriod={chartPeriodByGrain[dashboard.grain]}
        series={series}
        variant={section.variant}
        stacked={section.stacked}
        locale={dashboard.locale}
        currency={dashboard.currency}
        format={section.format}
        unit={section.unit}
      />
    </div>
  );
}
