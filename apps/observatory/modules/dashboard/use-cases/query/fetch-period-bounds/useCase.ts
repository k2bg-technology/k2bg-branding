import type { DashboardDefinition, DateBounds } from '../../../domain';
import type { FetchPeriodBoundsQueryService } from './queryService';

export class FetchPeriodBounds {
  constructor(private readonly queryService: FetchPeriodBoundsQueryService) {}

  execute(dashboard: DashboardDefinition): Promise<DateBounds | null> {
    const source = dashboard.sections[0]?.source;
    if (source === undefined) {
      return Promise.resolve(null);
    }
    return this.queryService.fetchPeriodBounds(source, dashboard.timeZone, {
      name: `dashboard-${dashboard.id}-period-bounds`,
      revalidate: dashboard.revalidate,
    });
  }
}
