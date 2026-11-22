import { ChartColor, ChartPeriod } from 'ui';

import {
  type CandlestickSection as CandlestickSectionDefinition,
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
  formatPeriodRange,
  Period,
  type PeriodGrain,
  resolveSectionRange,
  timeSeriesSpine,
} from '../../../modules/dashboard/domain';
import type { SectionData } from '../../../modules/dashboard/use-cases';
import { CandlestickSectionChart } from './CandlestickSectionChart';

interface Props {
  dashboard: DashboardDefinition;
  section: CandlestickSectionDefinition;
  data: SectionData;
  period: Period;
}

function chartPeriod(
  grain: PeriodGrain,
  firstDate: string,
  lastDate: string
): ChartPeriod {
  if (grain === 'month') {
    return ChartPeriod.YEAR;
  }
  if (grain === 'week') {
    return ChartPeriod.QUARTER;
  }
  const span =
    (Date.parse(`${lastDate}T00:00:00Z`) -
      Date.parse(`${firstDate}T00:00:00Z`)) /
      86_400_000 +
    1;
  if (span <= 7) {
    return ChartPeriod.WEEK;
  }
  return span <= 31 ? ChartPeriod.MONTH : ChartPeriod.QUARTER;
}

export function CandlestickSection({
  dashboard,
  section,
  data,
  period,
}: Props) {
  const grain = section.grain ?? period.grain;
  const range = resolveSectionRange(section, period, {
    truncated: data.truncated,
    firstBucket: data.buckets[0]?.period,
  });
  const returnedPeriods = new Set(data.buckets.map(({ period }) => period));
  const candles = timeSeriesSpine(range, data.buckets, 4, dashboard.timeZone)
    .filter(({ period }) => returnedPeriods.has(period))
    .map(({ timestamp, values: [open, high, low, close] }) => ({
      timestamp,
      open,
      high,
      low,
      close,
    }));

  const first = Period.containing(grain, range.display.first.date);
  const last = Period.containing(grain, range.display.last.date);
  if (first === null || last === null) {
    return null;
  }
  const windowLabel = formatPeriodRange(first, last, dashboard.locale);
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  const redUp = section.colors === 'red-up';

  return (
    <div className="flex flex-col gap-condensed">
      <p>
        {windowLabel}
        {data.truncated && ` · ${labels.truncated}`}
      </p>
      <CandlestickSectionChart
        label={section.title}
        candles={candles}
        labels={{
          open: section.open.label,
          high: section.high.label,
          low: section.low.label,
          close: section.close.label,
        }}
        period={chartPeriod(
          grain,
          range.display.first.date,
          range.display.last.date
        )}
        locale={dashboard.locale}
        timeZone={dashboard.timeZone}
        currency={dashboard.currency}
        format={section.format}
        unit={section.unit}
        upColor={redUp ? ChartColor.ERROR : ChartColor.SUCCESS}
        downColor={redUp ? ChartColor.CHART_1 : ChartColor.ERROR}
      />
    </div>
  );
}
