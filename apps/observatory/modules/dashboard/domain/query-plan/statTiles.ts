import type { StatTileDefinition, StatTilesSection } from '../definition';
import type { Period } from '../period';
import type { SectionQueryPlan } from './types';

export function planStatTilesSection(
  section: StatTilesSection,
  period: Period,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'stat-tiles' }> {
  const lookback = Math.max(
    section.tiles.some((tile) => tile.comparison !== undefined) ? 1 : 0,
    ...section.tiles.map((tile) => (tile.sparkline?.window ?? 1) - 1)
  );
  const measureLookback = (tile: StatTileDefinition) =>
    Math.max(
      tile.comparison === undefined ? 0 : 1,
      (tile.sparkline?.window ?? 1) - 1
    );
  return {
    kind: section.kind,
    sectionId: section.id,
    grain: period.grain,
    source: section.source,
    timeZone,
    selectedPeriod: period.toString(),
    dateRange: {
      firstDate: period.shift(-lookback).firstDate,
      lastDate: period.lastDate,
    },
    measures: section.tiles.map((tile) => ({
      column: tile.column,
      reduction: tile.reduction,
      transform: tile.transform,
      compares: tile.comparison !== undefined,
      ...(tile.sparkline === undefined ? {} : { sparkline: tile.sparkline }),
      ...(section.tiles.every((candidate) => candidate.sparkline === undefined)
        ? {}
        : { firstPeriod: period.shift(-measureLookback(tile)).toString() }),
    })),
  };
}
