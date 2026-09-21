import type {
  DashboardDefinition,
  DateBounds,
  Section,
} from '../../modules/dashboard/domain';
import { SectionKind } from '../../modules/dashboard/domain';
import type {
  FetchSectionDataInput,
  SectionData,
} from '../../modules/dashboard/use-cases';
import { loadSectionState } from './loadSectionState';
import { SectionEmpty } from './SectionEmpty';
import { SectionUnavailable } from './SectionUnavailable';
import { StatTilesSection } from './sections/StatTilesSection';

interface Props {
  dashboard: DashboardDefinition;
  section: Section;
  periodBounds: Promise<DateBounds | null>;
  fetchSectionData: (
    input: FetchSectionDataInput
  ) => Promise<SectionData | null>;
}

function assertNever(value: never): never {
  throw new Error(`Unsupported dashboard section: ${JSON.stringify(value)}`);
}

export async function DashboardSection({
  dashboard,
  section,
  periodBounds,
  fetchSectionData,
}: Props) {
  const state = await loadSectionState({
    dashboard,
    section,
    periodBounds,
    fetchSectionData,
  });

  return (
    <section id={section.id} className="flex flex-col gap-normal">
      <h2 className="text-heading-3">{section.title}</h2>
      {(() => {
        if (state.status === 'ready') {
          if (section.kind === SectionKind.STAT_TILES) {
            return (
              <StatTilesSection
                dashboard={dashboard}
                section={section}
                data={state.data}
              />
            );
          }
          return assertNever(section.kind);
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
