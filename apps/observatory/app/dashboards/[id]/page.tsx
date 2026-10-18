import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DashboardControls } from '../../../components/dashboard/DashboardControls';
import { DashboardPeriodNavigation } from '../../../components/dashboard/DashboardPeriodNavigation';
import { DashboardSection } from '../../../components/dashboard/DashboardSection';
import { loadControlOptions } from '../../../components/dashboard/loadControlOptions';
import { SectionSkeleton } from '../../../components/dashboard/SectionSkeleton';
import { PageLayout } from '../../../components/page-layout';
import {
  createFetchBarsDataUseCase,
  createFetchCompositionDataUseCase,
  createFetchMatrixDataUseCase,
  createFetchPivotDataUseCase,
  createFetchRebaseBaseUseCase,
  createFetchScatterDataUseCase,
  createFetchSectionDataUseCase,
  createFetchTableRowsUseCase,
  createFetchTimeSeriesPivotUseCase,
  createLoadDashboardsUseCase,
  createResolveControlOptionsUseCase,
  createResolveDashboardPeriodUseCase,
  createResolveSectionGateUseCase,
} from '../../../infrastructure/di/dashboard';
import { dashboardLogger } from '../../../modules/dashboard/adapters/shared';
import {
  type DashboardDefinition,
  type Period,
  parseUrlState,
  type SearchParameters,
  SectionWidth,
} from '../../../modules/dashboard/domain';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParameters>;
}

const sectionWidthClassNames = {
  [SectionWidth.FULL]: undefined,
  [SectionWidth.HALF]: 'lg:col-span-3 xl:col-span-6',
  [SectionWidth.THIRD]: 'lg:col-span-2 xl:col-span-4',
} as const;

// Keep this async so synchronous factory failures reject the shared promise, rendering unavailable sections and disabled navigation.
async function loadPeriodResolution(
  dashboard: DashboardDefinition,
  requestedPeriod: Period | null
) {
  return createResolveDashboardPeriodUseCase().execute({
    dashboard,
    requestedPeriod,
  });
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { definitions, issues } = await createLoadDashboardsUseCase().execute();
  issues.forEach((issue) => {
    dashboardLogger.warn({ issue }, 'Dashboard definition issue');
  });

  const dashboard = definitions.find((definition) => definition.id === id);
  if (dashboard === undefined) {
    notFound();
  }
  const controlOptions = await loadControlOptions({
    dashboard,
    resolveControlOptions: (input) =>
      createResolveControlOptionsUseCase().execute(input),
  });
  const parsed = parseUrlState(await searchParams, dashboard, controlOptions);
  if (!parsed.valid) {
    notFound();
  }

  const periodResolution = loadPeriodResolution(dashboard, parsed.state.period);

  return (
    <PageLayout>
      <PageLayout.Header
        title={dashboard.title}
        description={dashboard.description}
        actions={
          <>
            <Suspense fallback={null}>
              <DashboardPeriodNavigation
                dashboard={dashboard}
                state={parsed.state}
                periodResolution={periodResolution}
              />
            </Suspense>
            <DashboardControls
              dashboard={dashboard}
              state={parsed.state}
              controlOptions={controlOptions}
            />
          </>
        }
      />
      {dashboard.sections.map((section) => (
        <PageLayout.Content
          key={section.id}
          className={sectionWidthClassNames[section.width ?? SectionWidth.FULL]}
        >
          <Suspense fallback={<SectionSkeleton />}>
            <DashboardSection
              dashboard={dashboard}
              section={section}
              periodResolution={periodResolution}
              resolveSectionGate={(input) =>
                createResolveSectionGateUseCase().execute(input)
              }
              fetchSectionData={(input) =>
                createFetchSectionDataUseCase().execute(input)
              }
              fetchTableRows={(input) =>
                createFetchTableRowsUseCase().execute(input)
              }
              fetchBarsData={(input) =>
                createFetchBarsDataUseCase().execute(input)
              }
              fetchCompositionData={(input) =>
                createFetchCompositionDataUseCase().execute(input)
              }
              fetchMatrixData={(input) =>
                createFetchMatrixDataUseCase().execute(input)
              }
              fetchTimeSeriesPivot={(input) =>
                createFetchTimeSeriesPivotUseCase().execute(input)
              }
              fetchPivotData={(input) =>
                createFetchPivotDataUseCase().execute(input)
              }
              fetchRebaseBase={(input) =>
                createFetchRebaseBaseUseCase().execute(input)
              }
              fetchScatterData={(input) =>
                createFetchScatterDataUseCase().execute(input)
              }
              urlState={parsed.state}
            />
          </Suspense>
        </PageLayout.Content>
      ))}
    </PageLayout>
  );
}
