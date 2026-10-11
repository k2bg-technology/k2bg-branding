import type {
  DashboardDefinition,
  Section,
  UrlState,
} from '../../modules/dashboard/domain';
import { SectionKind } from '../../modules/dashboard/domain';
import type {
  CompositionData,
  DashboardPeriodResolution,
  FetchBarsDataInput,
  FetchCompositionDataInput,
  FetchMatrixDataInput,
  FetchPivotDataInput,
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
import { loadSectionState } from './loadSectionState';
import { SectionAccumulating } from './SectionAccumulating';
import { SectionAsOf } from './SectionAsOf';
import { SectionEmpty } from './SectionEmpty';
import { SectionNegativeComposition } from './SectionNegativeComposition';
import { SectionNotReady } from './SectionNotReady';
import { SectionTooLarge } from './SectionTooLarge';
import { SectionTooManySeries } from './SectionTooManySeries';
import { SectionUnavailable } from './SectionUnavailable';
import { BarsSection } from './sections/BarsSection';
import { CalendarHeatmapSection } from './sections/CalendarHeatmapSection';
import { DonutSection } from './sections/DonutSection';
import { MatrixHeatmapSection } from './sections/MatrixHeatmapSection';
import { PivotTableSection } from './sections/PivotTableSection';
import { StatTilesSection } from './sections/StatTilesSection';
import { TableSection } from './sections/TableSection';
import { TimeSeriesSection } from './sections/TimeSeriesSection';
import { TreemapSectionChart } from './sections/TreemapSectionChart';

interface Props {
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
  urlState: UrlState;
}

function assertNever(value: never): never {
  throw new Error(`Unsupported dashboard section: ${JSON.stringify(value)}`);
}

export async function DashboardSection({
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
  urlState,
}: Props) {
  const state = await loadSectionState({
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
    page: urlState.pages[section.id] ?? 1,
    selections: urlState.controls,
  });

  return (
    <section id={section.id} className="flex flex-col gap-normal">
      <h2 className="text-heading-3">{section.title}</h2>
      {state.status === 'ready' && section.period === 'latest' && (
        <SectionAsOf dashboard={dashboard} period={state.period} />
      )}
      {state.status === 'ready' &&
        section.availability !== undefined &&
        section.availability.minimumBuckets === undefined && (
          <SectionAccumulating
            dashboard={dashboard}
            since={section.availability.since}
            note={section.availability.note}
          />
        )}
      {(() => {
        if (state.status === 'ready') {
          if (state.kind === SectionKind.STAT_TILES) {
            return (
              <StatTilesSection
                dashboard={dashboard}
                section={state.section}
                data={state.data}
                period={state.period}
              />
            );
          }
          if (state.kind === SectionKind.TIME_SERIES) {
            return (
              <TimeSeriesSection
                dashboard={dashboard}
                section={state.section}
                data={state.data}
                slots={state.slots}
                period={state.period}
              />
            );
          }
          if (state.kind === SectionKind.CALENDAR_HEATMAP) {
            return (
              <CalendarHeatmapSection
                dashboard={dashboard}
                section={state.section}
                data={state.data}
                period={state.period}
              />
            );
          }
          if (state.kind === SectionKind.TABLE) {
            return (
              <TableSection
                dashboard={dashboard}
                section={state.section}
                data={state.data}
                urlState={urlState}
              />
            );
          }
          if (state.kind === SectionKind.BARS) {
            return (
              <BarsSection
                dashboard={dashboard}
                section={state.section}
                chart={state.chart}
              />
            );
          }
          if (state.kind === SectionKind.DONUT) {
            return (
              <DonutSection
                dashboard={dashboard}
                section={state.section}
                chart={state.chart}
              />
            );
          }
          if (state.kind === SectionKind.TREEMAP) {
            return (
              <TreemapSectionChart
                label={state.section.title}
                nodes={state.chart.nodes}
                tableHeaders={state.chart.tableHeaders}
                locale={dashboard.locale}
                currency={dashboard.currency}
                format={state.section.format}
                unit={state.section.unit}
              />
            );
          }
          if (state.kind === SectionKind.MATRIX_HEATMAP) {
            return (
              <MatrixHeatmapSection
                dashboard={dashboard}
                section={state.section}
                grid={state.grid}
              />
            );
          }
          if (state.kind === SectionKind.PIVOT_TABLE) {
            return (
              <PivotTableSection
                dashboard={dashboard}
                section={state.section}
                table={state.table}
              />
            );
          }
          return assertNever(state);
        }
        if (state.status === 'accumulating') {
          return (
            <SectionAccumulating
              dashboard={dashboard}
              since={state.since}
              availableFrom={state.availableFrom}
              note={state.note}
            />
          );
        }
        if (state.status === 'not-ready') {
          return <SectionNotReady dashboard={dashboard} note={state.note} />;
        }
        if (state.status === 'too-many-series') {
          return (
            <SectionTooManySeries
              dashboard={dashboard}
              count={state.count}
              maximum={state.maximum}
            />
          );
        }
        if (state.status === 'empty') {
          return <SectionEmpty />;
        }
        if (state.status === 'negative') {
          return <SectionNegativeComposition dashboard={dashboard} />;
        }
        if (state.status === 'too-large') {
          return <SectionTooLarge dashboard={dashboard} />;
        }
        if (state.status === 'unavailable') {
          return <SectionUnavailable />;
        }
        return assertNever(state);
      })()}
    </section>
  );
}
