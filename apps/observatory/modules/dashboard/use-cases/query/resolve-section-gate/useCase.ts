import {
  type DashboardDefinition,
  type Period,
  PeriodGrain,
  Period as PeriodValue,
  resolveAvailability,
  type Section,
  type SectionBucket,
  SectionKind,
} from '../../../domain';
import type { FetchPeriodBoundsQueryService } from '../resolve-dashboard-period/queryService';
import type { FetchSectionReadinessQueryService } from './readinessQueryService';

export interface ResolveSectionGateInput {
  dashboard: DashboardDefinition;
  section: Section;
  selectedPeriod: Period | null;
}

export type SectionGate =
  | { status: 'open'; period: Period }
  | { status: 'empty' }
  | {
      status: 'accumulating';
      since: string;
      availableFrom: SectionBucket;
      note?: string;
    }
  | { status: 'not-ready'; note?: string };

function bucketGrain(section: Section, dashboardGrain: PeriodGrain) {
  if (section.kind === SectionKind.TIME_SERIES) {
    return section.grain ?? dashboardGrain;
  }
  return section.period === 'latest' ? PeriodGrain.DAY : dashboardGrain;
}

export class ResolveSectionGate {
  constructor(
    private readonly periodBoundsQueryService: FetchPeriodBoundsQueryService,
    private readonly readinessQueryService: FetchSectionReadinessQueryService
  ) {}

  async execute({
    dashboard,
    section,
    selectedPeriod,
  }: ResolveSectionGateInput): Promise<SectionGate> {
    const period = await (async () => {
      if (section.period !== 'latest') {
        return selectedPeriod;
      }
      const bounds = await this.periodBoundsQueryService.fetchPeriodBounds(
        section.source,
        dashboard.timeZone,
        {
          name: `dashboard-${dashboard.id}-section-${section.id}-latest-date`,
          revalidate: dashboard.revalidate,
        }
      );
      if (bounds === null) {
        return null;
      }
      const latestPeriod = PeriodValue.containing(
        PeriodGrain.DAY,
        bounds.lastDate
      );
      if (latestPeriod === null) {
        throw new Error('Invalid latest date');
      }
      return latestPeriod;
    })();
    if (period === null) {
      return { status: 'empty' };
    }

    const availability = section.availability;
    if (availability?.minimumBuckets !== undefined) {
      const result = resolveAvailability({
        grain: bucketGrain(section, dashboard.grain),
        since: availability.since,
        minimumBuckets: availability.minimumBuckets,
        lastDate: period.lastDate,
      });
      if (result.status === 'accumulating') {
        return {
          status: 'accumulating',
          since: availability.since,
          availableFrom: result.availableFrom,
          note: availability.note,
        };
      }
    }

    if (section.readiness !== undefined) {
      const ready = await this.readinessQueryService.fetchSectionReadiness(
        {
          sectionId: section.id,
          source: section.source,
          timeZone: dashboard.timeZone,
          dateRange: { firstDate: period.firstDate, lastDate: period.lastDate },
          column: section.readiness.column,
        },
        {
          name: `dashboard-${dashboard.id}-section-${section.id}-readiness`,
          revalidate: dashboard.revalidate,
        }
      );
      if (!ready) {
        return { status: 'not-ready', note: section.readiness.note };
      }
    }
    return { status: 'open', period };
  }
}
