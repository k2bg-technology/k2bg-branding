import { SectionKind, type SectionQueryPlan } from '../../../../domain';
import type { BuiltQuery } from './query';
import { buildStatTilesQuery } from './statTiles';

function assertNever(value: never): never {
  throw new Error(`Unsupported section plan: ${JSON.stringify(value)}`);
}

export function buildSectionQuery(plan: SectionQueryPlan): BuiltQuery {
  switch (plan.kind) {
    case SectionKind.STAT_TILES:
      return buildStatTilesQuery(plan);
    default:
      return assertNever(plan.kind);
  }
}
