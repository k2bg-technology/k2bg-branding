import { type AggregatingSection, SectionKind } from '../definition';
import type { Period } from '../period';
import { planStatTilesSection } from './statTiles';
import { planTimeSeriesSection } from './timeSeries';
import type { SectionQueryPlan } from './types';

function assertNever(value: never): never {
  throw new Error(`Unsupported section kind: ${JSON.stringify(value)}`);
}

export function planSection(
  section: AggregatingSection,
  period: Period,
  timeZone: string
): SectionQueryPlan {
  switch (section.kind) {
    case SectionKind.STAT_TILES:
      return planStatTilesSection(section, period, timeZone);
    case SectionKind.TIME_SERIES:
      return planTimeSeriesSection(section, period, timeZone);
    default:
      return assertNever(section);
  }
}
