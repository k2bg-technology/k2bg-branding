import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { DashboardSection } from '../../../components/dashboard/DashboardSection';
import { SectionSkeleton } from '../../../components/dashboard/SectionSkeleton';
import {
  createFetchPeriodBoundsUseCase,
  createFetchSectionDataUseCase,
  createLoadDashboardsUseCase,
} from '../../../infrastructure/di/dashboard';
import { dashboardLogger } from '../../../modules/dashboard/adapters/shared';
import {
  type DashboardDefinition,
  type DateBounds,
  SectionWidth,
} from '../../../modules/dashboard/domain';
import type {
  FetchSectionDataInput,
  SectionData,
} from '../../../modules/dashboard/use-cases';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

const sectionWidthClassNames = {
  [SectionWidth.FULL]: 'lg:col-span-6',
  [SectionWidth.HALF]: 'lg:col-span-3',
  [SectionWidth.THIRD]: 'lg:col-span-2',
} as const;

function findDashboard(
  definitions: DashboardDefinition[],
  id: string
): DashboardDefinition | undefined {
  return definitions.find((definition) => definition.id === id);
}

async function loadPeriodBounds(
  dashboard: DashboardDefinition
): Promise<DateBounds | null> {
  return createFetchPeriodBoundsUseCase().execute(dashboard);
}

async function loadSectionData(
  input: FetchSectionDataInput
): Promise<SectionData | null> {
  return createFetchSectionDataUseCase().execute(input);
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const { definitions, issues } = await createLoadDashboardsUseCase().execute();
  issues.forEach((issue) => {
    dashboardLogger.warn({ issue }, 'Dashboard definition issue');
  });

  const dashboard = findDashboard(definitions, id);
  if (dashboard === undefined) {
    notFound();
  }

  const periodBounds = loadPeriodBounds(dashboard);

  return (
    <main className="flex min-h-screen flex-col gap-spacious bg-base-white p-spacious text-base-black">
      <header className="flex flex-col gap-condensed">
        <h1 className="text-heading-1">{dashboard.title}</h1>
        {dashboard.description && (
          <p className="text-body-r-md">{dashboard.description}</p>
        )}
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
                periodBounds={periodBounds}
                fetchSectionData={loadSectionData}
              />
            </Suspense>
          </div>
        ))}
      </div>
    </main>
  );
}
