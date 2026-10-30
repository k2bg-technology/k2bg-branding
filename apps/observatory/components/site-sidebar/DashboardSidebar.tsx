import { connection } from 'next/server';

import { createLoadDashboardsUseCase } from '../../infrastructure';
import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type { NavigationLink } from './SiteNavigation';
import { SiteSidebar } from './SiteSidebar';

// Definition files are read at request time so navigation does not block the static shell.
export async function DashboardSidebar() {
  await connection();
  const { definitions } = await createLoadDashboardsUseCase()
    .execute()
    .catch((error: unknown) => {
      dashboardLogger.error(
        { err: error },
        'Failed to load dashboard navigation'
      );
      return { definitions: [], issues: [] };
    });
  const links: NavigationLink[] = [
    { href: '/', label: 'Overview' },
    ...definitions.map((definition) => ({
      href: `/dashboards/${definition.id}`,
      label: definition.title,
    })),
    { href: '/catalog', label: 'Table catalog' },
  ];

  return <SiteSidebar links={links} />;
}
