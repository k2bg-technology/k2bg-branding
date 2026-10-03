import { StatTile, type StatTileDelta, StatTileSentiment } from 'ui';

import type {
  DashboardDefinition,
  Period,
  PeriodComparison,
  StatTileDefinition,
  StatTilesSection as StatTilesSectionDefinition,
} from '../../../modules/dashboard/domain';
import { comparePreviousPeriod } from '../../../modules/dashboard/domain';
import type { SectionData } from '../../../modules/dashboard/use-cases';
import { formatValue, NULL_VALUE } from '../formatValue';

interface Props {
  dashboard: DashboardDefinition;
  section: StatTilesSectionDefinition;
  data: SectionData;
  period: Period;
}

function deltaFor(
  comparison: PeriodComparison | null,
  tile: StatTileDefinition,
  dashboard: DashboardDefinition
): StatTileDelta | undefined {
  if (comparison === null) {
    return undefined;
  }
  if (comparison.relativeChange === null) {
    return {
      label: formatValue(comparison.absoluteChange, tile, dashboard, 'always'),
      trend: comparison.trend,
      sentiment: comparison.sentiment ?? StatTileSentiment.NEUTRAL,
    };
  }
  return {
    label: new Intl.NumberFormat(dashboard.locale, {
      style: 'percent',
      signDisplay: 'always',
    }).format(comparison.relativeChange),
    trend: comparison.trend,
    sentiment: comparison.sentiment ?? StatTileSentiment.NEUTRAL,
  };
}

export function StatTilesSection({ dashboard, section, data, period }: Props) {
  const current = data.buckets.find(
    (bucket) => bucket.period === period.toString()
  );
  const previous = data.buckets.find(
    (bucket) => bucket.period === period.shift(-1).toString()
  );
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-spacious">
      {section.tiles.map((tile, index) => {
        const value = current?.values[index] ?? null;
        const comparison =
          tile.comparison === undefined
            ? null
            : comparePreviousPeriod(
                value,
                previous?.values[index] ?? null,
                tile.comparison.direction
              );
        const delta = deltaFor(comparison, tile, dashboard);
        return (
          <StatTile
            key={`${tile.column}-${tile.label}`}
            label={tile.label}
            delta={delta}
            value={
              value === null ? NULL_VALUE : formatValue(value, tile, dashboard)
            }
          />
        );
      })}
    </div>
  );
}
