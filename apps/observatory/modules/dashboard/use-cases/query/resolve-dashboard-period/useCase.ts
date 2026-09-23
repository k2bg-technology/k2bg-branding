import {
  type DashboardDefinition,
  type DateBounds,
  type Period,
  periodNavigation,
  resolveDefaultPeriod,
} from '../../../domain';
import type { Clock } from './clock';
import type { FetchPeriodBoundsQueryService } from './queryService';

export interface DashboardPeriodResolution {
  period: Period;
  previousTarget: Period | null;
  nextTarget: Period | null;
  bounds: DateBounds | null;
}

export class ResolveDashboardPeriod {
  constructor(
    private readonly queryService: FetchPeriodBoundsQueryService,
    private readonly clock: Clock
  ) {}

  async execute({
    dashboard,
    requestedPeriod,
  }: {
    dashboard: DashboardDefinition;
    requestedPeriod: Period | null;
  }): Promise<DashboardPeriodResolution | null> {
    const source = dashboard.periodSource ?? dashboard.sections[0]?.source;
    if (source === undefined) {
      return null;
    }
    const bounds = await this.queryService.fetchPeriodBounds(
      source,
      dashboard.timeZone,
      {
        name: `dashboard-${dashboard.id}-period-bounds`,
        revalidate: dashboard.revalidate,
      }
    );
    if (bounds === null) {
      return requestedPeriod === null
        ? null
        : {
            period: requestedPeriod,
            bounds: null,
            previousTarget: null,
            nextTarget: null,
          };
    }
    const period =
      requestedPeriod ??
      resolveDefaultPeriod({
        defaultPeriod: dashboard.defaultPeriod,
        timeZone: dashboard.timeZone,
        bounds,
        now: this.clock.now(),
      });
    return { period, bounds, ...periodNavigation(period, bounds) };
  }
}
