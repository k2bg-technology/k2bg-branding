import type { StatTilesSection } from '../definition';
import type { Period } from '../period';
import type { SectionQueryPlan } from './types';

export function planStatTilesSection(
  section: StatTilesSection,
  period: Period,
  timeZone: string
): SectionQueryPlan {
  return {
    kind: section.kind,
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange: {
      firstDate: period.firstDate,
      lastDate: period.lastDate,
    },
    measures: section.tiles.map((tile) => ({
      column: tile.column,
      reduction: tile.reduction,
    })),
  };
}
