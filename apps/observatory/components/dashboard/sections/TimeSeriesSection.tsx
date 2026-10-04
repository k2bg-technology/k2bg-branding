import { ChartPeriod } from 'ui';

import type {
  DashboardDefinition,
  TimeSeriesSection as TimeSeriesSectionDefinition,
} from '../../../modules/dashboard/domain';
import {
  DEFAULT_DASHBOARD_LABELS,
  formatPeriodRange,
  Period,
  resolveSectionRange,
  timeSeriesSpine,
} from '../../../modules/dashboard/domain';
import type { SectionData } from '../../../modules/dashboard/use-cases';
import { TimeSeriesSectionChart } from './TimeSeriesSectionChart';

interface Props {
  dashboard: DashboardDefinition;
  section: TimeSeriesSectionDefinition;
  data: SectionData;
  period: Period;
}

function chartPeriod(
  grain: 'month' | 'week' | 'day' | 'hour',
  firstDate: string,
  lastDate: string
): ChartPeriod {
  if (grain === 'month') {
    return ChartPeriod.MONTH;
  }
  if (grain === 'week') {
    return ChartPeriod.QUARTER;
  }
  const span =
    (Date.parse(`${lastDate}T00:00:00Z`) -
      Date.parse(`${firstDate}T00:00:00Z`)) /
      86_400_000 +
    1;
  if (grain === 'hour') {
    return span === 1 ? ChartPeriod.DAY : ChartPeriod.WEEK;
  }
  if (span <= 7) {
    return ChartPeriod.WEEK;
  }
  return span <= 31 ? ChartPeriod.MONTH : ChartPeriod.QUARTER;
}

export function TimeSeriesSection({ dashboard, section, data, period }: Props) {
  const range = resolveSectionRange(section, period, {
    truncated: data.truncated,
    firstBucket: data.buckets[0]?.period,
  });
  const spine = timeSeriesSpine(
    range,
    data.buckets,
    section.series.length,
    dashboard.timeZone
  );
  const series = section.series.map((definition, index) => ({
    id: `series-${index}`,
    label: definition.label,
    points: spine.map(({ timestamp, values }) => ({
      timestamp,
      value: values[index] ?? null,
    })),
  }));
  const labelGrain = range.grain === 'hour' ? 'day' : range.grain;
  const first = Period.containing(labelGrain, range.display.first.date);
  const last = Period.containing(labelGrain, range.display.last.date);
  if (first === null || last === null) {
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
        chartPeriod={chartPeriod(
          range.grain,
          range.display.first.date,
          range.display.last.date
        )}
        series={series}
        variant={section.variant}
        stacked={section.stacked}
        locale={dashboard.locale}
        timeZone={dashboard.timeZone}
        currency={dashboard.currency}
        format={section.format}
        unit={section.unit}
      />
    </div>
  );
}
