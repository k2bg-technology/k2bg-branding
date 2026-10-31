import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardSidebar } from '../components/site-sidebar/DashboardSidebar';
import { SiteSidebar } from '../components/site-sidebar/SiteSidebar';

import './globals.css';

export const metadata: Metadata = {
  title: 'Observatory',
  description: 'A dashboard for observing accumulated personal data',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body className="bg-white">
        <div className="flex min-h-dvh flex-col lg:flex-row">
          <Suspense
            fallback={
              <SiteSidebar
                links={[
                  { href: '/', label: 'Overview' },
                  { href: '/catalog', label: 'Table catalog' },
                ]}
              />
            }
          >
            <DashboardSidebar />
          </Suspense>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
