import { StatTile } from 'ui';

import type {
  DashboardDefinition,
  StatTilesSection as StatTilesSectionDefinition,
} from '../../../modules/dashboard/domain';
import type { SectionData } from '../../../modules/dashboard/use-cases';
import { formatValue, NULL_VALUE } from '../formatValue';

interface Props {
  dashboard: DashboardDefinition;
  section: StatTilesSectionDefinition;
  data: SectionData;
}

export function StatTilesSection({ dashboard, section, data }: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-spacious">
      {section.tiles.map((tile, index) => {
        const value = data.values[index] ?? null;
        return (
          <StatTile
            key={`${tile.column}-${tile.label}`}
            label={tile.label}
            value={
              value === null ? NULL_VALUE : formatValue(value, tile, dashboard)
            }
          />
        );
      })}
    </div>
  );
}
