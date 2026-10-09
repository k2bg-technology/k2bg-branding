import type { CalendarHeatmapSection } from '../definition';
import { type Period, PeriodGrain, resolveCalendarRange } from '../period';
import type { SectionQueryPlan } from './types';

export function planCalendarHeatmapSection(
  section: CalendarHeatmapSection,
  period: Period,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'calendar-heatmap' }> {
  return {
    kind: section.kind,
    sectionId: section.id,
    grain: PeriodGrain.DAY,
    source: section.source,
    timeZone,
    selectedPeriod: period.toString(),
    dateRange: resolveCalendarRange(section, period),
    measures: [
      {
        column: section.value.column,
        reduction: section.value.reduction,
        transform: section.value.transform,
      },
    ],
  };
}
