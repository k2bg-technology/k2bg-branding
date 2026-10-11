import type { PivotTableSection, SourceDefinition } from '../definition';
import type { Period, PeriodGrain } from '../period';
import { resolveSectionRange } from '../period';
import type { SortKeyQueryPlan } from './groupedValues';
import type { DateRange, MeasureQueryPlan } from './types';

export const MAXIMUM_PIVOT_SOURCE_CELLS = 10_000;

export type PivotColumnKeyPlan =
  | { kind: 'period'; grain: PeriodGrain }
  | { kind: 'category'; column: string };

export interface PivotQueryPlan {
  sectionId: string;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  rowKey: { column: string; sortKey: SortKeyQueryPlan | null };
  columnKey: PivotColumnKeyPlan;
  measure: MeasureQueryPlan;
  cellLimit: number;
}

export function planPivotTableSection(
  section: PivotTableSection,
  period: Period,
  timeZone: string
): PivotQueryPlan {
  const columns = section.columns;
  const grain =
    columns.axis === 'time' ? (columns.grain ?? period.grain) : period.grain;
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange:
      columns.axis === 'time'
        ? resolveSectionRange({ grain, window: columns.window }, period)
            .dateRange
        : { firstDate: period.firstDate, lastDate: period.lastDate },
    rowKey: {
      column: section.rows.column,
      sortKey:
        typeof section.rows.order === 'object'
          ? section.rows.order.sortKey
          : null,
    },
    columnKey:
      columns.axis === 'time'
        ? { kind: 'period', grain }
        : { kind: 'category', column: columns.column },
    measure: {
      column: section.value.column,
      reduction: section.value.reduction,
      transform: section.value.transform,
    },
    cellLimit: MAXIMUM_PIVOT_SOURCE_CELLS,
  };
}
