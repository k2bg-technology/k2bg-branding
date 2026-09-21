import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type {
  DashboardDefinition,
  DateBounds,
  Section,
} from '../../modules/dashboard/domain';
import { Period } from '../../modules/dashboard/domain';
import type {
  FetchSectionDataInput,
  SectionData,
} from '../../modules/dashboard/use-cases';

interface Input {
  dashboard: DashboardDefinition;
  section: Section;
  periodBounds: Promise<DateBounds | null>;
  fetchSectionData: (
    input: FetchSectionDataInput
  ) => Promise<SectionData | null>;
}

export type SectionState =
  | { status: 'ready'; data: SectionData }
  | { status: 'empty' }
  | { status: 'unavailable' };

export async function loadSectionState({
  dashboard,
  section,
  periodBounds,
  fetchSectionData,
}: Input): Promise<SectionState> {
  try {
    const bounds = await periodBounds;
    if (bounds === null) {
      return { status: 'empty' };
    }

    const period = Period.fromCalendarDate(bounds.lastDate);
    if (period === null) {
      throw new Error(`Invalid latest warehouse date: ${bounds.lastDate}`);
    }

    const data = await fetchSectionData({ dashboard, section, period });
    return data === null ? { status: 'empty' } : { status: 'ready', data };
  } catch (error) {
    dashboardLogger.error(
      { err: error, dashboardId: dashboard.id, sectionId: section.id },
      'Failed to load dashboard section'
    );
    return { status: 'unavailable' };
  }
}
