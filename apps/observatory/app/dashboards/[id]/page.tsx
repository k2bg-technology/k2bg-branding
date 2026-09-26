import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { DashboardPeriodNavigation } from '../../../components/dashboard/DashboardPeriodNavigation';
import { DashboardSection } from '../../../components/dashboard/DashboardSection';
import { SectionSkeleton } from '../../../components/dashboard/SectionSkeleton';
import {
  createFetchSectionDataUseCase,
  createLoadDashboardsUseCase,
  createResolveDashboardPeriodUseCase,
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
  [SectionWidth.FULL]: 'lg:col-span-6',
  [SectionWidth.HALF]: 'lg:col-span-3',
  [SectionWidth.THIRD]: 'lg:col-span-2',
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
  const parsed = parseUrlState(await searchParams, dashboard);
  if (!parsed.valid) {
    notFound();
  }

  const periodResolution = loadPeriodResolution(dashboard, parsed.state.period);

  return (
    <main className="flex min-h-screen flex-col gap-spacious bg-base-white p-spacious text-base-black">
      <header className="flex flex-col gap-condensed">
        <h1 className="text-heading-1">{dashboard.title}</h1>
        {dashboard.description && (
          <p className="text-body-r-md">{dashboard.description}</p>
        )}
        <Suspense fallback={null}>
          <DashboardPeriodNavigation
            dashboard={dashboard}
            state={parsed.state}
            periodResolution={periodResolution}
          />
        </Suspense>
      </header>
      <div className="grid grid-cols-1 gap-spacious lg:grid-cols-6">
        {dashboard.sections.map((section) => (
          <div
            key={section.id}
            className={
              sectionWidthClassNames[section.width ?? SectionWidth.FULL]
            }
          >
            <Suspense fallback={<SectionSkeleton />}>
              <DashboardSection
                dashboard={dashboard}
                section={section}
                periodResolution={periodResolution}
                fetchSectionData={(input) =>
                  createFetchSectionDataUseCase().execute(input)
                }
              />
            </Suspense>
          </div>
        ))}
      </div>
    </main>
  );
}
