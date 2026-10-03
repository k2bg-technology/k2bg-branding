import type { StatTilesSection } from '../definition';
import type { Period } from '../period';
import type { SectionQueryPlan } from './types';

export function planStatTilesSection(
  section: StatTilesSection,
  period: Period,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'stat-tiles' }> {
  return {
    kind: section.kind,
    sectionId: section.id,
    grain: period.grain,
    source: section.source,
    timeZone,
    selectedPeriod: period.toString(),
    dateRange: {
      firstDate: section.tiles.some((tile) => tile.comparison !== undefined)
        ? period.shift(-1).firstDate
        : period.firstDate,
      lastDate: period.lastDate,
    },
    measures: section.tiles.map((tile) => ({
      column: tile.column,
      reduction: tile.reduction,
      compares: tile.comparison !== undefined,
    })),
  };
}
