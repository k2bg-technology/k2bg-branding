import type {
  DashboardDefinition,
  Section,
  UrlState,
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
import { loadSectionState } from './loadSectionState';
import { SectionAccumulating } from './SectionAccumulating';
import { SectionAsOf } from './SectionAsOf';
import { SectionEmpty } from './SectionEmpty';
import { SectionNotReady } from './SectionNotReady';
import { SectionUnavailable } from './SectionUnavailable';
import { BarsSection } from './sections/BarsSection';
import { CalendarHeatmapSection } from './sections/CalendarHeatmapSection';
import { StatTilesSection } from './sections/StatTilesSection';
import { TableSection } from './sections/TableSection';
import { TimeSeriesSection } from './sections/TimeSeriesSection';

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
        if (state.status === 'empty') {
          return <SectionEmpty />;
        }
        if (state.status === 'unavailable') {
          return <SectionUnavailable />;
        }
        return assertNever(state);
      })()}
    </section>
  );
}
