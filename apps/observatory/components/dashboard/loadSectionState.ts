import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type {
  BarsSection,
  CalendarHeatmapSection,
  ControlSelections,
  DashboardDefinition,
  DonutSection,
  MatrixHeatmapSection,
  Period,
  PivotTableSection,
  RebaseBase,
  Section,
  SeriesSlot,
  StatTilesSection,
  TableSection,
  TimeSeriesSection,
  TreemapSection,
} from '../../modules/dashboard/domain';
import {
  DEFAULT_DASHBOARD_LABELS,
  MAXIMUM_PIVOT_SERIES,
  pivotBaseBucket,
  pivotSeriesSlots,
  rebaseBaseDate,
  SectionKind,
  widenPivot,
  wideSeriesSlots,
} from '../../modules/dashboard/domain';
import type {
  CompositionData,
  DashboardPeriodResolution,
  FetchBarsDataInput,
  FetchCompositionDataInput,
  FetchMatrixDataInput,
  FetchPivotDataInput,
  FetchRebaseBaseInput,
  FetchSectionDataInput,
  FetchTableRowsInput,
  FetchTimeSeriesPivotInput,
  GroupedValues,
  MatrixData,
  PivotBuckets,
  PivotCells,
  ResolveSectionGateInput,
  SectionData,
  SectionGate,
  TableRows,
} from '../../modules/dashboard/use-cases';
import { type BarsChartInput, barsChart } from './barsChart';
import {
  type DonutChartInput,
  donutChart,
  type TreemapChartInput,
  treemapChart,
} from './compositionChart';
import { type MatrixGridInput, matrixGrid } from './matrixGrid';
import { type PivotTableInput, pivotTable } from './pivotTable';

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
  fetchCompositionData: (
    input: FetchCompositionDataInput
  ) => Promise<CompositionData | null>;
  fetchMatrixData: (input: FetchMatrixDataInput) => Promise<MatrixData | null>;
  fetchTimeSeriesPivot: (
    input: FetchTimeSeriesPivotInput
  ) => Promise<PivotBuckets | null>;
  fetchPivotData: (input: FetchPivotDataInput) => Promise<PivotCells | null>;
  fetchRebaseBase: (input: FetchRebaseBaseInput) => Promise<RebaseBase | null>;
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
      slots: SeriesSlot[];
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
  | {
      status: 'ready';
      kind: 'donut';
      section: DonutSection;
      chart: DonutChartInput;
      period: Period;
    }
  | {
      status: 'ready';
      kind: 'treemap';
      section: TreemapSection;
      chart: TreemapChartInput;
      period: Period;
    }
  | { status: 'negative' }
  | {
      status: 'ready';
      kind: 'matrix-heatmap';
      section: MatrixHeatmapSection;
      grid: MatrixGridInput;
      period: Period;
    }
  | { status: 'too-large' }
  | {
      status: 'ready';
      kind: 'pivot-table';
      section: PivotTableSection;
      table: PivotTableInput;
      period: Period;
    }
  | Exclude<SectionGate, { status: 'open' }>
  | { status: 'too-many-series'; count: number; maximum: number }
  | { status: 'unavailable' };

export async function loadSectionState({
  dashboard,
  section,
  periodResolution,
  resolveSectionGate,
  fetchSectionData,
  fetchTableRows,
  fetchBarsData,
  fetchCompositionData,
  fetchMatrixData,
  fetchTimeSeriesPivot,
  fetchPivotData,
  fetchRebaseBase,
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
      selections,
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
        const fixedBase =
          rebaseBaseDate(section) === null
            ? undefined
            : fetchRebaseBase({ dashboard, section, selections });
        if (section.pivot === undefined) {
          if (section.series === undefined)
            throw new Error('A time-series section requires series or pivot');
          const [data, base] = await Promise.all([
            fetchSectionData({ dashboard, section, period, selections }),
            fixedBase,
          ]);
          if (data === null || data.buckets.length === 0)
            return { status: 'empty' };
          return {
            status: 'ready',
            kind: section.kind,
            section,
            data,
            slots: wideSeriesSlots(section.series, base),
            period,
          };
        }
        const [data, base] = await Promise.all([
          fetchTimeSeriesPivot({ dashboard, section, period, selections }),
          fixedBase,
        ]);
        if (data === null || data.buckets.length === 0)
          return { status: 'empty' };
        const widened = widenPivot(
          data.buckets,
          {
            topN: section.pivot.topN ?? null,
            maximum: MAXIMUM_PIVOT_SERIES,
            warmUp: data.warmUpBuckets,
            base: pivotBaseBucket(base),
          },
          { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels },
          { sectionId: section.id }
        );
        if (widened.status === 'too-many-series') return widened;
        return {
          status: 'ready',
          kind: section.kind,
          section,
          data: {
            buckets: widened.buckets,
            truncated: data.truncated,
            warmUpBuckets: widened.warmUpBuckets,
          },
          slots: pivotSeriesSlots(section.pivot, widened),
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
          selections,
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
      case SectionKind.DONUT: {
        const data = await fetchCompositionData({
          dashboard,
          section,
          period,
          selections,
        });
        if (data === null) return { status: 'empty' };
        const result = donutChart(section, data, dashboard);
        if (result.status !== 'ready') return { status: result.status };
        return {
          status: 'ready',
          kind: section.kind,
          section,
          chart: result.chart,
          period,
        };
      }
      case SectionKind.TREEMAP: {
        const data = await fetchCompositionData({
          dashboard,
          section,
          period,
          selections,
        });
        if (data === null) return { status: 'empty' };
        const result = treemapChart(section, data, dashboard);
        if (result.status !== 'ready') return { status: result.status };
        return {
          status: 'ready',
          kind: section.kind,
          section,
          chart: result.chart,
          period,
        };
      }
      case SectionKind.MATRIX_HEATMAP: {
        const data = await fetchMatrixData({
          dashboard,
          section,
          period,
          selections,
        });
        if (data === null) return { status: 'empty' };
        if (data.status === 'too-large') return { status: 'too-large' };
        return {
          status: 'ready',
          kind: section.kind,
          section,
          grid: matrixGrid(section, data, period, dashboard),
          period,
        };
      }
      case SectionKind.PIVOT_TABLE: {
        const data = await fetchPivotData({
          dashboard,
          section,
          period,
          selections,
        });
        if (data === null) return { status: 'empty' };
        return {
          status: 'ready',
          kind: section.kind,
          section,
          table: pivotTable(section, data, period, dashboard),
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
