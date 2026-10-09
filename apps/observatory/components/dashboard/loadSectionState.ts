import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type {
  BarsSection,
  CalendarHeatmapSection,
  ControlSelections,
  DashboardDefinition,
  Period,
  Section,
  StatTilesSection,
  TableSection,
  TimeSeriesSection,
} from '../../modules/dashboard/domain';
import { SectionKind } from '../../modules/dashboard/domain';
import type {
  DashboardPeriodResolution,
  FetchBarsDataInput,
  FetchSectionDataInput,
  FetchTableRowsInput,
  GroupedValues,
  ResolveSectionGateInput,
  SectionData,
  SectionGate,
  TableRows,
} from '../../modules/dashboard/use-cases';
import { type BarsChartInput, barsChart } from './barsChart';

interface Input {
  dashboard: DashboardDefinition;
  section: Section;
  periodResolution: Promise<DashboardPeriodResolution | null>;
  resolveSectionGate: (input: ResolveSectionGateInput) => Promise<SectionGate>;
  fetchSectionData: (
    input: FetchSectionDataInput
  ) => Promise<SectionData | null>;
  fetchTableRows: (input: FetchTableRowsInput) => Promise<TableRows | null>;
  fetchBarsData: (input: FetchBarsDataInput) => Promise<GroupedValues | null>;
  page: number;
  selections: ControlSelections;
}

export type SectionState =
  | {
      status: 'ready';
      kind: 'stat-tiles';
      section: StatTilesSection;
      data: SectionData;
      period: Period;
    }
  | {
      status: 'ready';
      kind: 'time-series';
      section: TimeSeriesSection;
      data: SectionData;
      period: Period;
    }
  | {
      status: 'ready';
      kind: 'calendar-heatmap';
      section: CalendarHeatmapSection;
      data: SectionData;
      period: Period;
    }
  | {
      status: 'ready';
      kind: 'table';
      section: TableSection;
      data: TableRows;
      period: Period;
    }
  | {
      status: 'ready';
      kind: 'bars';
      section: BarsSection;
      chart: BarsChartInput;
      period: Period;
    }
  | Exclude<SectionGate, { status: 'open' }>
  | { status: 'unavailable' };

export async function loadSectionState({
  dashboard,
  section,
  periodResolution,
  resolveSectionGate,
  fetchSectionData,
  fetchTableRows,
  fetchBarsData,
  page,
  selections,
}: Input): Promise<SectionState> {
  try {
    const resolution =
      section.period === 'latest' ? null : await periodResolution;
    const gate = await resolveSectionGate({
      dashboard,
      section,
      selectedPeriod: resolution?.period ?? null,
    });
    if (gate.status !== 'open') {
      return gate;
    }
    const period = gate.period;
    switch (section.kind) {
      case SectionKind.STAT_TILES: {
        const data = await fetchSectionData({
          dashboard,
          section,
          period,
          selections,
        });
        if (data === null) {
          return { status: 'empty' };
        }
        if (
          !data.buckets.some((bucket) => bucket.period === period.toString())
        ) {
          return { status: 'empty' };
        }
        return {
          status: 'ready',
          kind: section.kind,
          section,
          data,
          period,
        };
      }
      case SectionKind.TIME_SERIES: {
        const data = await fetchSectionData({
          dashboard,
          section,
          period,
          selections,
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
          period,
        };
      }
      case SectionKind.CALENDAR_HEATMAP: {
        const data = await fetchSectionData({
          dashboard,
          section,
          period,
          selections,
        });
        if (data === null) {
          return { status: 'empty' };
        }
        return {
          status: 'ready',
          kind: section.kind,
          section,
          data,
          period,
        };
      }
      case SectionKind.TABLE: {
        const data = await fetchTableRows({
          dashboard,
          section,
          period,
          page,
          selections,
        });
        if (data === null) {
          return section.emptyMessage === undefined
            ? { status: 'empty' }
            : {
                status: 'ready',
                kind: section.kind,
                section,
                data: { rows: [], page: null },
                period,
              };
        }
        return {
          status: 'ready',
          kind: section.kind,
          section,
          data,
          period,
        };
      }
      case SectionKind.BARS: {
        const data = await fetchBarsData({
          dashboard,
          section,
          period,
        });
        if (data === null) return { status: 'empty' };
        return {
          status: 'ready',
          kind: section.kind,
          section,
          chart: barsChart(section, data, period, dashboard),
          period,
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
