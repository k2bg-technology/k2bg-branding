import { type Section, SectionKind } from '../definition';
import type { Period } from '../period';
import { planStatTilesSection } from './statTiles';
import type { SectionQueryPlan } from './types';

function assertNever(value: never): never {
  throw new Error(`Unsupported section kind: ${JSON.stringify(value)}`);
}

export function planSection(
  section: Section,
  period: Period,
  timeZone: string
): SectionQueryPlan {
  switch (section.kind) {
    case SectionKind.STAT_TILES:
      return planStatTilesSection(section, period, timeZone);
    default:
      return assertNever(section.kind);
  }
}
