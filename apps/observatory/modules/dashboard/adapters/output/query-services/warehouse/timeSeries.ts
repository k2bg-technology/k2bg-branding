import type { SectionQueryPlan } from '../../../../domain';
import type { BuiltQuery } from './query';
import { buildGroupedSectionQuery } from './statTiles';

export function buildTimeSeriesQuery(
  plan: Extract<SectionQueryPlan, { kind: 'time-series' }>
): BuiltQuery {
  return buildGroupedSectionQuery(plan, 'DESC', plan.bucketLimit);
}
