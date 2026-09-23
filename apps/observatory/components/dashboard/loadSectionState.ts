import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type {
  DashboardDefinition,
  Section,
} from '../../modules/dashboard/domain';
import type {
  DashboardPeriodResolution,
  FetchSectionDataInput,
  SectionData,
} from '../../modules/dashboard/use-cases';

interface Input {
  dashboard: DashboardDefinition;
  section: Section;
  periodResolution: Promise<DashboardPeriodResolution | null>;
  fetchSectionData: (
    input: FetchSectionDataInput
  ) => Promise<SectionData | null>;
}

export type SectionState =
  | {
      status: 'ready';
      data: SectionData;
      resolution: DashboardPeriodResolution;
    }
  | { status: 'empty' }
  | { status: 'unavailable' };

export async function loadSectionState({
  dashboard,
  section,
  periodResolution,
  fetchSectionData,
}: Input): Promise<SectionState> {
  try {
    const resolution = await periodResolution;
    if (resolution === null) {
      return { status: 'empty' };
    }
    const data = await fetchSectionData({
      dashboard,
      section,
      period: resolution.period,
    });
    if (
      data === null ||
      !data.buckets.some(
        (bucket) => bucket.period === resolution.period.toString()
      )
    ) {
      return { status: 'empty' };
    }
    return { status: 'ready', data, resolution };
  } catch (error) {
    dashboardLogger.error(
      { err: error, dashboardId: dashboard.id, sectionId: section.id },
      'Failed to load dashboard section'
    );
    return { status: 'unavailable' };
  }
}
