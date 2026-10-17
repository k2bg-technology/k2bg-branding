import { ChartPeriod, type TimeSeriesChartSeries } from 'ui';

import type {
  DashboardDefinition,
  SeriesSlot,
  TimeSeriesSection as TimeSeriesSectionDefinition,
} from '../../../modules/dashboard/domain';
import {
  DEFAULT_DASHBOARD_LABELS,
  deriveLineSeries,
  formatBucketKey,
  formatPeriodRange,
  Period,
  resolveSectionRange,
  shiftBucketStart,
  timeSeriesSpine,
  warmUpLookback,
} from '../../../modules/dashboard/domain';
import type { SectionData } from '../../../modules/dashboard/use-cases';
import { TimeSeriesSectionChart } from './TimeSeriesSectionChart';

interface Props {
  dashboard: DashboardDefinition;
  section: TimeSeriesSectionDefinition;
  data: SectionData;
  slots: SeriesSlot[];
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

export function TimeSeriesSection({
  dashboard,
  section,
  data,
  slots,
  period,
}: Props) {
  const range = resolveSectionRange(section, period, {
    truncated: data.truncated,
    firstBucket: data.buckets[0]?.period,
  });
  const lookback = warmUpLookback(section);
  const spine = timeSeriesSpine(
    lookback === 0
      ? range
      : {
          ...range,
          display: {
            first: shiftBucketStart(
              range.grain,
              range.display.first,
              -lookback
            ),
            last: range.display.last,
          },
        },
    [...(data.warmUpBuckets ?? []), ...data.buckets],
    data.buckets[0]?.values.length ?? 0,
    dashboard.timeZone
  );
  const displayFrom = formatBucketKey(range.grain, range.display.first);
  const warmUpCount = spine.filter(
    (bucket) => bucket.period < displayFrom
  ).length;
  const displaySpine = spine.slice(warmUpCount);
  const series: TimeSeriesChartSeries[] = slots.flatMap<TimeSeriesChartSeries>(
    (slot) => {
      if (slot.kind === 'band') {
        return [
          {
            kind: 'band',
            id: slot.id,
            label: slot.label,
            interpolation: slot.interpolation,
            points: displaySpine.map(({ timestamp, values }) => ({
              timestamp,
              low: values[slot.lowIndex] ?? null,
              high: values[slot.highIndex] ?? null,
            })),
          },
        ];
      }
      return deriveLineSeries(
        slot,
        spine.map(({ values }) => values[slot.valueIndex] ?? null),
        warmUpCount,
        section.stacked
      ).map((derived) => ({
        id: derived.id,
        label: derived.label,
        interpolation: slot.interpolation,
        ...(derived.overlay ? { lineStyle: 'dashed' as const } : {}),
        points: displaySpine.map(({ timestamp }, index) => ({
          timestamp,
          value: derived.values[index] ?? null,
        })),
      }));
    }
  );
  const thresholds = section.thresholds?.map((threshold, index) => ({
    id: `threshold-${index}`,
    value: threshold.value,
    label: threshold.label,
  }));
  const bands = section.bands?.map((band, index) => ({
    id: `band-${index}`,
    from: band.from,
    to: band.to,
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
      {section.period !== 'latest' && (
        <p>
          {windowLabel}
          {data.truncated && ` · ${labels.truncated}`}
        </p>
      )}
      <TimeSeriesSectionChart
        label={section.title}
        chartPeriod={chartPeriod(
          range.grain,
          range.display.first.date,
          range.display.last.date
        )}
        series={series}
        thresholds={thresholds}
        bands={bands}
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
