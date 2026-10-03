import type {
  DashboardDefinition,
  Period,
  TimeSeriesSection as TimeSeriesSectionDefinition,
} from '../../../modules/dashboard/domain';
import {
  DEFAULT_DASHBOARD_LABELS,
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
    points: spine.map(({ period: month, values }) => ({
      timestamp: Date.UTC(month.year, month.month - 1, 1),
      value: values[index] ?? null,
    })),
  }));
  const formatter = new Intl.DateTimeFormat(dashboard.locale, {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  const first = spine[0]?.period;
  const last = spine.at(-1)?.period;
  if (first === undefined || last === undefined) {
    return null;
  }
  const firstDate = new Date(Date.UTC(first.year, first.month - 1, 1));
  const lastDate = new Date(Date.UTC(last.year, last.month - 1, 1));
  const windowLabel =
    first.toString() === last.toString()
      ? formatter.format(firstDate)
      : formatter.formatRange(firstDate, lastDate);
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };

  return (
    <div className="flex flex-col gap-condensed">
      <p>
        {windowLabel}
        {data.truncated && ` · ${labels.truncated}`}
      </p>
      <TimeSeriesSectionChart
        label={section.title}
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
