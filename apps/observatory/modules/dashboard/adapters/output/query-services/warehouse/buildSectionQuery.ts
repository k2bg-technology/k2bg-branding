import { SectionKind, type SectionQueryPlan } from '../../../../domain';
import type { BuiltQuery } from './query';
import { buildGroupedSectionQuery, buildStatTilesQuery } from './statTiles';
import { buildTimeSeriesQuery } from './timeSeries';

function assertNever(value: never): never {
  throw new Error(`Unsupported section plan: ${JSON.stringify(value)}`);
}

export function buildSectionQuery(plan: SectionQueryPlan): BuiltQuery {
  switch (plan.kind) {
    case SectionKind.STAT_TILES:
      return buildStatTilesQuery(plan);
    case SectionKind.TIME_SERIES:
      return buildTimeSeriesQuery(plan);
    case SectionKind.CALENDAR_HEATMAP:
      return buildGroupedSectionQuery(plan, 'ASC');
    default:
      return assertNever(plan);
  }
}
