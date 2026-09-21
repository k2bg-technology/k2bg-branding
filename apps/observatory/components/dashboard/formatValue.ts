import type {
  DashboardDefinition,
  StatTileDefinition,
} from '../../modules/dashboard/domain';

export const NULL_VALUE = '—';

function numberFormatOptions(
  tile: StatTileDefinition,
  dashboard: Pick<DashboardDefinition, 'currency'>
): Intl.NumberFormatOptions {
  if (tile.format.type === 'currency') {
    return { style: 'currency', currency: dashboard.currency };
  }
  if (tile.format.type === 'percent') {
    return { style: 'percent' };
  }
  return {};
}

export function formatValue(
  value: number,
  tile: StatTileDefinition,
  dashboard: Pick<DashboardDefinition, 'locale' | 'currency'>
): string {
  const options = numberFormatOptions(tile, dashboard);
  const scaledValue =
    tile.format.type === 'percent' && tile.format.inputScale === 'percent'
      ? value / 100
      : value;
  const formatted = new Intl.NumberFormat(dashboard.locale, options).format(
    scaledValue
  );
  return tile.unit === undefined ? formatted : `${formatted} ${tile.unit}`;
}
