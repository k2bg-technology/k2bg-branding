import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type {
  DashboardDefinition,
  Section,
  StatTilesSection,
  TableSection,
  TimeSeriesSection,
} from '../../modules/dashboard/domain';
import { SectionKind } from '../../modules/dashboard/domain';
import type {
  DashboardPeriodResolution,
  FetchSectionDataInput,
  FetchTableRowsInput,
  SectionData,
  TableRows,
} from '../../modules/dashboard/use-cases';

interface Input {
  dashboard: DashboardDefinition;
  section: Section;
  periodResolution: Promise<DashboardPeriodResolution | null>;
  fetchSectionData: (
    input: FetchSectionDataInput
  ) => Promise<SectionData | null>;
  fetchTableRows: (input: FetchTableRowsInput) => Promise<TableRows | null>;
  page: number;
}

export type SectionState =
  | {
      status: 'ready';
      kind: 'stat-tiles';
      section: StatTilesSection;
      data: SectionData;
      resolution: DashboardPeriodResolution;
    }
  | {
      status: 'ready';
      kind: 'time-series';
      section: TimeSeriesSection;
      data: SectionData;
      resolution: DashboardPeriodResolution;
    }
  | {
      status: 'ready';
      kind: 'table';
      section: TableSection;
      data: TableRows;
      resolution: DashboardPeriodResolution;
    }
  | { status: 'empty' }
  | { status: 'unavailable' };

export async function loadSectionState({
  dashboard,
  section,
  periodResolution,
  fetchSectionData,
  fetchTableRows,
  page,
}: Input): Promise<SectionState> {
  try {
    const resolution = await periodResolution;
    if (resolution === null) {
      return { status: 'empty' };
    }
    switch (section.kind) {
      case SectionKind.STAT_TILES: {
        const data = await fetchSectionData({
          dashboard,
          section,
          period: resolution.period,
        });
        if (data === null) {
          return { status: 'empty' };
        }
        if (
          !data.buckets.some(
            (bucket) => bucket.period === resolution.period.toString()
          )
        ) {
          return { status: 'empty' };
        }
        return {
          status: 'ready',
          kind: section.kind,
          section,
          data,
          resolution,
        };
      }
      case SectionKind.TIME_SERIES: {
        const data = await fetchSectionData({
          dashboard,
          section,
          period: resolution.period,
        });
        if (data === null) {
          return { status: 'empty' };
        }
        if (data.buckets.length === 0) {
          return { status: 'empty' };
        }
        return {
          status: 'ready',
          kind: section.kind,
          section,
          data,
          resolution,
        };
      }
      case SectionKind.TABLE: {
        const data = await fetchTableRows({
          dashboard,
          section,
          period: resolution.period,
          page,
        });
        if (data === null) {
          return section.emptyMessage === undefined
            ? { status: 'empty' }
            : {
                status: 'ready',
                kind: section.kind,
                section,
                data: { rows: [], page: null },
                resolution,
              };
        }
        return {
          status: 'ready',
          kind: section.kind,
          section,
          data,
          resolution,
        };
      }
      default:
        return assertNever(section);
    }
  } catch (error) {
    dashboardLogger.error(
      { err: error, dashboardId: dashboard.id, sectionId: section.id },
      'Failed to load dashboard section'
    );
    return { status: 'unavailable' };
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported dashboard section: ${JSON.stringify(value)}`);
}
