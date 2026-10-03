import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteHeader } from '../components/site-header/SiteHeader';
import type { NavigationLink } from '../components/site-header/SiteNavigation';
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
      <body>
        <SiteHeader links={links} />
        {children}
      </body>
    </html>
  );
}
