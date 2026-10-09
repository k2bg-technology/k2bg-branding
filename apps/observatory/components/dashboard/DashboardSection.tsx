import type {
  DashboardDefinition,
  Section,
  UrlState,
} from '../../modules/dashboard/domain';
import { SectionKind } from '../../modules/dashboard/domain';
import type {
  DashboardPeriodResolution,
  FetchSectionDataInput,
  FetchTableRowsInput,
  SectionData,
  TableRows,
} from '../../modules/dashboard/use-cases';
import { loadSectionState } from './loadSectionState';
import { SectionEmpty } from './SectionEmpty';
import { SectionUnavailable } from './SectionUnavailable';
import { StatTilesSection } from './sections/StatTilesSection';
import { TableSection } from './sections/TableSection';
import { TimeSeriesSection } from './sections/TimeSeriesSection';

interface Props {
  dashboard: DashboardDefinition;
  section: Section;
  periodResolution: Promise<DashboardPeriodResolution | null>;
  fetchSectionData: (
    input: FetchSectionDataInput
  ) => Promise<SectionData | null>;
  fetchTableRows: (input: FetchTableRowsInput) => Promise<TableRows | null>;
  urlState: UrlState;
}

function assertNever(value: never): never {
  throw new Error(`Unsupported dashboard section: ${JSON.stringify(value)}`);
}

export async function DashboardSection({
  dashboard,
  section,
  periodResolution,
  fetchSectionData,
  fetchTableRows,
  urlState,
}: Props) {
  const state = await loadSectionState({
    dashboard,
    section,
    periodResolution,
    fetchSectionData,
    fetchTableRows,
    page: urlState.pages[section.id] ?? 1,
    selections: urlState.controls,
  });

  return (
    <section id={section.id} className="flex flex-col gap-normal">
      <h2 className="text-heading-3">{section.title}</h2>
      {(() => {
        if (state.status === 'ready') {
          if (state.kind === SectionKind.STAT_TILES) {
            return (
              <StatTilesSection
                dashboard={dashboard}
                section={state.section}
                data={state.data}
                period={state.resolution.period}
              />
            );
          }
          if (state.kind === SectionKind.TIME_SERIES) {
            return (
              <TimeSeriesSection
                dashboard={dashboard}
                section={state.section}
                data={state.data}
                period={state.resolution.period}
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
          return assertNever(state);
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
