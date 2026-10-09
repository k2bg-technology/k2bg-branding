import type {
  CalendarHeatmapSection as CalendarHeatmapSectionDefinition,
  DashboardDefinition,
  Period,
} from '../../../modules/dashboard/domain';
import {
  addDays,
  DEFAULT_DASHBOARD_LABELS,
  differenceInDays,
  resolveCalendarRange,
} from '../../../modules/dashboard/domain';
import type { SectionData } from '../../../modules/dashboard/use-cases';
import { CalendarHeatmapSectionChart } from './CalendarHeatmapSectionChart';

interface Props {
  dashboard: DashboardDefinition;
  section: CalendarHeatmapSectionDefinition;
  data: SectionData;
  period: Period;
}

export function CalendarHeatmapSection({
  dashboard,
  section,
  data,
  period,
}: Props) {
  const { firstDate, lastDate } = resolveCalendarRange(section, period);
  const valueByDate = new Map(
    data.buckets.map((bucket) => [bucket.period, bucket.values[0] ?? null])
  );
  const days = Array.from(
    { length: differenceInDays(firstDate, lastDate) + 1 },
    (_, index) => {
      const date = addDays(firstDate, index);
      return { date, value: valueByDate.get(date) ?? null };
    }
  );
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  return (
    <CalendarHeatmapSectionChart
      label={section.title}
      days={days}
      maximum={section.maximum}
      locale={dashboard.locale}
      currency={dashboard.currency}
      format={section.format}
      unit={section.unit}
      emptyLabel={labels.missingValue}
      scaleLabels={section.scaleLabels}
    />
  );
}
