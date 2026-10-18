import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { NavigationLink } from '../components/site-sidebar/SiteNavigation';
import { SiteSidebar } from '../components/site-sidebar/SiteSidebar';
import { createLoadDashboardsUseCase } from '../infrastructure';
import { dashboardLogger } from '../modules/dashboard/adapters/shared';

import './globals.css';

export const metadata: Metadata = {
  title: 'Observatory',
  description: 'A dashboard for observing accumulated personal data',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
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

  return (
    <html lang="en">
      <body className="bg-white">
        <div className="flex min-h-dvh flex-col lg:flex-row">
          <SiteSidebar links={links} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
