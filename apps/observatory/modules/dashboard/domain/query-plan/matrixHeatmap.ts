import type {
  AggregateReduction,
  MatrixAxis,
  MatrixHeatmapSection,
  SourceDefinition,
  ValueTransform,
} from '../definition';
import { differenceInDays, type Period, resolveMatrixRange } from '../period';
import { CELL_BUDGET } from '../presentation/cellBudget';
import type { DateRange } from './types';

const HOURS_PER_DAY = 24;

export type MatrixAxisPlan =
  | { axis: 'date' | 'hour'; length: number }
  | { axis: 'category'; column: string };

export interface MatrixQueryPlan {
  sectionId: string;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  rows: MatrixAxisPlan;
  columns: MatrixAxisPlan;
  measure: {
    column: string;
    reduction: AggregateReduction;
    transform?: ValueTransform;
  };
  cellLimit: number;
}

export function planMatrixHeatmapSection(
  section: MatrixHeatmapSection,
  period: Period,
  timeZone: string
): MatrixQueryPlan {
  const dateRange = resolveMatrixRange(section, period);
  const dayCount =
    differenceInDays(dateRange.firstDate, dateRange.lastDate) + 1;
  const planAxis = (axis: MatrixAxis): MatrixAxisPlan => {
    if (axis.axis === 'date') return { axis: 'date', length: dayCount };
    if (axis.axis === 'hour') return { axis: 'hour', length: HOURS_PER_DAY };
    return axis;
  };
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange,
    rows: planAxis(section.rows),
    columns: planAxis(section.columns),
    measure: section.value,
    cellLimit: CELL_BUDGET,
  };
}
